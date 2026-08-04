<?php

namespace Database\Seeders;

use App\Models\DiningSession;
use App\Models\Queue;
use App\Models\RestaurantTable;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            ['name' => 'A', 'capacity' => 2, 'status' => 'available'],
            ['name' => 'B', 'capacity' => 4, 'status' => 'available'],
            ['name' => 'C', 'capacity' => 6, 'status' => 'available'],
            ['name' => 'D', 'capacity' => 8, 'status' => 'available'],
        ];

        foreach ($tables as $table) {
            RestaurantTable::updateOrCreate(
                ['name' => $table['name']],
                $table
            );
        }

        // Seed sample historical completed sessions
        $tableA = RestaurantTable::where('name', 'A')->first();
        $tableB = RestaurantTable::where('name', 'B')->first();
        $tableC = RestaurantTable::where('name', 'C')->first();

        $historySamples = [
            [
                'customer_name' => 'David Beckham',
                'party_size' => 2,
                'table' => $tableA,
                'started_hours_ago' => 3,
                'duration' => 40,
            ],
            [
                'customer_name' => 'Michael Jordan',
                'party_size' => 4,
                'table' => $tableB,
                'started_hours_ago' => 2,
                'duration' => 65,
            ],
            [
                'customer_name' => 'Serena Williams',
                'party_size' => 6,
                'table' => $tableC,
                'started_hours_ago' => 1,
                'duration' => 85,
            ],
        ];

        foreach ($historySamples as $sample) {
            $queue = Queue::create([
                'customer_name' => $sample['customer_name'],
                'party_size' => $sample['party_size'],
                'status' => 'completed',
                'arrived_at' => Carbon::now()->subHours($sample['started_hours_ago'])->subMinutes(10),
            ]);

            $startedAt = Carbon::now()->subHours($sample['started_hours_ago']);

            DiningSession::create([
                'restaurant_table_id' => $sample['table']->id,
                'queue_id' => $queue->id,
                'party_size' => $sample['party_size'],
                'started_at' => $startedAt,
                'duration_minutes' => $sample['duration'],
                'estimated_end_at' => $startedAt->copy()->addMinutes($sample['duration']),
                'status' => 'completed',
            ]);
        }
    }
}
