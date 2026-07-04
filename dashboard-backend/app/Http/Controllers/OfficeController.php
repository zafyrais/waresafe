<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class OfficeController extends Controller
{
    private function officeSensorQuery()
    {
        return DB::table('sensor_data')
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', 'Office');
    }

    private function officeSelect()
{
    return [
        'sensor_data.data_id',
        'sensor_data.value',
        'sensor_data.timestamp',
        'sensors.sensor_id',
        'sensors.sensor_type',
        'devices.device_type',
        'zones.zone_name',
    ];
}

    public function getOfficeSensorData()
    {
        return $this->officeSensorQuery()
            ->whereIn('sensor_data.sensor_id', [1, 2, 3])
            ->select($this->officeSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getOfficeDoorLogs()
    {
        return $this->officeSensorQuery()
            ->where('sensor_data.sensor_id', 2)
            ->select($this->officeSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getOfficeVibrationData()
    {
        return $this->officeSensorQuery()
            ->where('sensor_data.sensor_id', 3)
            ->select($this->officeSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getOfficeAlerts()
    {
        return DB::table('alerts')
            ->join('zones', 'alerts.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', 'Office')
            ->select($this->officeSelect())
            ->orderByDesc('alerts.timestamp')
            ->limit(50)
            ->get();
    }

    public function getOfficeBuzzerData()
    {
        return $this->officeSensorQuery()
            ->where('sensors.sensor_type', 'Buzzer A')
            ->select($this->officeSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }
}