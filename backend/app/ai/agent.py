from typing import List, Dict, Any, Optional
from datetime import datetime
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 简化的AI聊天实现
def process_simple_request(input_text: str, chat_history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    处理用户请求，返回简化的AI响应
    
    Args:
        input_text: 用户输入文本
        chat_history: 聊天历史记录
    
    Returns:
        包含响应和聊天历史的字典
    """
    try:
        # 简化的响应逻辑，根据用户输入返回相应的回复
        response_content = ""
        
        # 检测关键词并生成响应
        if any(keyword in input_text for keyword in ["你好", "hello", "hi"]):
            response_content = "你好！我是你的个人洞察助手，我可以帮助你管理和分析你的情感、财务、技能和学习数据。\n\n提示：你可以在设置页面配置OpenAI、DeepSeek或豆包的API密钥，以获得更强大的AI聊天功能。"
        elif any(keyword in input_text for keyword in ["情感", "心情", "emotion"]):
            response_content = "我可以帮助你记录和分析情感数据。你可以告诉我你的心情，我会帮你记录下来。"
        elif any(keyword in input_text for keyword in ["财务", "收支", "money", "finance"]):
            response_content = "我可以帮助你管理财务数据。你可以告诉我你的收入或支出，我会帮你记录下来。"
        elif any(keyword in input_text for keyword in ["技能", "学习", "skill", "learning"]):
            response_content = "我可以帮助你跟踪技能和学习进度。你可以告诉我你学习了什么，我会帮你记录下来。"
        elif any(keyword in input_text for keyword in ["谢谢", "感谢", "thank"]):
            response_content = "不客气！很高兴能帮到你。"
        else:
            response_content = f"我已经收到你的消息：'{input_text}'。我正在学习如何更好地处理这类请求，敬请期待！\n\n提示：你可以在设置页面配置AI模型，以获得更智能的回复。"
        
        # 更新聊天历史
        updated_history = chat_history.copy()
        updated_history.append({"role": "user", "content": input_text})
        updated_history.append({"role": "assistant", "content": response_content})
        
        return {
            "response": response_content,
            "chat_history": updated_history
        }
    except Exception as e:
        # 处理所有异常，确保服务可用
        return {
            "response": f"AI助手暂时无法处理你的请求：{str(e)}。我们正在努力修复这个问题。",
            "chat_history": chat_history
        }

# 完整的AI模型调用实现
async def process_full_agent_request(
    input_text: str, 
    chat_history: List[Dict[str, Any]], 
    model: Optional[str] = None, 
    model_name: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    使用完整的AI模型处理请求
    
    Args:
        input_text: 用户输入文本
        chat_history: 聊天历史记录
        model: 模型类型（openai, deepseek, doubao）
        model_name: 具体模型名称
        api_key: 模型的API密钥
    
    Returns:
        包含响应和聊天历史的字典
    """
    try:
        # 根据模型名称确定模型类型和配置
        llm = None
        
        # 如果没有指定model_name，使用默认值
        if not model_name:
            model_name = "gpt-3.5-turbo"  # 默认使用OpenAI模型
        
        # 根据模型名称确定模型类型和配置
        if model_name.startswith('gpt-'):
            # OpenAI模型
            llm = ChatOpenAI(
                model=model_name,
                api_key=api_key,
                temperature=0.7
            )
        elif model_name.startswith('deepseek-'):
            # DeepSeek模型
            llm = ChatOpenAI(
                model=model_name,
                api_key=api_key,
                base_url="https://api.deepseek.com/v1",
                temperature=0.7
            )
        elif model_name.startswith('doubao-'):
            # 豆包模型
            llm = ChatOpenAI(
                model=model_name,
                api_key=api_key,
                base_url="https://ark.cn-beijing.volces.com/api/v3",
                temperature=0.7
            )
        else:
            # 其他模型，尝试使用OpenAI兼容的API
            llm = ChatOpenAI(
                model=model_name,
                api_key=api_key,
                temperature=0.7
            )
        
        # 准备聊天历史消息
        messages = []
        for msg in chat_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        
        # 添加当前用户输入
        messages.append(HumanMessage(content=input_text))
        
        # 定义提示模板
        prompt = ChatPromptTemplate.from_messages([
            (
                "system", 
                "你是一个个人洞察助手，能够帮助用户管理和分析他们的情感、财务、技能和学习数据。" 
                "请根据用户的请求提供友好、专业的回答。"
            ),
            MessagesPlaceholder(variable_name="messages")
        ])
        
        # 创建对话链
        chain = (
            {"messages": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )
        
        # 执行对话链
        response_content = await chain.ainvoke(messages)
        
        # 更新聊天历史
        updated_history = chat_history.copy()
        updated_history.append({"role": "user", "content": input_text})
        updated_history.append({"role": "assistant", "content": response_content})
        
        return {
            "response": response_content,
            "chat_history": updated_history
        }
    except Exception as e:
        print(f"AI模型调用失败: {str(e)}")
        # 如果AI模型调用失败，回退到简化响应
        return process_simple_request(input_text, chat_history)

# 主处理函数
async def handle_agent_request(
    input_text: str, 
    chat_history: List[Dict[str, Any]], 
    model: Optional[str] = None, 
    model_name: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    处理Agent请求的主函数
    
    Args:
        input_text: 用户输入文本
        chat_history: 聊天历史记录
        model: 可选，指定使用的AI模型类型（openai, deepseek, doubao）
        model_name: 可选，具体模型名称
        api_key: 可选，模型的API密钥
    
    Returns:
        包含响应和聊天历史的字典
    """
    # 如果提供了API密钥，使用完整的AI模型执行
    if api_key and model:
        try:
            return await process_full_agent_request(input_text, chat_history, model, model_name, api_key)
        except Exception as e:
            # 如果AI模型执行失败，回退到简化响应
            print(f"完整Agent执行失败: {e}")
            return process_simple_request(input_text, chat_history)
    else:
        # 否则使用简化响应
        return process_simple_request(input_text, chat_history)
