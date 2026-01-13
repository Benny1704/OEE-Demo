// src/services/api.ts
import type { 
  SystemHealth, 
  PlantOverviewResponse, 
  StagesResponse, 
  StageDetailResponse,
  EquipmentExplanation,
  RecommendationsResponse,
  EquipmentDetailResponse,
  SensorHistoryAPI,
  AlertsResponse,
  MaintenanceQueueResponse
} from '../types/api';

export const fetchSystemHealth = async (): Promise<SystemHealth> => {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Health API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    throw error;
  }
};

export const fetchPlantOverview = async (): Promise<PlantOverviewResponse> => {
  try {
    const response = await fetch('/api/plant/overview', {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Overview API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch plant overview:', error);
    throw error;
  }
};

export const fetchStages = async (): Promise<StagesResponse> => {
  try {
    const response = await fetch('/api/stages', {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Stages API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stages:', error);
    throw error;
  }
};

export const fetchStageDetail = async (stageId: string): Promise<StageDetailResponse> => {
  try {
    const response = await fetch(`/api/stage/${stageId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Stage Detail API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch details for stage ${stageId}:`, error);
    throw error;
  }
};

export const fetchEquipmentDetail = async (equipId: string): Promise<EquipmentDetailResponse> => {
  try {
    const response = await fetch(`/api/equipment/${equipId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Equipment Detail API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch detail for ${equipId}:`, error);
    throw error;
  }
};

export const fetchEquipmentExplanation = async (equipId: string): Promise<EquipmentExplanation> => {
  try {
    const response = await fetch(`/api/equipment/${equipId}/explanation`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Explanation API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch explanation for ${equipId}:`, error);
    throw error;
  }
};

export const fetchEquipmentRecommendations = async (equipId: string): Promise<RecommendationsResponse> => {
  try {
    const response = await fetch(`/api/equipment/${equipId}/recommendations`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Recommendations API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch recommendations for ${equipId}:`, error);
    throw error;
  }
};

export const fetchSensorHistory = async (sensorId: string, hours: number = 24): Promise<SensorHistoryAPI> => {
  try {
    const response = await fetch(`/api/sensor/${sensorId}/history?hours=${hours}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Sensor History API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch history for ${sensorId}:`, error);
    throw error;
  }
};

export const fetchAlerts = async (
  stageId?: string, 
  severity?: 'high' | 'medium' | 'low', 
  acknowledged: boolean = false
): Promise<AlertsResponse> => {
  try {
    // Build query parameters dynamically
    const params = new URLSearchParams();
    if (stageId) params.append('stage', stageId);
    if (severity) params.append('severity', severity);
    params.append('acknowledged', String(acknowledged));

    const response = await fetch(`/api/alerts?${params.toString()}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });

    if (!response.ok) throw new Error(`Alerts API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch alerts:`, error);
    throw error;
  }
};

export const acknowledgeAlert = async (alertId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'accept': 'application/json' },
      body: '' // Empty body as per curl
    });
    if (!response.ok) throw new Error(`Acknowledge failed: ${response.statusText}`);
  } catch (error) {
    console.error(`Failed to acknowledge alert ${alertId}:`, error);
    throw error;
  }
};

export const fetchMaintenanceQueue = async (): Promise<MaintenanceQueueResponse> => {
  try {
    const response = await fetch('/api/maintenance/queue', {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Maintenance Queue API failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch maintenance queue:', error);
    throw error;
  }
};

export const regeneratePlantData = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await fetch('/api/admin/regenerate', {
      method: 'POST',
      headers: { 'accept': 'application/json' },
      body: '' // Empty body
    });
    if (!response.ok) throw new Error(`Regenerate failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to regenerate data:', error);
    throw error;
  }
};