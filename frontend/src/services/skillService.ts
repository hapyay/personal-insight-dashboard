import axios from 'axios';

const API_BASE_URL = '/api/skills';

// 技能记录类型定义
export interface Skill {
  id: number;
  name: string;
  category: string;
  level: number; // 1-5
  progress: number; // 0-100
  description?: string;
  tags: string[];
  learning_paths: {
    resources?: Array<{
      type: 'article' | 'video' | 'course' | 'project';
      title: string;
      url: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }>;
    practiceProjects?: string[];
  };
  future_directions: string[];
  related_skills: string[];
  skill_tree_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface SkillCreate {
  name: string;
  category: string;
  level: number;
  progress: number;
  description?: string;
  tags: string[];
  learning_paths: {
    resources?: Array<{
      type: 'article' | 'video' | 'course' | 'project';
      title: string;
      url: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }>;
    practiceProjects?: string[];
  };
  future_directions: string[];
  related_skills: string[];
  skill_tree_id?: number;
}

export interface SkillUpdate {
  name?: string;
  category?: string;
  level?: number;
  progress?: number;
  description?: string;
  tags?: string[];
  learning_paths?: {
    resources?: Array<{
      type: 'article' | 'video' | 'course' | 'project';
      title: string;
      url: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }>;
    practiceProjects?: string[];
  };
  future_directions?: string[];
  related_skills?: string[];
  skill_tree_id?: number;
}

// 获取技能记录列表
export const getSkills = async (skip: number = 0, limit: number = 100, category?: string) => {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  if (category) params.append('category', category);
  
  const response = await axios.get<Skill[]>(`${API_BASE_URL}/?${params.toString()}`);
  return response.data;
};

// 获取单个技能记录
export const getSkill = async (id: number) => {
  const response = await axios.get<Skill>(`${API_BASE_URL}/${id}`);
  return response.data;
};

// 创建技能记录
export const createSkill = async (skill: SkillCreate) => {
  const response = await axios.post<Skill>(API_BASE_URL, skill);
  return response.data;
};

// 更新技能记录
export const updateSkill = async (id: number, skill: SkillUpdate) => {
  const response = await axios.put<Skill>(`${API_BASE_URL}/${id}`, skill);
  return response.data;
};

// 删除技能记录
export const deleteSkill = async (id: number) => {
  const response = await axios.delete<Skill>(`${API_BASE_URL}/${id}`);
  return response.data;
};
