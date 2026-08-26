import { apiClient } from './apiClient';

export interface ReportData {
  id: string;
  target_file: string;
  sha256: string;
  status: string;
  risk_score: number;
  threat_level: string;
  created_at: string;
  file_info: any;
  static_analysis: any;
  behavior_summary: any;
  iocs: any;
  mitre_attack: any;
}

export const reportService = {
  getReportBySha: (sha: string) => {
    return apiClient.get<ReportData>(`/report/${sha}`);
  }
};
