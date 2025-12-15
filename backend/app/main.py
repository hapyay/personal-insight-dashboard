from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.database import engine, Base

# 创建FastAPI应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置GZip压缩，减少响应大小
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,  # 只有大于1000字节的响应才会被压缩
    compresslevel=5,     # 压缩级别，1-9，5是平衡速度和压缩率的推荐值
)

# 导入所有模型，确保它们被注册到Base.metadata中
from app import models

# 导入并注册路由
from app.api import routes
app.include_router(routes.router, prefix=settings.API_V1_STR)

# 创建数据库表 - 必须在导入所有模型类之后执行
Base.metadata.create_all(bind=engine)
print("数据库表创建完成！")
print(f"创建的表：{list(Base.metadata.tables.keys())}")

@app.get("/")
def root():
    return {"message": "个人洞察仪表盘 API", "version": "1.0.0"}
