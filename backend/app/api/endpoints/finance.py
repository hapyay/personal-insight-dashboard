from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app import crud, schemas

router = APIRouter()


# 创建财务记录
@router.post("/", response_model=schemas.Finance)
def create_finance(
    finance: schemas.FinanceCreate,
    db: Session = Depends(get_db)
):
    return crud.finance.create(db=db, obj_in=finance)


# 获取财务记录列表
@router.get("/", response_model=List[schemas.Finance])
def read_finances(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = Query(None, description="开始日期，格式YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期，格式YYYY-MM-DD"),
    category: Optional[str] = Query(None, description="财务类别：income或expense"),
    db: Session = Depends(get_db)
):
    finances = crud.finance.get_multi(
        db=db,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )
    
    # 类别过滤
    if category:
        finances = [f for f in finances if f.category == category]
    
    return finances


# 获取单个财务记录
@router.get("/{finance_id}", response_model=schemas.Finance)
def read_finance(
    finance_id: int,
    db: Session = Depends(get_db)
):
    db_finance = crud.finance.get(db=db, id=finance_id)
    if db_finance is None:
        raise HTTPException(status_code=404, detail="财务记录未找到")
    return db_finance


# 更新财务记录
@router.put("/{finance_id}", response_model=schemas.Finance)
def update_finance(
    finance_id: int,
    finance: schemas.FinanceUpdate,
    db: Session = Depends(get_db)
):
    db_finance = crud.finance.get(db=db, id=finance_id)
    if db_finance is None:
        raise HTTPException(status_code=404, detail="财务记录未找到")
    return crud.finance.update(db=db, db_obj=db_finance, obj_in=finance)


# 删除财务记录
@router.delete("/{finance_id}", response_model=schemas.Finance)
def delete_finance(
    finance_id: int,
    db: Session = Depends(get_db)
):
    db_finance = crud.finance.get(db=db, id=finance_id)
    if db_finance is None:
        raise HTTPException(status_code=404, detail="财务记录未找到")
    return crud.finance.remove(db=db, id=finance_id)
