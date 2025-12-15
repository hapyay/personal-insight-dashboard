from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.data import FinanceEntry
from app.schemas.finance import FinanceCreate, FinanceUpdate


class CRUDFinance:
    def create(self, db: Session, obj_in: FinanceCreate) -> FinanceEntry:
        """创建财务记录"""
        db_obj = FinanceEntry(
            amount=obj_in.amount,
            category=obj_in.category,
            subcategory=obj_in.subcategory,
            description=obj_in.description,
            date=obj_in.date,
            tags=obj_in.tags
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[FinanceEntry]:
        """根据ID获取财务记录"""
        return db.query(FinanceEntry).filter(FinanceEntry.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[FinanceEntry]:
        """获取财务记录列表，支持日期过滤"""
        query = db.query(FinanceEntry)
        
        # 日期过滤
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(FinanceEntry.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(FinanceEntry.date <= end)
        
        return query.offset(skip).limit(limit).all()
    
    def update(
        self, 
        db: Session, 
        db_obj: FinanceEntry, 
        obj_in: FinanceUpdate
    ) -> FinanceEntry:
        """更新财务记录"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, id: int) -> FinanceEntry:
        """删除财务记录"""
        obj = db.query(FinanceEntry).get(id)
        db.delete(obj)
        db.commit()
        return obj


finance = CRUDFinance()
