from typing import List, Optional
from datetime import date as DateType, datetime
from pydantic import BaseModel, Field


# 情感记录基础模式
class EmotionBase(BaseModel):
    content: str = Field(..., description="情感记录内容")
    date: DateType = Field(..., description="记录日期")
    tags: List[str] = Field(default_factory=list, description="相关标签")


# 创建情感记录模式
class EmotionCreate(EmotionBase):
    pass


# 更新情感记录模式
class EmotionUpdate(BaseModel):
    content: Optional[str] = None
    date: Optional[date] = None
    tags: Optional[List[str]] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None


# 情感记录响应模式
class Emotion(EmotionBase):
    id: int
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
