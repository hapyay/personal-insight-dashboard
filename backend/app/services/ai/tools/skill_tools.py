from langchain_core.tools import tool
from app.models.data import SkillEntry
from app.crud.skill import create, get_multi, update, get
from app.schemas.skill import SkillCreate, SkillUpdate
from app.core.database import get_db
from typing import List, Optional

# 技能记录创建工具
@tool
def create_skill_entry(name: str, category: str, level: int = 1, progress: int = 0, description: str = None) -> dict:
    """
    创建一条技能记录
    
    参数:
    - name: 技能名称
    - category: 技能类别
    - level: 技能等级，范围1-5，默认1
    - progress: 学习进度，范围0-100，默认0
    - description: 技能描述，可选
    
    返回:
    - 包含创建结果的字典
    """
    try:
        db = next(get_db())
        
        # 验证等级和进度
        if level < 1 or level > 5:
            return {
                "success": False,
                "message": "技能等级必须在1-5之间"
            }
        
        if progress < 0 or progress > 100:
            return {
                "success": False,
                "message": "学习进度必须在0-100之间"
            }
        
        # 创建数据
        skill_in = SkillCreate(
            name=name,
            category=category,
            level=level,
            progress=progress,
            description=description,
            learning_paths={},
            future_directions=[],
            related_skills=[]
        )
        
        # 使用crud创建记录
        skill = create(db, obj_in=skill_in)
        
        return {
            "success": True,
            "message": "技能记录创建成功",
            "id": str(skill.id),
            "name": skill.name,
            "category": skill.category,
            "level": skill.level,
            "progress": skill.progress
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"创建失败: {str(e)}"
        }

# 技能获取工具
@tool
def get_skill_progress(skill_id: Optional[int] = None, name: Optional[str] = None) -> dict:
    """
    获取技能进度信息
    
    参数:
    - skill_id: 技能ID，可选
    - name: 技能名称，可选
    
    返回:
    - 包含技能进度信息的字典
    """
    try:
        db = next(get_db())
        
        if skill_id:
            # 通过ID获取技能
            skill = get(db, id=skill_id)
            if not skill:
                return {
                    "success": False,
                    "message": f"技能不存在: {skill_id}"
                }
            skills = [skill]
        elif name:
            # 通过名称获取技能
            skills = [s for s in get_multi(db) if s.name == name]
            if not skills:
                return {
                    "success": False,
                    "message": f"技能不存在: {name}"
                }
        else:
            # 获取所有技能
            skills = get_multi(db)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(s.id),
                    "name": s.name,
                    "category": s.category,
                    "level": s.level,
                    "progress": s.progress,
                    "description": s.description
                }
                for s in skills
            ]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"获取失败: {str(e)}"
        }

# 技能更新工具
@tool
def update_skill_progress(skill_id: int, level: Optional[int] = None, progress: Optional[int] = None) -> dict:
    """
    更新技能进度
    
    参数:
    - skill_id: 技能ID
    - level: 技能等级，范围1-5，可选
    - progress: 学习进度，范围0-100，可选
    
    返回:
    - 包含更新结果的字典
    """
    try:
        db = next(get_db())
        
        # 检查技能是否存在
        skill = get(db, id=skill_id)
        if not skill:
            return {
                "success": False,
                "message": f"技能不存在: {skill_id}"
            }
        
        # 准备更新数据
        update_data = {}
        if level is not None:
            if level < 1 or level > 5:
                return {
                    "success": False,
                    "message": "技能等级必须在1-5之间"
                }
            update_data["level"] = level
        
        if progress is not None:
            if progress < 0 or progress > 100:
                return {
                    "success": False,
                    "message": "学习进度必须在0-100之间"
                }
            update_data["progress"] = progress
        
        # 如果没有要更新的数据，直接返回
        if not update_data:
            return {
                "success": True,
                "message": "没有要更新的数据",
                "id": str(skill.id)
            }
        
        # 更新记录
        skill_update = SkillUpdate(**update_data)
        updated_skill = update(db, db_obj=skill, obj_in=skill_update)
        
        return {
            "success": True,
            "message": "技能进度更新成功",
            "id": str(updated_skill.id),
            "level": updated_skill.level,
            "progress": updated_skill.progress
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"更新失败: {str(e)}"
        }
