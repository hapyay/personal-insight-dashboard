from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.ai.agent import handle_agent_request

router = APIRouter()

# 请求模型
class AgentRequest(BaseModel):
    input: str
    chat_history: List[Dict[str, Any]]
    model: Optional[str] = None  # 可选，指定使用的AI模型类型（openai, deepseek, doubao）
    model_name: Optional[str] = None  # 可选，具体模型名称
    api_key: Optional[str] = None  # 可选，模型的API密钥

# 响应模型
class AgentResponse(BaseModel):
    response: str
    chat_history: List[Dict[str, Any]]

# AI Agent 聊天端点 - 异步实现
@router.post("/chat", response_model=AgentResponse)
async def chat_with_agent(request: AgentRequest):
    """
    与AI Agent进行聊天，支持工具调用和多轮对话
    
    Args:
        input: 用户输入文本
        chat_history: 聊天历史记录，格式为[{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
        model: 可选，指定使用的AI模型类型，如：openai, deepseek, doubao
        model_name: 可选，具体模型名称，如：gpt-3.5-turbo, deepseek-chat, doubao-pro-1-6
        api_key: 可选，模型的API密钥
    
    Returns:
        包含AI响应和更新后的聊天历史的对象
    """
    try:
        result = await handle_agent_request(
            input_text=request.input,
            chat_history=request.chat_history,
            model=request.model,
            model_name=request.model_name,
            api_key=request.api_key
        )
        return AgentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Agent处理失败: {str(e)}")

# AI 工具列表端点
@router.get("/tools")
def get_agent_tools():
    """
    获取AI Agent可用的工具列表
    
    Returns:
        包含工具列表的对象
    """
    from app.services.ai.tools import TOOLS
    
    tools_info = []
    for tool in TOOLS:
        tools_info.append({
            "name": tool.name,
            "description": tool.description,
            "args_schema": tool.args_schema.__name__ if hasattr(tool, "args_schema") else None
        })
    
    return {
        "status": "success",
        "tools": tools_info,
        "count": len(tools_info)
    }

# 健康检查端点
@router.get("/health")
def agent_health_check():
    """
    AI Agent健康检查
    
    Returns:
        健康状态信息
    """
    return {
        "status": "healthy",
        "service": "LangChain Agent",
        "message": "AI Agent服务运行正常"
    }