from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import crud, schemas

router = APIRouter()


# 创建技能记录
@router.post("/", response_model=schemas.Skill)
def create_skill(
    skill: schemas.SkillCreate,
    db: Session = Depends(get_db)
):
    return crud.skill.create(db=db, obj_in=skill)


# 获取技能记录列表
@router.get("/", response_model=List[schemas.Skill])
def read_skills(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="技能类别"),
    db: Session = Depends(get_db)
):
    skills = crud.skill.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        category=category
    )
    return skills


# 获取单个技能记录
@router.get("/{skill_id}", response_model=schemas.Skill)
def read_skill(
    skill_id: int,
    db: Session = Depends(get_db)
):
    db_skill = crud.skill.get(db=db, id=skill_id)
    if db_skill is None:
        raise HTTPException(status_code=404, detail="技能记录未找到")
    return db_skill


# 更新技能记录
@router.put("/{skill_id}", response_model=schemas.Skill)
def update_skill(
    skill_id: int,
    skill: schemas.SkillUpdate,
    db: Session = Depends(get_db)
):
    db_skill = crud.skill.get(db=db, id=skill_id)
    if db_skill is None:
        raise HTTPException(status_code=404, detail="技能记录未找到")
    return crud.skill.update(db=db, db_obj=db_skill, obj_in=skill)


# 删除技能记录
@router.delete("/{skill_id}", response_model=schemas.Skill)
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db)
):
    db_skill = crud.skill.get(db=db, id=skill_id)
    if db_skill is None:
        raise HTTPException(status_code=404, detail="技能记录未找到")
    return crud.skill.remove(db=db, id=skill_id)
