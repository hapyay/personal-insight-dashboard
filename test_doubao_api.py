#!/usr/bin/env python3
"""
直接测试豆包API的脚本
不通过LangChain，直接使用requests库调用豆包API
"""

import requests
import json
import time

# 豆包API配置
DOUBAO_API_KEY = "e4f4187f-fd7d-472c-8b8c-b68e1d5b6a88"
DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL_NAME = "doubao-1.6-pro"

# 测试用例
TEST_MESSAGES = [
    {
        "role": "user",
        "content": "你好，我是测试用户"
    }
]

def test_doubao_api_direct():
    """
    直接测试豆包API
    """
    print("直接测试豆包API开始")
    print("=" * 50)
    
    # 构建请求数据
    request_data = {
        "model": DOUBAO_MODEL_NAME,
        "messages": TEST_MESSAGES,
        "temperature": 0.7,
        "max_tokens": 1024
    }
    
    # 构建请求头
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DOUBAO_API_KEY}"
    }
    
    try:
        # 发送请求
        response = requests.post(
            f"{DOUBAO_BASE_URL}/chat/completions",
            json=request_data,
            headers=headers,
            timeout=30
        )
        
        print(f"HTTP状态码: {response.status_code}")
        print(f"响应头: {json.dumps(dict(response.headers), indent=2)}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("\nAPI调用成功")
            print(f"生成的文本: {result['choices'][0]['message']['content']}")
        else:
            print(f"\nAPI调用失败: {response.text}")
            
    except Exception as e:
        print(f"\nAPI调用异常: {str(e)}")

if __name__ == "__main__":
    test_doubao_api_direct()
