import { apiClient } from './apiClient';

export interface AnalysisResponse {
  task_id: string;
  status: string;
  verdict?: string;
  sha256?: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  progress: number;
  result?: any;
  error?: string;
}

export const analysisService = {
  analyzeFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Since fetch needs FormData, we'll bypass the apiClient's JSON stringification 
    // for this specific call or we can adjust apiClient. But for now, we'll just 
    // use native fetch for the file upload since it requires FormData and no Content-Type header.
    return fetch('http://localhost:8000/api/v1/analyze', {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Analysis failed');
      return res.json() as Promise<AnalysisResponse>;
    });
  },
  
  getTaskStatus: (taskId: string) => {
    return apiClient.get<TaskStatusResponse>(`/tasks/${taskId}`);
  }
};
