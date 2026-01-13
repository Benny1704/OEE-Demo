// src/types/api.ts
import type { EquipmentSummary } from './index';

// ... (Keep existing types from previous steps)

export interface SystemHealth {
  status: string;
  timestamp: string;
  equipment_count: number;
  sensor_count: number;
}

export interface PlantKPIs {
  oee: number;
  yield_pct: number;
  uptime_pct: number;
  production_rate_tons_hr: number;
  active_alerts: number;
  high_risk_equipment: number;
  heats_today: number;
}

export interface StageSummary {
  stage_id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  equipment_count: number;
  high_risk_count: number;
}

export interface StageDetailAPI {
  stage_id: string;
  name: string;
  order: number;
  status: 'green' | 'yellow' | 'red';
  equipment_count: number;
  high_risk_count: number;
}

export interface StagesResponse {
  stages: StageDetailAPI[];
}

export interface CriticalAlert {
  alert_id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  stage: string;
  stage_name: string;
  equipment: string;
  equipment_type: string;
  message: string;
  failure_probability: number;
  acknowledged: boolean;
}

export interface PlantOverviewResponse {
  plant_name: string;
  timestamp: string;
  kpis: PlantKPIs;
  stages_summary: StageSummary[];
  critical_alerts: CriticalAlert[];
}

// --- NEW TYPE FOR STAGE DETAIL ---
export interface StageDetailResponse {
  stage_id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  description?: string;
  risk_distribution: { low: number; medium: number; high: number };
  equipment: EquipmentSummary[];
  alerts: any[];
}

export interface ShapFeature {
  feature: string;
  display_name: string;
  value: number;
  shap_value: number;
  direction: 'increases_risk' | 'decreases_risk';
}

export interface EquipmentIdentity {
  manufacturer: string;
  model: string;
  install_date: string;
  last_maintenance: string;
}

export interface EquipmentHealthAPI {
  health_score: number;
  failure_probability: number;
  risk_category: string;
  predicted_remaining_heats: number;
  predicted_remaining_hours: number;
}

export interface SensorAPI {
  sensor_id: string;
  name: string;
  value: number;
  unit: string;
  status: string; // 'normal', 'warning', 'alarm'
}

export interface EquipmentDetailResponse {
  equip_id: string;
  type_display: string;
  stage_name: string;
  status: string;
  last_updated: string;
  identity: EquipmentIdentity;
  health: EquipmentHealthAPI;
  current_readings: Record<string, number>;
  sensors: SensorAPI[];
}

export interface EquipmentExplanation {
  equip_id: string;
  failure_probability: number;
  shap_features: ShapFeature[];
  llm_explanation: string;
}

export interface RecommendationAPI {
  priority: number;
  action: string;
  reason?: string; // API provides this, useful to display
  urgency: 'immediate' | 'soon' | 'planned';
  estimated_time_mins: number;
}

export interface RecommendationsResponse {
  equip_id: string;
  recommendations: RecommendationAPI[];
}