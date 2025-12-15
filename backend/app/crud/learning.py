from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.data import LearningEntry
from app.schemas.learning import LearningCreate, LearningUpdate


class CRUDLearning:
    def create(self, db: Session, obj_in: LearningCreate) -> LearningEntry:
        """创建学习记录"""
        db_obj = LearningEntry(
            topic=obj_in.topic,
            duration=obj_in.duration,
            content=obj_in.content,
            date=obj_in.date,
            tags=obj_in.tags,
            skill_id=obj_in.skill_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[LearningEntry]:
        """根据ID获取学习记录"""
        return db.query(LearningEntry).filter(LearningEntry.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        skill_id: Optional[int] = None
    ) -> List[LearningEntry]:
        """获取学习记录列表，支持日期和技能过滤"""
        query = db.query(LearningEntry)
        
        # 日期过滤
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(LearningEntry.date >= start)
        
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(LearningEntry.date <= end)
        
        # 技能过滤
        if skill_id:
            query = query.filter(LearningEntry.skill_id == skill_id)
        
        return query.offset(skip).limit(limit).all()
    
    def update(
        self, 
        db: Session, 
        db_obj: LearningEntry, 
        obj_in: LearningUpdate
    ) -> LearningEntry:
        """更新学习记录"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, id: int) -> LearningEntry:
        """删除学习记录"""
        obj = db.query(LearningEntry).get(id)
        db.delete(obj)
        db.commit()
        return obj


learning = CRUDLearning()
