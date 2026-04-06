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
}