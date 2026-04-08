<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash; // Added for password checking

class DashboardController extends Controller
{
    // Fetch the latest 20 sensor readings
    public function getSensorData() 
    {
        $data = DB::table('sensor_data')->orderBy('timestamp', 'desc')->limit(20)->get();
        return response()->json($data);
    }

    // Fetch all critical alerts
    public function getAlerts() 
    {
        $alerts = DB::table('alerts')->orderBy('timestamp', 'desc')->get();
        return response()->json($alerts);
    }

    // Fetch all critical alerts
    public function getSensors() 
    {
        $sensors = DB::table('sensors')->orderBy('sensor_id', 'desc')->get();
        return response()->json($sensors);
    }

    // NEW: The Login and Logging Function
    public function login(Request $request)
    {
        // 1. Find the user in the database by their email
        $user = DB::table('users')->where('email', $request->email)->first();

        // 2. If the user exists AND the password matches the encrypted one in the DB
        if ($user && Hash::check($request->password, $user->password)) {
            
            // 3. Write the exact action into the user_activity_logs drawer
            DB::table('user_activity_logs')->insert([
                'user_id' => $user->user_id,
                'action_type' => $user->name . ' login', // e.g., "Security Admin login"
                'timestamp' => now()
            ]);

            // 4. Tell React it was successful
            return response()->json([
                'success' => true,
                'user_name' => $user->name
            ]);
        }

        // 5. If it fails, tell React they are unauthorized
        return response()->json([
            'success' => false,
            'message' => 'Invalid email or password'
        ], 401);
    }

    // NEW: The Logout Logging Function
    public function logout(Request $request)
    {
        // Find the user by their email
        $user = DB::table('users')->where('email', $request->email)->first();

        if ($user) {
            // Write the exact action into the user_activity_logs drawer
            DB::table('user_activity_logs')->insert([
                'user_id' => $user->user_id,
                'action_type' => $user->name . ' logout', // e.g., "Security Admin logout"
                'timestamp' => now()
            ]);

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'User not found'], 404);
    }

    // Compile all data specifically for the Warehouse RFID table
    public function getWarehouseRfidData()
    {
        $data = DB::table('sensor_data')
            // 1. Join the sensor table to get the sensor type
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            // 2. Join the device table to get the device info
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            // 3. Join the zone table to filter by location
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            
            // Filter: Only Warehouse zone AND only RFID sensors
            ->where('zones.zone_name', 'Warehouse')
            ->where('sensors.sensor_type', 'RFID')
            
            // Select exactly what we want to send to React to avoid confusing duplicates
            ->select(
                'sensor_data.data_id',
                'sensors.sensor_id',
                'sensors.sensor_type',
                'devices.device_type',
                'sensor_data.value', // This will be your "Description"
                'sensor_data.timestamp'
            )
            ->orderBy('sensor_data.timestamp', 'desc')
            ->get();

        return response()->json($data);
    }

    public function getOfficeRfidData()
    {
        $data = DB::table('sensor_data')
            // 1. Join the sensor table to get the sensor type
            ->join('sensors', 'sensor_data.sensor_id', '=', 'sensors.sensor_id')
            // 2. Join the device table to get the device info
            ->join('devices', 'sensors.device_id', '=', 'devices.device_id')
            // 3. Join the zone table to filter by location
            ->join('zones', 'devices.zone_id', '=', 'zones.zone_id')
            
            // Filter: Only Office zone AND only RFID sensors
            ->where('zones.zone_name', 'Office')
            ->where('sensors.sensor_type', 'RFID')
            
            // Select exactly what we want to send to React to avoid confusing duplicates
            ->select(
                'sensor_data.data_id',
                'sensors.sensor_id',
                'sensors.sensor_type',
                'devices.device_type',
                'sensor_data.value', // This will be your "Description"
                'sensor_data.timestamp'
            )
            ->orderBy('sensor_data.timestamp', 'desc')
            ->get();

        return response()->json($data);
    }
}