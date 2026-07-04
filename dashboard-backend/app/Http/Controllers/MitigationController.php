public function getMitigationEducation() 
    {
        return AttackScenario::select(
        'attack_id',
        'attack_type',
        'target_component',
        'description',
        'mitigation'
    )
    ->orderBy('attack_id')
    ->get();
    }