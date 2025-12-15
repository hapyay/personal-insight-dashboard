from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import crud, schemas

router = APIRouter()


# 创建情感记录
@router.post("/", response_model=schemas.Emotion)
def create_emotion(
    emotion: schemas.EmotionCreate,
    db: Session = Depends(get_db)
):
    return crud.emotion.create(db=db, obj_in=emotion)


# 获取情感记录列表
@router.get("/", response_model=List[schemas.Emotion])
def read_emotions(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = Query(None, description="开始日期，格式YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期，格式YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    emotions = crud.emotion.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )
    return emotions


# 获取单个情感记录
@router.get("/{emotion_id}", response_model=schemas.Emotion)
def read_emotion(
    emotion_id: int,
    db: Session = Depends(get_db)
):
    db_emotion = crud.emotion.get(db=db, id=emotion_id)
    if db_emotion is None:
        raise HTTPException(status_code=404, detail="情感记录未找到")
    return db_emotion


# 更新情感记录
@router.put("/{emotion_id}", response_model=schemas.Emotion)
def update_emotion(
    emotion_id: int,
    emotion: schemas.EmotionUpdate,
    db: Session = Depends(get_db)
):
    db_emotion = crud.emotion.get(db=db, id=emotion_id)
    if db_emotion is None:
        raise HTTPException(status_code=404, detail="情感记录未找到")
    return crud.emotion.update(db=db, db_obj=db_emotion, obj_in=emotion)


# 删除情感记录
@router.delete("/{emotion_id}", response_model=schemas.Emotion)
def delete_emotion(
    emotion_id: int,
    db: Session = Depends(get_db)
):
    db_emotion = crud.emotion.get(db=db, id=emotion_id)
    if db_emotion is None:
        raise HTTPException(status_code=404, detail="情感记录未找到")
    return crud.emotion.remove(db=db, id=emotion_id)
