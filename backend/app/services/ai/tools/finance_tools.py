from langchain_core.tools import tool
from app.models.data import FinanceEntry
from app.crud.finance import create, get_multi, update, get
from app.schemas.finance import FinanceCreate, FinanceUpdate
from app.core.database import get_db
from typing import List, Optional
from datetime import date

# 财务记录创建工具
@tool
def create_finance_entry(amount: float, category: str, subcategory: str, description: str = None, date_str: str = None, tags: List[str] = None) -> dict:
    """
    创建一条财务记录
    
    参数:
    - amount: 金额，正数表示收入，负数表示支出
    - category: 类别，必须是income或expense
    - subcategory: 子类别，如：food, transportation, salary
    - description: 描述，可选
    - date_str: 记录日期，格式YYYY-MM-DD，可选，默认为今天
    - tags: 相关标签列表，可选
    
    返回:
    - 包含创建结果的字典
    """
    try:
        db = next(get_db())
        
        # 验证类别
        if category not in ["income", "expense"]:
            return {
                "success": False,
                "message": "类别必须是income或expense"
            }
        
        # 设置日期
        record_date = date.fromisoformat(date_str) if date_str else date.today()
        
        # 创建数据
        finance_in = FinanceCreate(
            amount=amount,
            category=category,
            subcategory=subcategory,
            description=description,
            date=record_date,
            tags=tags or []
        )
        
        # 使用crud创建记录
        finance = create(db, obj_in=finance_in)
        
        return {
            "success": True,
            "message": "财务记录创建成功",
            "id": str(finance.id),
            "amount": finance.amount,
            "category": finance.category,
            "subcategory": finance.subcategory,
            "date": finance.date.isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"创建失败: {str(e)}"
        }

# 财务历史获取工具
@tool
def get_finance_history(start_date: Optional[str] = None, end_date: Optional[str] = None, category: Optional[str] = None, limit: int = 10) -> dict:
    """
    获取指定日期范围内的财务记录
    
    参数:
    - start_date: 开始日期，格式YYYY-MM-DD，可选
    - end_date: 结束日期，格式YYYY-MM-DD，可选
    - category: 类别，可选，只能是income或expense
    - limit: 返回记录数量限制，默认10
    
    返回:
    - 包含财务记录列表的字典
    """
    try:
        db = next(get_db())
        
        # 解析日期
        start = date.fromisoformat(start_date) if start_date else None
        end = date.fromisoformat(end_date) if end_date else None
        
        # 获取财务记录
        finances = get_multi(db, limit=limit, start_date=start, end_date=end, category=category)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(f.id),
                    "amount": f.amount,
                    "category": f.category,
                    "subcategory": f.subcategory,
                    "description": f.description,
                    "date": f.date.isoformat(),
                    "tags": f.tags
                }
                for f in finances
            ]
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"获取失败: {str(e)}"
        }

# 财务分析工具
@tool
def analyze_finance(start_date: str, end_date: str) -> dict:
    """
    分析指定日期范围内的财务状况
    
    参数:
    - start_date: 开始日期，格式YYYY-MM-DD
    - end_date: 结束日期，格式YYYY-MM-DD
    
    返回:
    - 包含财务分析结果的字典
    """
    try:
        db = next(get_db())
        
        # 解析日期
        start = date.fromisoformat(start_date)
        end = date.fromisoformat(end_date)
        
        # 获取财务记录
        finances = get_multi(db, start_date=start, end_date=end)
        
        # 分析数据
        total_income = sum(f.amount for f in finances if f.category == "income")
        total_expense = sum(f.amount for f in finances if f.category == "expense")
        net_balance = total_income + total_expense  # expense是负数
        
        # 按子类别分析
        subcategory_stats = {}
        for f in finances:
            if f.subcategory not in subcategory_stats:
                subcategory_stats[f.subcategory] = {
                    "income": 0,
                    "expense": 0
                }
            if f.category == "income":
                subcategory_stats[f.subcategory]["income"] += f.amount
            else:
                subcategory_stats[f.subcategory]["expense"] += f.amount
        
        return {
            "success": True,
            "period": {
                "start_date": start.isoformat(),
                "end_date": end.isoformat()
            },
            "summary": {
                "total_income": total_income,
                "total_expense": abs(total_expense),
                "net_balance": net_balance
            },
            "subcategory_stats": subcategory_stats,
            "record_count": len(finances)
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"分析失败: {str(e)}"
        }
