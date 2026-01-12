import type { KPI, Stage, Alert, EquipmentDetail, SensorHistory, Stage as StageDetail } from '../types';

export const mockPlantData: { kpis: KPI; stages: Stage[]; alerts: Alert[] } = {
  kpis: { oee: 87.5, yield_pct: 98.2, uptime_pct: 96.1, production_rate_tons_hr: 245, active_alerts: 3, high_risk_equipment: 2, heats_today: 42 },
  stages: [
    { stage_id: "raw_materials", name: "Raw Materials", status: "green", equipment_count: 5, high_risk_count: 0, order: 1 },
    { stage_id: "melt_shop", name: "Melt Shop", status: "green", equipment_count: 4, high_risk_count: 0, order: 2 },
    { stage_id: "secondary_metallurgy", name: "Secondary Metallurgy", status: "yellow", equipment_count: 6, high_risk_count: 1, order: 3 },
    { stage_id: "continuous_casting", name: "Continuous Casting", status: "red", equipment_count: 20, high_risk_count: 3, order: 4 },
    { stage_id: "hot_rolling", name: "Hot Rolling", status: "green", equipment_count: 15, high_risk_count: 0, order: 5 },
    { stage_id: "finishing", name: "Finishing", status: "green", equipment_count: 6, high_risk_count: 0, order: 6 },
  ],
  alerts: [
    { alert_id: "A001", equipment: "TUNDISH-002", message: "High clogging risk", severity: "high", failure_probability: 0.78 },
    { alert_id: "A002", equipment: "SEN-001", message: "Erosion detected", severity: "high", failure_probability: 0.75 },
    { alert_id: "A003", equipment: "LADLE-003", message: "Refractory wear", severity: "medium", failure_probability: 0.52 },
  ]
};

export const mockStageData: StageDetail = {
  stage_id: "continuous_casting",
  name: "Continuous Casting",
  status: "red",
  risk_distribution: { low: 7, medium: 6, high: 3 },
  equipment: [
    { equip_id: "TUNDISH-002", type_display: "Tundish", status: "red", health_score: 45, failure_probability: 0.78, risk_category: "high" },
    { equip_id: "SEN-001", type_display: "SEN", status: "red", health_score: 48, failure_probability: 0.75, risk_category: "high" },
    { equip_id: "SEN-004", type_display: "SEN", status: "red", health_score: 52, failure_probability: 0.72, risk_category: "high" },
    { equip_id: "TUNDISH-001", type_display: "Tundish", status: "yellow", health_score: 62, failure_probability: 0.45, risk_category: "medium" },
    { equip_id: "MOLD-002", type_display: "Mold", status: "yellow", health_score: 68, failure_probability: 0.42, risk_category: "medium" },
    { equip_id: "GATE-003", type_display: "Slide Gate", status: "green", health_score: 88, failure_probability: 0.18, risk_category: "low" },
    { equip_id: "STOPPER-01", type_display: "Stopper Rod", status: "green", health_score: 92, failure_probability: 0.15, risk_category: "low" },
    { equip_id: "MOLD-001", type_display: "Mold", status: "green", health_score: 94, failure_probability: 0.12, risk_category: "low" },
  ]
};

export const mockEquipmentData: EquipmentDetail = {
    equip_id: "TUNDISH-002",
    type_display: "Tundish",
    stage_name: "Continuous Casting",
    status: "red",
    identity: { manufacturer: "Vesuvius", model: "VES-TUN-3000", install_date: "2023-06-15", last_maintenance: "2025-01-05" },
    health: { health_score: 45, failure_probability: 0.78, risk_category: "high", predicted_remaining_heats: 12, predicted_remaining_hours: 8.5 },
    current_readings: { steel_temp_c: 1542, clogging_index: 67, refractory_mm: 85, steel_level_pct: 72, heats_sequence: 8 },
    sensors: [
        { sensor_id: "TUNDISH-002-STEEL_TEMP_C", name: "Steel Temp", value: 1542, unit: "°C", status: "normal" },
        { sensor_id: "TUNDISH-002-CLOGGING_INDEX", name: "Clogging Index", value: 67, unit: "", status: "warning" },
        { sensor_id: "TUNDISH-002-REFRACTORY_MM", name: "Refractory", value: 85, unit: "mm", status: "warning" },
        { sensor_id: "TUNDISH-002-STEEL_LEVEL_PCT", name: "Steel Level", value: 72, unit: "%", status: "normal" },
    ],
    shap_features: [
        { feature: "clogging_index", display_name: "Clogging Index", value: 67, shap_value: 0.32, direction: "increases_risk" },
        { feature: "refractory_mm", display_name: "Refractory", value: 85, shap_value: 0.18, direction: "increases_risk" },
        { feature: "heats_sequence", display_name: "Heats in Sequence", value: 8, shap_value: 0.12, direction: "increases_risk" },
        { feature: "steel_temp_c", display_name: "Steel Temp", value: 1542, shap_value: -0.05, direction: "decreases_risk" },
    ],
    llm_explanation: "TUNDISH-002 shows HIGH risk with 78% failure probability. Primary factors: elevated clogging index (67) and refractory thickness approaching minimum threshold (85mm). Recommend immediate inspection.",
    recommendations: [
        { priority: 1, action: "Inspect nozzle for alumina buildup", urgency: "immediate", estimated_time_mins: 20 },
        { priority: 2, action: "Increase argon flow rate", urgency: "soon", estimated_time_mins: 5 },
        { priority: 3, action: "Schedule refractory relining", urgency: "planned", estimated_time_mins: 240 },
    ],
    health_score: 0,
    failure_probability: 0,
    risk_category: ''
};

export const mockSensorHistory: SensorHistory = {
  sensor_id: "TUNDISH-002-CLOGGING_INDEX",
  name: "Clogging Index",
  current_value: 67,
  thresholds: { warning: 50, alarm: 75 },
  statistics: { min: 12, max: 67, avg: 38.5, std_dev: 15.2 },
  history: Array.from({ length: 24 }, (_, i) => ({
    QX: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.min(67, 12 + i * 2.5 + Math.random() * 5),
    timeStr: `${(23-i) === 0 ? 'Now' : (23-i) + 'h ago'}`
  }))
};