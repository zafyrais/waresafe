<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttackScenario extends Model
{
    protected $table = 'attack_scenarios';

    protected $primaryKey = 'attack_id';

    public $timestamps = false;
}