<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Queue extends Model
{
    use HasFactory;

    protected $fillable = ['customer_name', 'party_size', 'status', 'arrived_at'];

    protected $casts = [
        'party_size' => 'integer',
        'arrived_at' => 'datetime',
    ];

    public function diningSession(): HasOne
    {
        return $this->hasOne(DiningSession::class);
    }
}
