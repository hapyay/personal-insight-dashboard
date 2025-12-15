# 测试模型导入
from app.core.database import Base
from app import models

print("已导入的模型：")
for name, cls in Base.metadata.tables.items():
    print(f"- {name}")

print(f"\n模型数量：{len(Base.metadata.tables)}")
