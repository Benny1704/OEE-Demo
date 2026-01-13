export interface KPI {
  oee: number;
  yield_pct: number;
  uptime_pct: number;
  production_rate_tons_hr: number;
  active_alerts: number;
  high_risk_equipment: number;
  heats_today: number;
}

export interface Stage {
  stage_id: string;
  name: string;
  order?: number;
  status: 'green' | 'yellow' | 'red';
  equipment_count?: number;
  high_risk_count?: number;
  risk_distribution?: { low: number; medium: number; high: number };
  equipment?: EquipmentSummary[];
}

export interface Alert {
  alert_id: string;
  equipment: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  failure_probability: number;
}

export interface EquipmentSummary {
  equip_id: string;
  type_display: string;
  status: string;
  health_score: number;
  failure_probability: number;
  risk_category: string;
  wb_risk_category?: string;
  type?: string;
  stage?: string;
}

export interface Sensor {
  sensor_id: string;
  name: string;
  value: number;
  unit: string;
  status: string;
}

export interface Recommendation {
  priority: number;
  action: string;
  urgency: string;
  estimated_time_mins: number;
}

export interface EquipmentDetail extends EquipmentSummary {
  stage_name: string;
  identity: { manufacturer: string; model: string; install_date: string; last_maintenance: string };
  health: { 
    health_score: number; 
    failure_probability: number; 
    risk_category: string; 
    predicted_remaining_heats: number; 
    predicted_remaining_hours: number 
  };
  current_readings: any;
  sensors: Sensor[];
  shap_features: { feature: string; display_name: string; value: number; shap_value: number; direction: string }[];
  llm_explanation: string;
  recommendations: Recommendation[];
}

export interface SensorHistory {
  sensor_id: string;
  name: string;
  current_value: number;
  thresholds: { warning: number; alarm: number };
  statistics: { min: number; max: number; avg: number; std_dev: number };
  history: {QX: string; value: number; timeStr: string }[];
}