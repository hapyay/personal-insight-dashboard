from fastapi import APIRouter

from app.api.endpoints import emotion, finance, skill, learning, insights

router = APIRouter()

# 注册情感相关路由
router.include_router(emotion.router, prefix="/emotions", tags=["emotions"])

# 注册财务相关路由
router.include_router(finance.router, prefix="/finances", tags=["finances"])

# 注册技能相关路由
router.include_router(skill.router, prefix="/skills", tags=["skills"])

# 注册学习相关路由
router.include_router(learning.router, prefix="/learnings", tags=["learnings"])

# 注册跨域数据关联查询路由
router.include_router(insights.router, prefix="/insights", tags=["insights"])

# 启用AI Agent相关路由
from app.api.endpoints import agent
router.include_router(agent.router, prefix="/agent", tags=["agent"])
