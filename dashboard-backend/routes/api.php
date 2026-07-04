<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\AttackController;

Route::get('/attacks', [AttackController::class, 'getAttackRecords']);


Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::get('/office/sensors', [OfficeController::class, 'getOfficeSensorData']);
Route::get('/office/alerts', [OfficeController::class, 'getOfficeAlerts']);
Route::get('/office/vibration', [OfficeController::class, 'getOfficeVibrationData']);
Route::get('/office/buzzerA', [OfficeController::class, 'getOfficeBuzzerData']);

Route::get('/warehouse/sensors', [WarehouseController::class, 'getWarehouseSensorData']);
Route::get('/warehouse/door', [WarehouseController::class, 'getWarehouseDoorLogs']);
Route::get('/warehouse/security-devices', [WarehouseController::class, 'getWarehouseSecurityDevices']);
Route::get('/warehouse/rfid', [WarehouseController::class, 'getWarehouseRfidData']);
Route::get('/warehouse/alerts', [WarehouseController::class, 'getWarehouseAlerts']);
Route::get('/warehouse/lcd', [WarehouseController::class, 'getWarehouseLcdLogs']);

Route::get('/sensor-data', [DashboardController::class, 'getSensorData']);
Route::get('/sensors', [DashboardController::class, 'getSensors']);
Route::get('/dashboard/status', [DashboardController::class, 'getDashboardStatus']);
Route::get('/statistics', [DashboardController::class, 'getStatistics']);
Route::get('/attacks', [DashboardController::class, 'getCyberAttackRecords']);
Route::get('/alerts', [DashboardController::class, 'getAlerts']);
Route::get('/mitigation',[MitigationController::class,'getMitigationEducation']);
Route::get('/zone-sensor-counts', [DashboardController::class, 'getZoneSensorCounts']);