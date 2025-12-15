# 个人洞察仪表盘（Personal Insight Dashboard）

## 版本号

当前版本：0.0.1（开发中）

## 项目概述

个人洞察仪表盘是一个基于AI技术的个人数据管理和分析平台，帮助用户管理和分析情感、财务、技能和学习数据，提供智能洞察和建议。

**注意**：本项目目前处于开发中阶段，尚未达到可用版本，部分功能可能不完整或存在bug。

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design 5.x
- Vite
- React Router DOM
- Axios
- dayjs
- ECharts
- D3.js
- react-query

### 后端
- FastAPI
- Python 3.10
- SQLAlchemy 2.0
- SQLite
- Pydantic V2
- LangChain
- LangChain Agents
- ChromaDB

### 部署
- Docker
- Docker Compose
- Nginx

## 功能模块

### 1. 情感管理
- 情感记录的创建、查询、更新和删除
- 情感分类和情感分数分析
- 情感趋势可视化

### 2. 财务管理
- 收入和支出记录管理
- 财务分类和标签
- 财务统计和可视化
- 按日期范围查询

### 3. 技能管理
- 技能记录的创建、查询、更新和删除
- 技能等级和进度跟踪
- 技能学习路径管理

### 4. 学习管理
- 学习记录的创建、查询、更新和删除
- 学习时长统计
- 技能关联学习记录

### 5. 技能树可视化
- 基于D3.js的技能树可视化
- 技能等级和进度展示
- 交互式缩放功能

### 6. AI聊天功能
- 基于LangChain Agent的智能聊天
- 支持工具调用，实现数据查询和创建
- 多轮对话记忆

### 7. 跨域数据关联查询
- 按日期关联多域数据
- 技能与学习记录关联查询
- 学习时长统计

## 项目结构

```
.
├── frontend/              # 前端项目
│   ├── src/               # 源码
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   └── styles/        # 样式
│   ├── Dockerfile         # Docker配置
│   ├── nginx/             # Nginx配置
│   └── vite.config.ts     # Vite配置
├── backend/               # 后端项目
│   ├── app/               # 应用代码
│   │   ├── api/           # API路由
│   │   ├── ai/            # AI相关代码
│   │   ├── core/          # 核心配置
│   │   ├── crud/           # CRUD操作
│   │   ├── models/         # 数据模型
│   │   └── schemas/        # Pydantic模式
│   ├── Dockerfile          # Docker配置
│   └── requirements.txt    # 依赖列表
└── docker-compose.yml      # Docker Compose配置
```

## 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

1. 克隆项目

```bash
git clone https://github.com/hapyay/personal-insight-dashboard.git
cd personal-insight-dashboard
```

2. 创建环境变量文件

```bash
# 后端环境变量
cp backend/.env.example backend/.env
```

3. 修改环境变量

编辑 `backend/.env` 文件，配置所需的环境变量，特别是API密钥。

4. 启动服务

```bash
docker-compose up -d
```

5. 访问应用

- 前端: http://localhost:5173
- 后端API文档: http://localhost:8000

## 开发指南

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 后端开发

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API文档

API文档采用OpenAPI规范，可通过以下地址访问：

- http://localhost:8000/docs
- http://localhost:8000/redoc

## 项目阶段

### 第一阶段：基础架构搭建
- 前后端项目初始化
- 数据库设计和初始化
- 基础路由和组件设计

### 第二阶段：核心功能开发
- 情感、财务、技能和学习记录的CRUD功能
- 前端页面开发
- API端点开发

### 第三阶段：高级功能开发
- 技能树可视化
- LangChain Agent集成
- 工具调用功能
- 跨域数据关联查询

### 第四阶段：优化和部署
- 项目性能优化
- Docker部署配置
- 项目打包和测试
- 文档完善

## 许可证

Apache-2.0 license

## 贡献

欢迎提交Issue和Pull Request。

## 联系方式

如有问题或建议，请通过以下方式联系：

- Email: 2655076437@qq.com
- GitHub Issues: https://github.com/hapyay/personal-insight-dashboard/issues
本次开发全程使用AI coding，我刚入门代码开发，如有问题欢迎指正。