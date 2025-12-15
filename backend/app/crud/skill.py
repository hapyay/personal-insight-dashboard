from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.data import SkillEntry
from app.schemas.skill import SkillCreate, SkillUpdate


class CRUDSkill:
    def create(self, db: Session, obj_in: SkillCreate) -> SkillEntry:
        """创建技能记录"""
        db_obj = SkillEntry(
            name=obj_in.name,
            category=obj_in.category,
            level=obj_in.level,
            progress=obj_in.progress,
            description=obj_in.description,
            learning_paths=obj_in.learning_paths,
            future_directions=obj_in.future_directions,
            related_skills=obj_in.related_skills,
            skill_tree_id=obj_in.skill_tree_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get(self, db: Session, id: int) -> Optional[SkillEntry]:
        """根据ID获取技能记录"""
        return db.query(SkillEntry).filter(SkillEntry.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[str] = None
    ) -> List[SkillEntry]:
        """获取技能记录列表，支持类别过滤"""
        query = db.query(SkillEntry)
        
        # 类别过滤
        if category:
            query = query.filter(SkillEntry.category == category)
        
        return query.offset(skip).limit(limit).all()
    
    def update(
        self, 
        db: Session, 
        db_obj: SkillEntry, 
        obj_in: SkillUpdate
    ) -> SkillEntry:
        """更新技能记录"""
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, id: int) -> SkillEntry:
        """删除技能记录"""
        obj = db.query(SkillEntry).get(id)
        db.delete(obj)
        db.commit()
        return obj


skill = CRUDSkill()
