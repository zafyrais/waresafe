<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

use App\Models\Alert;
use App\Models\AttackScenario;
use App\Models\Device;
use App\Models\Sensor;
use App\Models\SensorData;
use App\Models\Zone;

class DashboardController extends Controller
{
    private function getLatestSensorData(int $sensorId)
    {
        return DB::table('sensor_data')
            ->where('sensor_id', $sensorId)
            ->latest('timestamp')
            ->first();
    }

    public function getSensors()
    {
        return Sensor::all();
    }

    public function getSensorData()
    {
        return SensorData::orderByDesc('timestamp')
            ->limit(50)
            ->get();
    }

    public function getAlerts()
    {
        return Alert::orderByDesc('timestamp')
            ->limit(50)
            ->get();
    }

    public function getDashboardStatus()
    {
        return response()->json([
            'pir' => $this->getLatestSensorData(1),
            'reedA' => $this->getLatestSensorData(2),
            'vibration' => $this->getLatestSensorData(3),
            'rfid' => $this->getLatestSensorData(5),
            'reedB' => $this->getLatestSensorData(6),
            'lcd' => $this->getLatestSensorData(11),
        ]);
    }

    public function getStatistics()
    {
        return response()->json([
            'total_sensors' => Sensor::count(),
            'total_devices' => Device::count(),
            'total_zones' => Zone::count(),
            'total_attacks' => AttackScenario::count(),
            'total_alerts' => Alert::count(),
        ]);
    }
}