from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_

from app.core.database import get_db
from app.models.data import EmotionEntry, FinanceEntry, SkillEntry, LearningEntry

router = APIRouter()

# 获取技能及其相关学习记录
@router.get("/skills-with-learnings/{skill_id}")
def get_skill_with_learnings(
    skill_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定技能及其相关的学习记录
    
    Args:
        skill_id: 技能ID
    
    Returns:
        包含技能信息和相关学习记录的字典
    """
    try:
        # 使用joinedload预加载学习记录
        skill = db.query(SkillEntry).options(
            joinedload(SkillEntry.learning_entries)
        ).filter(SkillEntry.id == skill_id).first()
        
        if not skill:
            raise HTTPException(status_code=404, detail="技能未找到")
        
        # 构建响应
        return {
            "skill": {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "level": skill.level,
                "progress": skill.progress,
                "description": skill.description,
                "created_at": skill.created_at.isoformat()
            },
            "learnings": [
                {
                    "id": learning.id,
                    "topic": learning.topic,
                    "duration": learning.duration,
                    "content": learning.content,
                    "date": learning.date.isoformat(),
                    "tags": learning.tags,
                    "created_at": learning.created_at.isoformat()
                } for learning in skill.learning_entries
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

# 获取按日期关联的多域数据
@router.get("/data-by-date")
def get_data_by_date(
    start_date: str = Query(..., description="开始日期，格式YYYY-MM-DD"),
    end_date: str = Query(..., description="结束日期，格式YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    """
    获取指定日期范围内的多域关联数据（情感、财务、学习）
    
    Args:
        start_date: 开始日期
        end_date: 结束日期
    
    Returns:
        按日期分组的多域数据
    """
    try:
        # 转换日期格式
        from datetime import datetime
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        # 查询所有数据
        emotions = db.query(EmotionEntry).filter(
            and_(EmotionEntry.date >= start, EmotionEntry.date <= end)
        ).all()
        
        finances = db.query(FinanceEntry).filter(
            and_(FinanceEntry.date >= start, FinanceEntry.date <= end)
        ).all()
        
        learnings = db.query(LearningEntry).options(
            joinedload(LearningEntry.skill)
        ).filter(
            and_(LearningEntry.date >= start, LearningEntry.date <= end)
        ).all()
        
        # 按日期分组
        date_groups: Dict[str, Dict[str, Any]] = {}
        
        # 添加情感数据
        for emotion in emotions:
            date_str = emotion.date.isoformat()
            if date_str not in date_groups:
                date_groups[date_str] = {"emotions": [], "finances": [], "learnings": []}
            date_groups[date_str]["emotions"].append({
                "id": emotion.id,
                "content": emotion.content,
                "sentiment": emotion.sentiment,
                "sentiment_score": emotion.sentiment_score,
                "tags": emotion.tags
            })
        
        # 添加财务数据
        for finance in finances:
            date_str = finance.date.isoformat()
            if date_str not in date_groups:
                date_groups[date_str] = {"emotions": [], "finances": [], "learnings": []}
            date_groups[date_str]["finances"].append({
                "id": finance.id,
                "amount": finance.amount,
                "category": finance.category,
                "subcategory": finance.subcategory,
                "description": finance.description,
                "tags": finance.tags
            })
        
        # 添加学习数据
        for learning in learnings:
            date_str = learning.date.isoformat()
            if date_str not in date_groups:
                date_groups[date_str] = {"emotions": [], "finances": [], "learnings": []}
            date_groups[date_str]["learnings"].append({
                "id": learning.id,
                "topic": learning.topic,
                "duration": learning.duration,
                "content": learning.content,
                "skill_name": learning.skill.name if learning.skill else None,
                "tags": learning.tags
            })
        
        return {
            "start_date": start_date,
            "end_date": end_date,
            "data": date_groups
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

# 获取学习与技能的关联统计
@router.get("/learning-skill-stats")
def get_learning_skill_stats(
    db: Session = Depends(get_db)
):
    """
    获取学习与技能的关联统计数据
    
    Returns:
        技能学习时长统计数据
    """
    try:
        # 查询每个技能的总学习时长
        result = db.query(
            SkillEntry.name,
            func.sum(LearningEntry.duration).label("total_duration"),
            func.count(LearningEntry.id).label("learning_count")
        ).join(
            LearningEntry, LearningEntry.skill_id == SkillEntry.id,
            isouter=True
        ).group_by(
            SkillEntry.id
        ).all()
        
        # 构建响应
        stats = [
            {
                "skill_name": row.name,
                "total_duration": row.total_duration or 0,
                "learning_count": row.learning_count or 0
            } for row in result
        ]
        
        return {
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")