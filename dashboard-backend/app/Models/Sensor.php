<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    protected $table = 'sensors';

    protected $primaryKey = 'sensor_id';

    public $timestamps = false;
}