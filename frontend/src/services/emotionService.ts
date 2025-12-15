import axios from 'axios';

const API_BASE_URL = '/api/emotions';

// 情感记录类型定义
export interface Emotion {
  id: number;
  content: string;
  date: string;
  tags: string[];
  sentiment?: string;
  sentiment_score?: number;
  created_at: string;
  updated_at?: string;
}

export interface EmotionCreate {
  content: string;
  date: string;
  tags: string[];
}

export interface EmotionUpdate {
  content?: string;
  date?: string;
  tags?: string[];
  sentiment?: string;
  sentiment_score?: number;
}

// 获取情感记录列表
export const getEmotions = async (skip: number = 0, limit: number = 100, start_date?: string, end_date?: string) => {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  
  const response = await axios.get<Emotion[]>(`${API_BASE_URL}/?${params.toString()}`);
  return response.data;
};

// 获取单个情感记录
export const getEmotion = async (id: number) => {
  const response = await axios.get<Emotion>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// 创建情感记录
export const createEmotion = async (emotion: EmotionCreate) => {
  const response = await axios.post<Emotion>(API_BASE_URL, emotion);
  return response.data;
};

// 更新情感记录
export const updateEmotion = async (id: number, emotion: EmotionUpdate) => {
  const response = await axios.put<Emotion>(`${API_BASE_URL}/${id}`, emotion);
  return response.data;
};

// 删除情感记录
export const deleteEmotion = async (id: number) => {
  const response = await axios.delete<Emotion>(`${API_BASE_URL}/${id}`);
  return response.data;
};
