<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class AttackController extends Controller
{
    public function getAttackRecords()
    {
        return DB::table('alerts')
            ->join(
                'attack_scenarios',
                'alerts.attack_id',
                '=',
                'attack_scenarios.attack_id'
            )
            ->whereNotNull('alerts.attack_id')
            ->select(
                'alerts.alert_id',
                'alerts.alert_type',
                'alerts.timestamp',
                'attack_scenarios.attack_id',
                'attack_scenarios.attack_type',
                'attack_scenarios.target_component',
                'attack_scenarios.description'
            )
            ->orderByDesc('alerts.timestamp')
            ->limit(100)
            ->get();
    }
}