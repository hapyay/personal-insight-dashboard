#!/usr/bin/env python3
"""
AI模型API测试脚本
测试豆包、OpenAI和DeepSeek模型的API调用
"""

import requests
import json
import time

# 后端API地址
API_BASE_URL = "http://localhost:8000/api/agent"

# 测试用的API密钥
TEST_API_KEYS = {
    "doubao": "e4f4187f-fd7d-472c-8b8c-b68e1d5b6a88"
    # 可以在这里添加其他模型的API密钥进行测试
    # "openai": "your-openai-api-key",
    # "deepseek": "your-deepseek-api-key"
}

# 测试用例
TEST_CASES = [
    {
        "name": "基本聊天测试",
        "model": "doubao",
        "model_name": "doubao-seed-1-6-251015",
        "input": "你好，我是测试用户",
        "expected": "包含问候或自我介绍的响应"
    },
    {
        "name": "多轮对话测试 - 第一轮",
        "model": "doubao",
        "model_name": "doubao-seed-1-6-251015",
        "input": "什么是机器学习？",
        "expected": "机器学习的定义或解释"
    },
    {
        "name": "情感分析测试",
        "model": "doubao",
        "model_name": "doubao-seed-1-6-251015",
        "input": "我今天心情很好，因为天气不错，而且工作顺利。",
        "expected": "包含情感分析的响应"
    },
    {
        "name": "财务问题测试",
        "model": "doubao",
        "model_name": "doubao-seed-1-6-251015",
        "input": "如何制定个人预算计划？",
        "expected": "包含财务建议的响应"
    },
    {
        "name": "学习建议测试",
        "model": "doubao",
        "model_name": "doubao-seed-1-6-251015",
        "input": "我想学习Python编程，有什么好的学习资源推荐？",
        "expected": "包含学习资源推荐的响应"
    }
]

def test_ai_chat_api():
    """
    测试AI聊天API
    """
    print("开始测试AI聊天API...")
    print("=" * 50)
    
    for api_key_name, api_key in TEST_API_KEYS.items():
        print(f"\n测试模型: {api_key_name}")
        print("-" * 30)
        
        # 多轮对话测试
        chat_history = []
        
        for test_case in TEST_CASES:
            if test_case["model"] == api_key_name:
                print(f"\n测试用例: {test_case['name']}")
                print(f"输入: {test_case['input']}")
                
                # 构建请求数据
                request_data = {
                    "input": test_case["input"],
                    "chat_history": chat_history,
                    "model": test_case["model"],
                    "model_name": test_case["model_name"],
                    "api_key": api_key
                }
                
                try:
                    # 发送请求
                    response = requests.post(
                        f"{API_BASE_URL}/chat",
                        json=request_data,
                        headers={"Content-Type": "application/json"},
                        timeout=30
                    )
                    
                    # 检查响应状态码
                    if response.status_code == 200:
                        result = response.json()
                        print(f"响应: {result['response'][:100]}...")
                        print(f"状态: 成功")
                        
                        # 更新聊天历史
                        chat_history = result["chat_history"]
                        
                        # 验证响应内容
                        if test_case['expected'].lower() in result['response'].lower():
                            print(f"验证: 通过 (包含预期内容)")
                        else:
                            print(f"验证: 警告 (未包含预期内容)")
                    else:
                        print(f"状态: 失败 (HTTP {response.status_code})")
                        print(f"错误信息: {response.text}")
                        
                except Exception as e:
                    print(f"状态: 异常")
                    print(f"错误信息: {str(e)}")
                
                # 等待一段时间，避免API限流
                time.sleep(2)
        
        # 测试工具列表端点
        print("\n测试工具列表端点...")
        try:
            response = requests.get(f"{API_BASE_URL}/tools", timeout=10)
            if response.status_code == 200:
                result = response.json()
                print(f"可用工具数量: {result['count']}")
                print(f"工具列表: {[tool['name'] for tool in result['tools'][:5]]}...")
                print(f"状态: 成功")
            else:
                print(f"状态: 失败 (HTTP {response.status_code})")
        except Exception as e:
            print(f"状态: 异常")
            print(f"错误信息: {str(e)}")

        # 测试健康检查端点
        print("\n测试健康检查端点...")
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                result = response.json()
                print(f"服务状态: {result['status']}")
                print(f"状态: 成功")
            else:
                print(f"状态: 失败 (HTTP {response.status_code})")
        except Exception as e:
            print(f"状态: 异常")
            print(f"错误信息: {str(e)}")

def test_model_variations():
    """
    测试不同模型参数的效果
    """
    print("\n" + "=" * 50)
    print("测试不同模型参数...")
    print("=" * 50)
    
    model_name = "doubao"
    if model_name not in TEST_API_KEYS:
        print(f"跳过: 未配置{model_name}的API密钥")
        return
    
    api_key = TEST_API_KEYS[model_name]
    
    # 测试所有提供的豆包模型名称
    model_variations = [
        "doubao-seed-1-6-251015",
        "doubao-seed-1-6-lite-251015",
        "doubao-seed-1-6-flash-250828",
        "doubao-seed-1-6-vision-250815"
    ]
    
    for model_variation in model_variations:
        print(f"\n测试模型: {model_variation}")
        print("-" * 30)
        
        request_data = {
            "input": "简单介绍一下自己",
            "chat_history": [],
            "model": model_name,
            "model_name": model_variation,
            "api_key": api_key
        }
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/chat",
                json=request_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"响应: {result['response'][:150]}...")
                print(f"状态: 成功")
                
                # 保存完整的响应，用于调试
                with open(f"test_response_{model_variation}.json", "w", encoding="utf-8") as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
            else:
                print(f"状态: 失败 (HTTP {response.status_code})")
                print(f"错误信息: {response.text}")
        except Exception as e:
            print(f"状态: 异常")
            print(f"错误信息: {str(e)}")
        
        time.sleep(2)

if __name__ == "__main__":
    print("AI模型API测试开始")
    print("=" * 50)
    
    # 测试AI聊天API
    test_ai_chat_api()
    
    # 测试不同模型参数
    test_model_variations()
    
    print("\n" + "=" * 50)
    print("AI模型API测试结束")
