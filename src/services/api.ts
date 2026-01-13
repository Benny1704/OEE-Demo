// src/services/api.ts
import type { 
  SystemHealth, 
  PlantOverviewResponse, 
  StagesResponse, 
  StageDetailResponse,
  EquipmentExplanation,
  RecommendationsResponse,
  EquipmentDetailResponse,
  SensorHistoryAPI
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