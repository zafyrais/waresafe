<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController; // Point to our new controller

// When React visits /api/sensor-data, run the getSensorData function
Route::get('/sensor-data', [DashboardController::class, 'getSensorData']);

// When React visits /api/alerts, run the getAlerts function
Route::get('/alerts', [DashboardController::class, 'getAlerts']);
