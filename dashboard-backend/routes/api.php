<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController; // Point to our new controller

// When React visits /api/sensor-data, run the getSensorData function
Route::get('/sensor-data', [DashboardController::class, 'getSensorData']);

// When React visits /api/alerts, run the getAlerts function
Route::get('/alerts', [DashboardController::class, 'getAlerts']);

// When React visits /api/sensors, run the getSensors function
Route::get('/sensors', [DashboardController::class, 'getSensors']);

// The Login route
Route::post('/login', [DashboardController::class, 'login']);

// The Logout route
Route::post('/logout', [DashboardController::class, 'logout']);

Route::get('/office/sensors', [DashboardController::class, 'getOfficeSensorData']);
Route::get('/office/alerts', [DashboardController::class, 'getOfficeAlerts']);
Route::get('/office/vibration', [DashboardController::class, 'getOfficeVibrationData']);
Route::get('/office/buzzerA', [DashboardController::class, 'getOfficeBuzzerData']); // BuZZERA ternyata belum ada subscribernya di MQTTX

Route::get('/warehouse/sensors', [DashboardController::class, 'getWarehouseSensorData']);
Route::get('/warehouse/rfid', [DashboardController::class, 'getWarehouseRfidData']);
Route::get('/warehouse/alerts', [DashboardController::class, 'getWarehouseAlerts']);

Route::get('/attacks', [DashboardController::class, 'getCyberAttack']);