from langchain_core.tools import tool
from app.models.data import EmotionEntry
from app.crud.emotion import create, get_multi, update, get
from app.schemas.emotion import EmotionCreate, EmotionUpdate
from app.core.database import get_db
from typing import List, Optional
from datetime import date

# 情感记录创建工具
@tool
def create_emotion_entry(content: str, date_str: str, tags: List[str] = None) -> dict:
    """
    创建一条情感记录
    
    参数:
    - content: 情感记录内容
    - date_str: 记录日期，格式YYYY-MM-DD
    - tags: 相关标签列表，可选
    
    返回:
    - 包含创建结果的字典
    """
    try:
        db = next(get_db())
        
        # 解析日期
        record_date = date.fromisoformat(date_str)
        
        # 创建数据
        emotion_in = EmotionCreate(
            content=content,
            date=record_date,
            tags=tags or []
        )
        
        # 使用crud创建记录
        emotion = create(db, obj_in=emotion_in)
        
        return {
            "success": True,
            "message": "情感记录创建成功",
            "id": str(emotion.id),
            "content": emotion.content,
            "date": emotion.date.isoformat(),
            "tags": emotion.tags
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"创建失败: {str(e)}"
        }

# 情感历史获取工具
@tool
def get_emotion_history(start_date: Optional[str] = None, end_date: Optional[str] = None, limit: int = 10) -> dict:
    """
    获取指定日期范围内的情感记录
    
    参数:
    - start_date: 开始日期，格式YYYY-MM-DD，可选
    - end_date: 结束日期，格式YYYY-MM-DD，可选
    - limit: 返回记录数量限制，默认10
    
    返回:
    - 包含情感记录列表的字典
    """
    try:
        db = next(get_db())
        
        # 解析日期
        start = date.fromisoformat(start_date) if start_date else None
        end = date.fromisoformat(end_date) if end_date else None
        
        # 获取情感记录
        emotions = get_multi(db, limit=limit, start_date=start, end_date=end)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(e.id),
                    "content": e.content,
                    "date": e.date.isoformat(),
                    "tags": e.tags,
                    "sentiment": e.sentiment,
                    "sentiment_score": e.sentiment_score
                }
                for e in emotions
            ]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"获取失败: {str(e)}"
        }

# 情感记录更新工具
@tool
def update_emotion_entry(emotion_id: int, content: Optional[str] = None, tags: Optional[List[str]] = None) -> dict:
    """
    更新情感记录
    
    参数:
    - emotion_id: 情感记录ID
    - content: 情感记录内容，可选
    - tags: 相关标签列表，可选
    
    返回:
    - 包含更新结果的字典
    """
    try:
        db = next(get_db())
        
        # 检查记录是否存在
        emotion = get(db, id=emotion_id)
        if not emotion:
            return {
                "success": False,
                "message": f"情感记录不存在: {emotion_id}"
            }
        
        # 准备更新数据
        update_data = {}
        if content is not None:
            update_data["content"] = content
        if tags is not None:
            update_data["tags"] = tags
        
        # 如果没有要更新的数据，直接返回
        if not update_data:
            return {
                "success": True,
                "message": "没有要更新的数据",
                "id": str(emotion.id)
            }
        
        # 更新记录
        emotion_update = EmotionUpdate(**update_data)
        updated_emotion = update(db, db_obj=emotion, obj_in=emotion_update)
        
        return {
            "success": True,
            "message": "情感记录更新成功",
            "id": str(updated_emotion.id),
            "content": updated_emotion.content,
            "tags": updated_emotion.tags
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新失败: {str(e)}"
        }
