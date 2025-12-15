from typing import List, Optional
from datetime import date as DateType, datetime
from pydantic import BaseModel, Field


# 学习记录基础模式
class LearningBase(BaseModel):
    topic: str = Field(..., description="学习主题")
    duration: int = Field(..., gt=0, description="学习时长（分钟）")
    content: Optional[str] = Field(None, description="学习内容")
    date: DateType = Field(..., description="学习日期")
    tags: List[str] = Field(default_factory=list, description="相关标签")
    skill_id: Optional[int] = Field(None, description="关联的技能ID")


# 创建学习记录模式
class LearningCreate(LearningBase):
    pass


# 更新学习记录模式
class LearningUpdate(BaseModel):
    topic: Optional[str] = None
    duration: Optional[int] = Field(None, gt=0)
    content: Optional[str] = None
    date: Optional[date] = None
    tags: Optional[List[str]] = None
    skill_id: Optional[int] = None


# 学习记录响应模式
class Learning(LearningBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
