<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiningSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'restaurant_table_id',
        'queue_id',
        'party_size',
        'started_at',
        'duration_minutes',
        'estimated_end_at',
        'status',
    ];

    protected $casts = [
        'party_size' => 'integer',
        'duration_minutes' => 'integer',
        'started_at' => 'datetime',
        'estimated_end_at' => 'datetime',
    ];

    public function restaurantTable(): BelongsTo
    {
        return $this->belongsTo(RestaurantTable::class);
    }

    public function queue(): BelongsTo
    {
        return $this->belongsTo(Queue::class);
    }
}
