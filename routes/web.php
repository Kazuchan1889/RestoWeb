<?php

use App\Http\Controllers\Api\QueueController;
use Illuminate\Support\Facades\Route;

// API Routes (must come before catch-all)
Route::prefix('api')->group(function () {
    Route::post('/arrive', [QueueController::class, 'arrive']);
    Route::get('/status', [QueueController::class, 'status']);
    Route::post('/serve', [QueueController::class, 'serve']);
    Route::get('/history', [QueueController::class, 'history']);
    Route::post('/assign', [QueueController::class, 'assign']);
    Route::post('/transfer', [QueueController::class, 'transfer']);
});

// SPA catch-all (must be last)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
