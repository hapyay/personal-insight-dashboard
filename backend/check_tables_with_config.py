from sqlalchemy import create_engine, inspect
from app.core.config import settings
from app.core.database import Base
from app import models

# 使用应用配置的数据库URL
engine = create_engine(settings.DATABASE_URL)

# 创建inspector对象
inspector = inspect(engine)

# 获取所有表
print("使用SQLAlchemy检查数据库中的表：")
tables = inspector.get_table_names()
for table in tables:
    print(f"- {table}")

print(f"\n表数量：{len(tables)}")

# 关闭连接
engine.dispose()
