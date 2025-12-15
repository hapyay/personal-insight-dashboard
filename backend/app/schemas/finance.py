from typing import List, Optional
from datetime import date as DateType, datetime
from pydantic import BaseModel, Field


# 财务记录基础模式
class FinanceBase(BaseModel):
    amount: float = Field(..., description="金额")
    category: str = Field(..., description="类别：income（收入）或 expense（支出）")
    subcategory: str = Field(..., description="子类别：如 food, transportation, salary")
    description: Optional[str] = Field(None, description="描述")
    date: DateType = Field(..., description="记录日期")
    tags: List[str] = Field(default_factory=list, description="相关标签")


# 创建财务记录模式
class FinanceCreate(FinanceBase):
    pass


# 更新财务记录模式
class FinanceUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    tags: Optional[List[str]] = None


# 财务记录响应模式
class Finance(FinanceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }
