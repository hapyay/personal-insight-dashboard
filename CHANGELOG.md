# 个人洞察仪表盘 - 变更日志

## [0.0.1] - 2025-12-15

### 新增功能

#### 前端功能
- 实现了双栏布局的AI聊天页面
- 支持多会话管理，包括创建、切换、删除会话
- 聊天历史持久化到localStorage
- 支持消息时间戳显示
- 模型选择功能，可直接选择具体模型版本
  - OpenAI: GPT-3.5 Turbo, GPT-4
  - DeepSeek: DeepSeek Chat, DeepSeek Coder
  - 豆包: 1.6 Pro (seed), 1.6 Lite (seed), 1.6 Flash (seed), 1.6 Vision (seed)
- 技能树可视化功能，基于D3.js
- 数据图表功能，基于ECharts
- 工具调用可视化组件

#### 后端功能
- FastAPI后端服务
- 基于SQLAlchemy的数据库管理
- 支持四种核心数据模块：情感、财务、技能、学习
- AI代理集成，支持工具调用
- 支持多种AI模型：OpenAI, DeepSeek, 豆包
- 完整的RESTful API设计

#### 部署功能
- Docker和Docker Compose配置
- Nginx反向代理配置
- 前后端分离部署架构

### 技术栈

#### 前端
- React 18 + TypeScript
- Ant Design 5.x
- Vite
- ECharts
- D3.js
- react-query

#### 后端
- FastAPI
- Python 3.10+
- SQLAlchemy 2.0
- SQLite
- LangChain
- LangChain Agents

### 项目结构

```
.
├── frontend/              # 前端项目
├── backend/               # 后端项目
├── docker-compose.yml      # Docker Compose配置
├── README.md              # 项目说明文档
└── CHANGELOG.md           # 变更日志
```

### 限制与已知问题

- 部分功能仍在开发中，可能存在bug
- AI工具调用功能有待完善
- 部分数据可视化功能需要优化
- 测试覆盖度不够

### 后续计划

- 完善AI工具调用功能
- 增加更多数据可视化图表
- 优化性能和用户体验
- 增加测试用例
- 完善文档
- 支持更多AI模型
