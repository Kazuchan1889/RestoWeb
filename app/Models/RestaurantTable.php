<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantTable extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'capacity', 'status'];

    protected $casts = [
        'capacity' => 'integer',
    ];

    public function diningSessions(): HasMany
    {
        return $this->hasMany(DiningSession::class);
    }

    public function activeSession()
    {
        return $this->hasOne(DiningSession::class)->where('status', 'active');
    }
}
