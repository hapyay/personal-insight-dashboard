# 贡献指南

## 项目概述

个人洞察仪表盘是一个基于AI技术的个人数据管理和分析平台，帮助用户管理和分析情感、财务、技能和学习数据，提供智能洞察和建议。

## 贡献方式

### 提交Issue

如果您发现了bug或有新功能建议，可以通过以下步骤提交Issue：

1. 访问项目的GitHub Issues页面
2. 点击"New issue"按钮
3. 选择合适的模板（Bug报告或功能请求）
4. 填写详细信息
5. 提交Issue

### 提交Pull Request

如果您想直接贡献代码，可以通过以下步骤提交Pull Request：

1. Fork项目仓库
2. 创建一个新分支：`git checkout -b feature/your-feature-name`
3. 提交更改：`git commit -m "Add your commit message"`
4. 推送到远程分支：`git push origin feature/your-feature-name`
5. 创建Pull Request

## 开发指南

### 环境搭建

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器将在 http://localhost:5173 启动。

#### 后端开发

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端开发服务器将在 http://127.0.0.1:8000 启动。

### 代码规范

#### 前端

- 使用TypeScript
- 遵循ESLint规则
- 组件命名使用PascalCase
- 文件命名使用PascalCase（组件）或camelCase（工具函数）
- 代码缩进使用2个空格

#### 后端

- 使用Python 3.10+
- 遵循PEP 8编码规范
- 使用Pydantic V2进行数据验证
- 函数和变量命名使用snake_case
- 类命名使用PascalCase

### 测试

- 前端：使用Vitest和React Testing Library
- 后端：使用pytest

### 提交规范

提交信息应遵循以下格式：

```
<类型>: <描述>

<详细说明>
```

类型包括：

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码风格调整
- refactor: 代码重构
- test: 测试代码
- chore: 构建过程或辅助工具的变动

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
│   └── package.json       # 依赖列表
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

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/your-repo/personal-insight-dashboard/issues
