export interface SensorData {
  data_id: number;
  sensor_id: number;
  sensor_type: string;
  device_type: string;
  zone_name?: string;
  value: string;
  timestamp: string;
}

export interface AlertData {
  alert_id: number;
  alert_type: string;
  sensor_type?: string;
  device_type?: string;
  zone_name?: string;
  timestamp: string;
}

export interface AttackRecord {
  alert_id: number;
  sensor_type: string;
  device_type: string;
  zone_name: string;
  attack_type: string;
  timestamp: string;
}

export interface MitigationData {
  attack_id: number;
  attack_type: string;
  target_component: string;
  description: string;
  mitigation: string;
}