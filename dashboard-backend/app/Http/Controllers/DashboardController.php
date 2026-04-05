<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // We need this to talk to the database

class DashboardController extends Controller
{
    // Fetch the latest 20 sensor readings
    public function getSensorData() 
    {
        $data = DB::table('sensor_data')
            ->orderBy('timestamp', 'desc') // Get the newest ones first
            ->limit(20) // Only grab 20 so we don't overwhelm the frontend
            ->get();
            
        return response()->json($data); // Translate it to JSON for React
    }

    // Fetch all the critical security alerts
    public function getAlerts() 
    {
        $alerts = DB::table('alerts')
            ->orderBy('timestamp', 'desc')
            ->get();
            
        return response()->json($alerts);
    }
}
