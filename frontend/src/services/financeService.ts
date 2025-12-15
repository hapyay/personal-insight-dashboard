import axios from 'axios';

const API_BASE_URL = '/api/finances';

// 财务记录类型定义
export interface Finance {
  id: number;
  amount: number;
  category: string; // income, expense
  subcategory: string;
  description?: string;
  date: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export interface FinanceCreate {
  amount: number;
  category: string;
  subcategory: string;
  description?: string;
  date: string;
  tags: string[];
}

export interface FinanceUpdate {
  amount?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  date?: string;
  tags?: string[];
}

// 获取财务记录列表
export const getFinances = async (skip: number = 0, limit: number = 100, start_date?: string, end_date?: string, category?: string) => {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);
  if (category) params.append('category', category);
  
  const response = await axios.get<Finance[]>(`${API_BASE_URL}/?${params.toString()}`);
  return response.data;
};

// 获取单个财务记录
export const getFinance = async (id: number) => {
  const response = await axios.get<Finance>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// 创建财务记录
export const createFinance = async (finance: FinanceCreate) => {
  const response = await axios.post<Finance>(API_BASE_URL, finance);
  return response.data;
};

// 更新财务记录
export const updateFinance = async (id: number, finance: FinanceUpdate) => {
  const response = await axios.put<Finance>(`${API_BASE_URL}/${id}`, finance);
  return response.data;
};

// 删除财务记录
export const deleteFinance = async (id: number) => {
  const response = await axios.delete<Finance>(`${API_BASE_URL}/${id}`);
  return response.data;
};
