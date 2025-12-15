# 使用Python 3.10作为基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制requirements.txt
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY . .

# 创建数据目录和向量数据库目录
RUN mkdir -p data chroma_db

# 暴露8000端口
EXPOSE 8000

# 启动FastAPI应用（生产环境）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]