<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // Added for password checking

class DashboardController extends Controller
{
    // Fetch the latest 20 sensor readings
    public function getOfficeSensorData()
{
    $data = DB::table('sensor_data')
        ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
        ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
        ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
        ->where('zones.zone_name', 'Office')
        ->whereIn('sensors.sensor_type', [
            'PIR Motion',
            'Door Reed Switch A',
            'Vibration Sensor',
            'Buzzer A'
        ])
        ->select(
            'sensor_data.data_id',
            'sensors.sensor_id',
            'sensors.sensor_type',
            'devices.device_type',
            'zones.zone_name',
            'sensor_data.value',
            'sensor_data.timestamp'
        )
        ->orderBy('sensor_data.timestamp', 'desc')
        ->limit(50)
        ->get();

    return response()->json($data);
}

public function getWarehouseSensorData()
{
    $data = DB::table('sensor_data')
        ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
        ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
        ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
        ->where('zones.zone_name', 'Warehouse')
        ->whereIn('sensors.sensor_type', [
            'RFID',
            'RFID RC522',
            'Door Reed',
            'Reed Switch',
            'Warehouse Door',
            'Alarm Module',
            'LED',
            'Buzzer',
            'LCD'
        ])
        ->select(
            'sensor_data.data_id',
            'sensors.sensor_id',
            'sensors.sensor_type',
            'devices.device_type',
            'zones.zone_name',
            'sensor_data.value',
            'sensor_data.timestamp'
        )
        ->orderBy('sensor_data.timestamp', 'desc')
        ->limit(50)
        ->get();

    return response()->json($data);
}
public function getOfficeVibrationData()
{
    $data = DB::table('sensor_data')
        ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
        ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
        ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
        ->where('zones.zone_name', 'Office')
        ->where('sensors.sensor_type', '3')
        ->select(
            'sensor_data.data_id',
            'sensors.sensor_id',
            'sensors.sensor_type',
            'devices.device_type',
            'zones.zone_name',
            'sensor_data.value',
            'sensor_data.timestamp'
        )
        ->orderBy('sensor_data.timestamp', 'desc')
        ->limit(20)
        ->get();

    return response()->json($data);
}
public function getOfficeBuzzerData()
{
    $data = DB::table('sensor_data')
        ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
        ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
        ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
        ->where('zones.zone_name', 'Office')
        ->where('sensors.sensor_type', '4')
        ->select(
            'sensor_data.data_id',
            'sensors.sensor_id',
            'sensors.sensor_type',
            'devices.device_type',
            'zones.zone_name',
            'sensor_data.value',
            'sensor_data.timestamp'
        )
        ->orderBy('sensor_data.timestamp', 'desc')
        ->limit(50)
        ->get();

    return response()->json($data);
}
public function getOfficeAlerts()
{
    $alerts = DB::table('alerts')
        ->leftJoin('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
        ->leftJoin('devices', 'sensors.device_id', '=', 'devices.device_id')
        ->leftJoin('zones', 'devices.zone_id', '=', 'zones.zone_id')
        ->where('zones.zone_name', 'Office')
        ->whereIn('alerts.alert_type', [
            'abnormal_vibration_detected',
            'vibration_data_anomaly_detected',
            'danger_vibration_alert',
            'danger_vibration_detected',
            'area_a_danger_triggered',
            'manual_abnormal_vibration_triggered',
            'vibration_alert',
            'security_event'
        ])
        ->select(
            'alerts.alert_id',
            'alerts.alert_type',
            'sensors.sensor_id',
            'sensors.sensor_type',
            'devices.device_type',
            'zones.zone_name',
            'alerts.timestamp'
        )
        ->orderBy('alerts.timestamp', 'desc')
        ->limit(50)
        ->get();

    return response()->json($alerts);
}

public function getWarehouseAlerts()
{
    $alerts = DB::table('alerts')
        ->leftJoin('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
        ->leftJoin('devices', 'sensors.device_id', '=', 'devices.device_id')
        ->leftJoin('zones', 'devices.zone_id', '=', 'zones.zone_id')
        ->where('zones.zone_name', 'Warehouse')
        ->whereIn('alerts.alert_type', [
            'alarm_alert',
            'false_alarm_flood',
            'security_suppression',
            'alert_bypass',
            'security_event'
        ])
        ->select(
            'alerts.alert_id',
            'alerts.alert_type',
            'sensors.sensor_type',
            'devices.device_type',
            'zones.zone_name',
            'alerts.timestamp'
        )
        ->orderBy('alerts.timestamp', 'desc')
        ->get();

    return response()->json($alerts);
}
}