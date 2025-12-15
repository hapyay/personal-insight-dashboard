from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field


# 技能基础模式
class SkillBase(BaseModel):
    name: str = Field(..., description="技能名称")
    category: str = Field(..., description="技能类别")
    level: int = Field(default=1, ge=1, le=5, description="技能等级：1-5")
    progress: int = Field(default=0, ge=0, le=100, description="学习进度：0-100")
    description: Optional[str] = Field(None, description="技能描述")
    tags: List[str] = Field(default_factory=list, description="相关标签")


# 创建技能模式
class SkillCreate(SkillBase):
    learning_paths: Dict = Field(default_factory=dict, description="学习途径")
    future_directions: List[str] = Field(default_factory=list, description="未来方向")
    related_skills: List[str] = Field(default_factory=list, description="相关技能")
    skill_tree_id: Optional[int] = None


# 更新技能模式
class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    level: Optional[int] = Field(None, ge=1, le=5)
    progress: Optional[int] = Field(None, ge=0, le=100)
    description: Optional[str] = None
    learning_paths: Optional[Dict] = None
    future_directions: Optional[List[str]] = None
    related_skills: Optional[List[str]] = None
    skill_tree_id: Optional[int] = None


# 技能响应模式
class Skill(SkillBase):
    id: int
    learning_paths: Dict
    future_directions: List[str]
    related_skills: List[str]
    skill_tree_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
