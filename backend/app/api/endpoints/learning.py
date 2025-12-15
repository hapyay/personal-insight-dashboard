from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import crud, schemas

router = APIRouter()


# 创建学习记录
@router.post("/", response_model=schemas.Learning)
def create_learning(
    learning: schemas.LearningCreate,
    db: Session = Depends(get_db)
):
    return crud.learning.create(db=db, obj_in=learning)


# 获取学习记录列表
@router.get("/", response_model=List[schemas.Learning])
def read_learnings(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = Query(None, description="开始日期，格式YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期，格式YYYY-MM-DD"),
    skill_id: Optional[int] = Query(None, description="关联的技能ID"),
    db: Session = Depends(get_db)
):
    learnings = crud.learning.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date,
        skill_id=skill_id
    )
    return learnings


# 获取单个学习记录
@router.get("/{learning_id}", response_model=schemas.Learning)
def read_learning(
    learning_id: int,
    db: Session = Depends(get_db)
):
    db_learning = crud.learning.get(db=db, id=learning_id)
    if db_learning is None:
        raise HTTPException(status_code=404, detail="学习记录未找到")
    return db_learning


# 更新学习记录
@router.put("/{learning_id}", response_model=schemas.Learning)
def update_learning(
    learning_id: int,
    learning: schemas.LearningUpdate,
    db: Session = Depends(get_db)
):
    db_learning = crud.learning.get(db=db, id=learning_id)
    if db_learning is None:
        raise HTTPException(status_code=404, detail="学习记录未找到")
    return crud.learning.update(db=db, db_obj=db_learning, obj_in=learning)


# 删除学习记录
@router.delete("/{learning_id}", response_model=schemas.Learning)
def delete_learning(
    learning_id: int,
    db: Session = Depends(get_db)
):
    db_learning = crud.learning.get(db=db, id=learning_id)
    if db_learning is None:
        raise HTTPException(status_code=404, detail="学习记录未找到")
    return crud.learning.remove(db=db, id=learning_id)
