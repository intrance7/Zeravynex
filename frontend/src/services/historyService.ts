import { apiClient } from './apiClient';

export interface HistoryItem {
  id: string;
  filename: string;
  status: string;
  timestamp: string;
  sha256: string;
  threat_level: 'high' | 'medium' | 'low' | 'none';
  tags: string[];
}

export const historyService = {
  getHistory: (page: number, limit: number = 10) => {
    return apiClient.get<HistoryItem[]>(`/history?skip=${page * limit}&limit=${limit}`);
  },
  
  getRecentHistory: (limit: number = 1) => {
    return apiClient.get<HistoryItem[]>(`/history?limit=${limit}`);
  }
};
