from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.data import EmotionEntry
from app.schemas.emotion import EmotionCreate, EmotionUpdate


# CRUD操作类
class CRUDEmotion:
    def create(self, db: Session, obj_in: EmotionCreate) -> EmotionEntry:
        """创建情感记录"""
        db_obj = EmotionEntry(
            content=obj_in.content,
            date=obj_in.date,
            tags=obj_in.tags
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[EmotionEntry]:
        """根据ID获取情感记录"""
        return db.query(EmotionEntry).filter(EmotionEntry.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[EmotionEntry]:
        """获取情感记录列表，支持日期过滤"""
        query = db.query(EmotionEntry)
        
        # 日期过滤
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(EmotionEntry.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(EmotionEntry.date <= end)
        
        return query.offset(skip).limit(limit).all()
    
    def update(
        self, 
        db: Session, 
        db_obj: EmotionEntry, 
        obj_in: EmotionUpdate
    ) -> EmotionEntry:
        """更新情感记录"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, id: int) -> EmotionEntry:
        """删除情感记录"""
        obj = db.query(EmotionEntry).get(id)
        db.delete(obj)
        db.commit()
        return obj


# 创建CRUD实例
emotion = CRUDEmotion()
