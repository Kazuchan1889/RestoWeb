<?php

namespace App\Services;

use App\Models\DiningSession;
use App\Models\Queue;
use App\Models\RestaurantTable;
use Carbon\Carbon;

class QueueService
{
    /**
     * Find the optimal (smallest fitting) available table for a given party size.
     */
    public function findOptimalTable(int $partySize): ?RestaurantTable
    {
        return RestaurantTable::where('status', 'available')
            ->where('capacity', '>=', $partySize)
            ->orderBy('capacity', 'asc')
            ->first();
    }

    /**
     * Calculate dining duration: (partySize * 15) + random(5, 15) minutes.
     */
    public function calculateDiningDuration(int $partySize): int
    {
        return ($partySize * 15) + rand(5, 15);
    }

    /**
     * Get waiting queue ordered by priority: largest party first, then earliest arrival.
     */
    public function getPriorityQueue()
    {
        return Queue::where('status', 'waiting')
            ->orderBy('party_size', 'desc')
            ->orderBy('arrived_at', 'asc')
            ->get();
    }

    /**
     * Seat a party at a specific table.
     */
    public function seatParty(Queue $queueEntry, RestaurantTable $table): DiningSession
    {
        $duration = $this->calculateDiningDuration($queueEntry->party_size);
        $now = Carbon::now();

        $queueEntry->update(['status' => 'seated']);
        $table->update(['status' => 'dining']);

        return DiningSession::create([
            'restaurant_table_id' => $table->id,
            'queue_id' => $queueEntry->id,
            'party_size' => $queueEntry->party_size,
            'started_at' => $now,
            'duration_minutes' => $duration,
            'estimated_end_at' => $now->copy()->addMinutes($duration),
            'status' => 'active',
        ]);
    }

    /**
     * Complete a dining session and free the table.
     * Then auto-assign the next eligible party from the priority queue.
     */
    public function completeDining(DiningSession $session): void
    {
        $session->update(['status' => 'completed']);

        $table = $session->restaurantTable;
        $table->update(['status' => 'available']);

        $queueEntry = $session->queue;
        $queueEntry->update(['status' => 'completed']);

        // Auto-assign next eligible party from the priority queue
        $this->autoAssignQueue();
    }

    /**
     * Try to assign waiting parties from the priority queue to available tables.
     */
    public function autoAssignQueue(): void
    {
        $waitingParties = $this->getPriorityQueue();

        foreach ($waitingParties as $party) {
            $table = $this->findOptimalTable($party->party_size);
            if ($table) {
                $this->seatParty($party, $table);
            }
        }
    }

    /**
     * Transfer an active dining session from one table to another available table.
     */
    public function transferSession(DiningSession $session, RestaurantTable $toTable): DiningSession
    {
        $fromTable = $session->restaurantTable;
        $fromTable->update(['status' => 'available']);

        $toTable->update(['status' => 'dining']);
        $session->update(['restaurant_table_id' => $toTable->id]);

        return $session->fresh();
    }

    /**
     * Process a new arrival: try to seat immediately (at preferred table or optimal table), otherwise add to queue.
     */
    public function processArrival(string $customerName, int $partySize, ?int $preferredTableId = null): array
    {
        $queueEntry = Queue::create([
            'customer_name' => $customerName,
            'party_size' => $partySize,
            'status' => 'waiting',
            'arrived_at' => Carbon::now(),
        ]);

        $table = null;

        if ($preferredTableId) {
            $candidate = RestaurantTable::where('id', $preferredTableId)
                ->where('status', 'available')
                ->where('capacity', '>=', $partySize)
                ->first();
            if ($candidate) {
                $table = $candidate;
            }
        }

        if (!$table) {
            $table = $this->findOptimalTable($partySize);
        }

        if ($table) {
            $session = $this->seatParty($queueEntry, $table);
            return [
                'status' => 'seated',
                'table' => $table->fresh(),
                'session' => $session,
                'queue' => $queueEntry->fresh(),
            ];
        }

        return [
            'status' => 'queued',
            'queue' => $queueEntry,
            'position' => $this->getQueuePosition($queueEntry),
        ];
    }

    /**
     * Get the position of a queue entry in the priority queue.
     */
    public function getQueuePosition(Queue $entry): int
    {
        $waitingParties = $this->getPriorityQueue();
        $position = 1;
        foreach ($waitingParties as $party) {
            if ($party->id === $entry->id) {
                return $position;
            }
            $position++;
        }
        return $position;
    }
}
