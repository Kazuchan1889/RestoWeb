<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiningSession;
use App\Models\Queue;
use App\Models\RestaurantTable;
use App\Services\QueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QueueController extends Controller
{
    public function __construct(
        private QueueService $queueService
    ) {}

    /**
     * POST /api/arrive
     * Register a new party arrival.
     */
    public function arrive(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'party_size' => 'required|integer|min:1|max:8',
            'table_id' => 'nullable|integer|exists:restaurant_tables,id',
        ]);

        $result = $this->queueService->processArrival(
            $validated['customer_name'],
            $validated['party_size'],
            $validated['table_id'] ?? null
        );

        $statusCode = $result['status'] === 'seated' ? 200 : 201;

        return response()->json($result, $statusCode);
    }

    /**
     * GET /api/status
     * Get current restaurant status: tables, active sessions, and waiting queue.
     */
    public function status(): JsonResponse
    {
        $tables = RestaurantTable::with(['activeSession.queue'])->get()->map(function ($table) {
            $data = [
                'id' => $table->id,
                'name' => $table->name,
                'capacity' => $table->capacity,
                'status' => $table->status,
            ];

            if ($table->activeSession) {
                $session = $table->activeSession;
                $data['session'] = [
                    'id' => $session->id,
                    'customer_name' => $session->queue->customer_name,
                    'party_size' => $session->party_size,
                    'started_at' => $session->started_at->toIso8601String(),
                    'duration_minutes' => $session->duration_minutes,
                    'estimated_end_at' => $session->estimated_end_at->toIso8601String(),
                    'remaining_seconds' => max(0, $session->estimated_end_at->diffInSeconds(now(), false) * -1),
                ];
            }

            return $data;
        });

        $queue = $this->queueService->getPriorityQueue()->map(function ($entry, $index) {
            return [
                'id' => $entry->id,
                'customer_name' => $entry->customer_name,
                'party_size' => $entry->party_size,
                'arrived_at' => $entry->arrived_at->toIso8601String(),
                'position' => $index + 1,
            ];
        });

        return response()->json([
            'tables' => $tables,
            'queue' => $queue->values(),
        ]);
    }

    /**
     * POST /api/serve
     * Force-complete a dining session (by session_id or table_id).
     */
    public function serve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required_without:table_id|integer|exists:dining_sessions,id',
            'table_id' => 'required_without:session_id|integer|exists:restaurant_tables,id',
        ]);

        if (isset($validated['session_id'])) {
            $session = DiningSession::where('id', $validated['session_id'])
                ->where('status', 'active')
                ->first();
        } else {
            $session = DiningSession::where('restaurant_table_id', $validated['table_id'])
                ->where('status', 'active')
                ->first();
        }

        if (!$session) {
            return response()->json([
                'error' => 'No active dining session found.',
            ], 404);
        }

        $this->queueService->completeDining($session);

        return response()->json([
            'message' => 'Dining session completed successfully.',
            'session' => $session->fresh()->load('restaurantTable', 'queue'),
        ]);
    }

    /**
     * GET /api/history
     * Get completed dining sessions with filtering and sorting.
     */
    public function history(Request $request): JsonResponse
    {
        $query = DiningSession::with(['restaurantTable', 'queue'])
            ->where('status', 'completed');

        // Filter by table name
        if ($request->filled('table')) {
            $query->whereHas('restaurantTable', function ($q) use ($request) {
                $q->where('name', $request->input('table'));
            });
        }

        // Filter by party size
        if ($request->filled('party_size')) {
            $query->where('party_size', $request->input('party_size'));
        }

        // Search by customer name
        if ($request->filled('search')) {
            $query->whereHas('queue', function ($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->input('search') . '%');
            });
        }

        // Sort
        $sortBy = $request->input('sort_by', 'started_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['started_at', 'party_size', 'duration_minutes'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $sessions = $query->paginate($request->input('per_page', 20));

        return response()->json($sessions);
    }

    /**
     * POST /api/assign
     * Manually assign a waiting party to a specific table (for drag & drop).
     */
    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'queue_id' => 'required|integer|exists:queues,id',
            'table_id' => 'required|integer|exists:restaurant_tables,id',
        ]);

        $queueEntry = Queue::where('id', $validated['queue_id'])
            ->where('status', 'waiting')
            ->first();

        if (!$queueEntry) {
            return response()->json(['error' => 'Queue entry not found or not waiting.'], 404);
        }

        $table = RestaurantTable::where('id', $validated['table_id'])
            ->where('status', 'available')
            ->first();

        if (!$table) {
            return response()->json(['error' => 'Table is not available.'], 409);
        }

        if ($queueEntry->party_size > $table->capacity) {
            return response()->json([
                'error' => "Party size ({$queueEntry->party_size}) exceeds table capacity ({$table->capacity}).",
            ], 422);
        }

        $session = $this->queueService->seatParty($queueEntry, $table);

        return response()->json([
            'message' => 'Party assigned successfully.',
            'session' => $session->load('restaurantTable', 'queue'),
        ]);
    }

    /**
     * POST /api/transfer
     * Move an active dining customer from one table to another.
     */
    public function transfer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|integer|exists:dining_sessions,id',
            'to_table_id' => 'required|integer|exists:restaurant_tables,id',
        ]);

        $session = DiningSession::where('id', $validated['session_id'])
            ->where('status', 'active')
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Active dining session not found.'], 404);
        }

        $toTable = RestaurantTable::where('id', $validated['to_table_id'])
            ->where('status', 'available')
            ->first();

        if (!$toTable) {
            return response()->json(['error' => 'Target table is not available.'], 409);
        }

        if ($session->party_size > $toTable->capacity) {
            return response()->json([
                'error' => "Party size ({$session->party_size}) exceeds table capacity ({$toTable->capacity}).",
            ], 422);
        }

        $updatedSession = $this->queueService->transferSession($session, $toTable);

        return response()->json([
            'message' => "Transferred customer to Table {$toTable->name}.",
            'session' => $updatedSession->load('restaurantTable', 'queue'),
        ]);
    }
}
