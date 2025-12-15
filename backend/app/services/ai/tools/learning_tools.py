from langchain_core.tools import tool
from app.models.data import LearningEntry
from app.crud.learning import create, get_multi, update, get
from app.schemas.learning import LearningCreate, LearningUpdate
from app.core.database import get_db
from typing import List, Optional
from datetime import date

# 学习记录创建工具
@tool
def create_learning_entry(topic: str, duration: int, skill_id: Optional[int] = None, content: str = None, date_str: str = None, tags: List[str] = None) -> dict:
    """
    创建一条学习记录
    
    参数:
    - topic: 学习主题
    - duration: 学习时长，分钟
    - skill_id: 关联的技能ID，可选
    - content: 学习内容，可选
    - date_str: 记录日期，格式YYYY-MM-DD，可选，默认为今天
    - tags: 相关标签列表，可选
    
    返回:
    - 包含创建结果的字典
    """
    try:
        db = next(get_db())
        
        # 验证时长
        if duration <= 0:
            return {
                "success": False,
                "message": "学习时长必须大于0"
            }
        
        # 设置日期
        record_date = date.fromisoformat(date_str) if date_str else date.today()
        
        # 创建数据
        learning_in = LearningCreate(
            topic=topic,
            duration=duration,
            skill_id=skill_id,
            content=content,
            date=record_date,
            tags=tags or []
        )
        
        # 使用crud创建记录
        learning = create(db, obj_in=learning_in)
        
        return {
            "success": True,
            "message": "学习记录创建成功",
            "id": str(learning.id),
            "topic": learning.topic,
            "duration": learning.duration,
            "date": learning.date.isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"创建失败: {str(e)}"
        }

# 学习历史获取工具
@tool
def get_learning_history(start_date: Optional[str] = None, end_date: Optional[str] = None, skill_id: Optional[int] = None, limit: int = 10) -> dict:
    """
    获取指定日期范围内的学习记录
    
    参数:
    - start_date: 开始日期，格式YYYY-MM-DD，可选
    - end_date: 结束日期，格式YYYY-MM-DD，可选
    - skill_id: 关联的技能ID，可选
    - limit: 返回记录数量限制，默认10
    
    返回:
    - 包含学习记录列表的字典
    """
    try:
        db = next(get_db())
        
        # 解析日期
        start = date.fromisoformat(start_date) if start_date else None
        end = date.fromisoformat(end_date) if end_date else None
        
        # 获取学习记录
        learnings = get_multi(db, limit=limit, start_date=start, end_date=end, skill_id=skill_id)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(l.id),
                    "topic": l.topic,
                    "duration": l.duration,
                    "skill_id": l.skill_id,
                    "content": l.content,
                    "date": l.date.isoformat(),
                    "tags": l.tags
                }
                for l in learnings
            ]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"获取失败: {str(e)}"
        }

# 学习分析工具
@tool
def analyze_learning(start_date: str, end_date: str) -> dict:
    """
    分析指定日期范围内的学习情况
    
    参数:
    - start_date: 开始日期，格式YYYY-MM-DD
    - end_date: 结束日期，格式YYYY-MM-DD
    
    返回:
    - 包含学习分析结果的字典
    """
    try:
        db = next(get_db())
        
        # 解析日期
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
        
        # 获取学习记录
        learnings = get_multi(db, start_date=start, end_date=end)
        
        # 分析数据
        total_duration = sum(l.duration for l in learnings)
        total_topics = len(learnings)
        avg_duration = total_duration / total_topics if total_topics > 0 else 0
        
        # 按技能ID分析
        skill_stats = {}
        for l in learnings:
            skill_id = l.skill_id or "未关联技能"
            if skill_id not in skill_stats:
                skill_stats[skill_id] = {
                    "duration": 0,
                    "topics": 0
                }
            skill_stats[skill_id]["duration"] += l.duration
            skill_stats[skill_id]["topics"] += 1
        
        # 按日期分析
        daily_stats = {}
        for l in learnings:
            date_key = l.date.isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {
                    "duration": 0,
                    "topics": 0
                }
            daily_stats[date_key]["duration"] += l.duration
            daily_stats[date_key]["topics"] += 1
        
        return {
            "success": True,
            "period": {
                "start_date": start.isoformat(),
                "end_date": end.isoformat()
            },
            "summary": {
                "total_duration": total_duration,
                "total_topics": total_topics,
                "avg_duration_per_topic": round(avg_duration, 2)
            },
            "skill_stats": skill_stats,
            "daily_stats": daily_stats
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"分析失败: {str(e)}"
        }
