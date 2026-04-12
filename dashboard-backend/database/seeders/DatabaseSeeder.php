<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // We added this so we can talk to the database

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Fill the Zones drawer
        DB::table('zones')->insert([
            ['zone_id' => 1, 'zone_name' => 'Office', 'description' => 'First floor office'],
            ['zone_id' => 2, 'zone_name' => 'Warehouse', 'description' => 'Second floor warehouse'],
        ]);

        // 2. Fill the Devices drawer
        // Notice how we use 'zone_id' to tie the Arduino to the Office (1), and ESP32 to the Warehouse (2)
        DB::table('devices')->insert([
            ['device_id' => 1, 'device_type' => 'Arduino', 'status' => 'Active', 'zone_id' => 1],
            ['device_id' => 2, 'device_type' => 'ESP32', 'status' => 'Active', 'zone_id' => 2],
        ]);

        // 3. Fill the Sensors drawer
        // We use 'device_id' to attach the RFID to the Arduino (1), and the motion/door sensors to the ESP32 (2)
        DB::table('sensors')->insert([
            ['sensor_id' => 1, 'sensor_type' => 'RFID', 'status' => 'Active', 'device_id' => 1],
            ['sensor_id' => 2, 'sensor_type' => 'PIR Motion', 'status' => 'Active', 'device_id' => 2],
            ['sensor_id' => 3, 'sensor_type' => 'Door Reed Switch', 'status' => 'Active', 'device_id' => 2],
        ]);

        // 4. Mass-produce fake sensor data
        $fakeData = [];
        for ($i = 0; $i < 10; $i++) {
            $fakeData[] = [
                // Randomly pick sensor 1, 2, or 3
                'sensor_id' => rand(1, 3), 
                // Randomly generate a fake value (like a temperature or a 1/0 for a door)
                'value' => (string) rand(0, 10), 
                // Spread the timestamps out over the last few days so your charts look realistic
                'timestamp' => now()->subMinutes(rand(1, 4320))
            ];
        }
        
        // Dump all 10 fake toys into the drawer at once
        DB::table('sensor_data')->insert($fakeData);

        // 5. Add a fake Admin User
        DB::table('users')->insert([
            'user_id' => 1,
            'name' => 'Security Admin',
            'email' => 'admin@waresafe.local',
            'password' => bcrypt('password123'),
            'role' => 'Admin'
        ]);

        // 6. Add a fake Cyber Attack and Alert
        DB::table('attack_scenarios')->insert([
            'attack_id' => 1,
            'attack_type' => 'Data Flooding',
            'target_component' => 'ESP32 Gateway',
            'description' => 'Simulated DDoS attack on the warehouse gateway'
        ]);

        DB::table('alerts')->insert([
            'alert_id' => 1,
            'attack_id' => 1,
            'sensor_id' => 1,
            'alert_type' => 'Data Flooding',
        ]);
    }
}