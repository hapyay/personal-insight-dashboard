import axios from 'axios';

const API_BASE_URL = '/api/learnings';

// 学习记录类型定义
export interface Learning {
  id: number;
  topic: string;
  duration: number; // 学习时长（分钟）
  content?: string;
  date: string;
  tags: string[];
  skill_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface LearningCreate {
  topic: string;
  duration: number;
  content?: string;
  date: string;
  tags: string[];
  skill_id?: number;
}

export interface LearningUpdate {
  topic?: string;
  duration?: number;
  content?: string;
  date?: string;
  tags?: string[];
  skill_id?: number;
}

// 获取学习记录列表
export const getLearnings = async (skip: number = 0, limit: number = 100, start_date?: string, end_date?: string, skill_id?: number) => {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  if (skill_id) params.append('skill_id', skill_id.toString());
  
  const response = await axios.get<Learning[]>(`${API_BASE_URL}/?${params.toString()}`);
  return response.data;
};

// 获取单个学习记录
export const getLearning = async (id: number) => {
  const response = await axios.get<Learning>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// 创建学习记录
export const createLearning = async (learning: LearningCreate) => {
  const response = await axios.post<Learning>(API_BASE_URL, learning);
  return response.data;
};

// 更新学习记录
export const updateLearning = async (id: number, learning: LearningUpdate) => {
  const response = await axios.put<Learning>(`${API_BASE_URL}/${id}`, learning);
  return response.data;
};

// 删除学习记录
export const deleteLearning = async (id: number) => {
  const response = await axios.delete<Learning>(`${API_BASE_URL}/${id}`);
  return response.data;
};
