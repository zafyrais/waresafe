<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class WarehouseController extends Controller
{
    private function warehouseSensorQuery()
    {
        return DB::table('sensor_data')
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', 'Warehouse');
    }

    private function warehouseSelect()
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
    public function getWarehouseLcdLogs()
    {
        return $this->warehouseSensorQuery()
            ->where('sensor_data.sensor_id', 11)
            ->select($this->warehouseSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getWarehouseRfidData()
    {
        return $this->warehouseSensorQuery()
            ->where('sensor_data.sensor_id', 5)
            ->select($this->warehouseSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getWarehouseDoorLogs()
    {
        return $this->warehouseSensorQuery()
            ->where('sensor_data.sensor_id', 6)
            ->select($this->warehouseSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getWarehouseSensorData()
    {
        return $this->warehouseSensorQuery()
            ->whereIn('sensor_data.sensor_id', [5, 6])
            ->select($this->warehouseSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getWarehouseSecurityDevices()
    {
        return $this->warehouseSensorQuery()
            ->whereIn('sensor_data.sensor_id', [7, 8, 9, 10])
            ->select($this->warehouseSelect())
            ->orderByDesc('sensor_data.timestamp')
            ->limit(50)
            ->get();
    }

    public function getWarehouseAlerts()
    {
        return DB::table('alerts')
            ->leftJoin('attack_scenarios', 'alerts.attack_id', '=', 'attack_scenarios.attack_id')
            ->leftJoin('sensors', 'alerts.sensor_id', '=', 'sensors.sensor_id')
            ->leftJoin('devices', 'sensors.device_id', '=', 'devices.device_id')
            ->leftJoin('zones', 'devices.zone_id', '=', 'zones.zone_id')
            ->where('zones.zone_name', 'Warehouse')
            ->select(
                'alerts.alert_id',
                'alerts.alert_type',
                'alerts.timestamp',
                'attack_scenarios.attack_type',
                'sensors.sensor_id',
                'sensors.sensor_type',
                'devices.device_type',
                'zones.zone_name'
            )
            ->orderByDesc('alerts.timestamp')
            ->limit(50)
            ->get();
    }
}