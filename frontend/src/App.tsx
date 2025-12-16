import React, { useState } from 'react';
import { Layout, Menu, theme, Form, Card, Input, Select, Button, message, Modal } from 'antd';
import { 
  DashboardOutlined, 
  MessageOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  SettingOutlined,
  SmileOutlined,
  DollarCircleOutlined,
  CodeOutlined,
  BookFilled
} from '@ant-design/icons';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

// 导入页面组件
import EmotionManagementPage from './pages/EmotionManagementPage';
import FinanceManagementPage from './pages/FinanceManagementPage';
import SkillManagementPage from './pages/SkillManagementPage';
import LearningManagementPage from './pages/LearningManagementPage';
import SkillTreePage from './pages/SkillTreePage';

const { Header, Content, Sider } = Layout;

// 侧边栏导航组件
const SiderMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    token: {}, 
  } = theme.useToken();

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={(e) => handleMenuClick(e.key)}
        items={[
          {
            key: '/',
            icon: <DashboardOutlined />,
            label: '仪表盘',
          },
          {
            key: '/chat',
            icon: <MessageOutlined />,
            label: 'AI聊天',
          },
          {
            key: '/skill-tree',
            icon: <BookOutlined />,
            label: '技能树',
          },
          {
            key: '/data',
            icon: <FileTextOutlined />,
            label: '数据管理',
            children: [
              {
                key: '/data/emotions',
                icon: <SmileOutlined />,
                label: '情感记录',
              },
              {
                key: '/data/finances',
                icon: <DollarCircleOutlined />,
                label: '财务记录',
              },
              {
                key: '/data/skills',
                icon: <CodeOutlined />,
                label: '技能记录',
              },
              {
                key: '/data/learnings',
                icon: <BookFilled />,
                label: '学习记录',
              },
            ],
          },
          {
            key: '/settings',
            icon: <SettingOutlined />,
            label: '设置',
          },
        ]}
      />
    </Sider>
  );
};

// 主布局组件
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    token: { colorBgContainer, borderRadiusLG }, 
  } = theme.useToken();

  return (
    <Layout style={{ height: '100vh' }}>
      <SiderMenu />
      <Layout style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

// 仪表盘页面
const DashboardPage: React.FC = () => {
  return <div>个人洞察仪表盘</div>;
};

// 导入工具调用可视化组件
import ToolCallVisualization from './components/ToolCallVisualization';

// AI聊天页面
const ChatPage: React.FC = () => {
  // 扩展消息类型，支持工具调用信息
  interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    tool_calls?: any[]; // 工具调用信息
    timestamp?: number; // 消息时间戳
    isTyping?: boolean; // 正在输入状态
  }

  // 聊天会话类型
  interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  
  // 用于删除确认弹窗的状态管理
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string>('');
  
  // 聊天消息区域的ref，用于自动滚动到底部
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  
  // 跟踪用户是否手动滚动了聊天记录
  const [userScrolled, setUserScrolled] = React.useState(false);
  // 跟踪是否需要显示滚动到底部按钮
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  
  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 监听滚动事件，判断用户是否手动滚动
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // 计算当前滚动位置距离底部的距离
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      
      // 如果距离底部超过50px，说明用户手动滚动了
      if (distanceToBottom > 50) {
        setUserScrolled(true);
        setShowScrollButton(true);
      } else {
        setUserScrolled(false);
        setShowScrollButton(false);
      }
    }
  };
  
  // 当消息更新时，只有在用户没有手动滚动的情况下才自动滚动到底部
  React.useEffect(() => {
    if (!userScrolled) {
      scrollToBottom();
    } else {
      // 如果用户手动滚动了，显示滚动到底部按钮
      setShowScrollButton(true);
    }
  }, [messages, userScrolled]);
  
  // 手动滚动到底部的函数
  const handleManualScrollToBottom = () => {
    scrollToBottom();
    setUserScrolled(false);
    setShowScrollButton(false);
  };

  // 初始化：从localStorage加载聊天会话
  React.useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      
      // 如果有会话，激活最后一个会话
      if (parsedSessions.length > 0) {
        const lastSession = parsedSessions[parsedSessions.length - 1];
        setActiveSessionId(lastSession.id);
        setMessages(lastSession.messages);
      }
    } else {
      // 创建一个新的默认会话
      createNewSession();
    }
  }, []);

  // 创建新会话
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: '新会话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setActiveSessionId(newSession.id);
    setMessages([]);
    
    // 保存到localStorage
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  // 切换会话
  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  // 显示删除确认弹窗
  const showDeleteConfirm = (sessionId: string) => {
    setSessionIdToDelete(sessionId);
    setIsDeleteModalVisible(true);
  };
  
  // 确认删除会话
  const handleDeleteConfirm = () => {
    if (sessionIdToDelete) {
      // 执行删除逻辑
      const updatedSessions = sessions.filter(s => s.id !== sessionIdToDelete);
      
      // 如果删除的是当前活跃会话
      if (sessionIdToDelete === activeSessionId) {
        if (updatedSessions.length > 0) {
          const firstSession = updatedSessions[0];
          setActiveSessionId(firstSession.id);
          setMessages(firstSession.messages);
        } else {
          // 如果删除了最后一个会话，清空活跃会话和消息
          setActiveSessionId('');
          setMessages([]);
        }
      }
      
      // 更新会话列表和localStorage
      setSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      
      // 关闭弹窗
      setIsDeleteModalVisible(false);
      setSessionIdToDelete('');
    }
  };
  
  // 取消删除会话
  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setSessionIdToDelete('');
  };

  // 更新会话标题
  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          title: newTitle,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    
    setSessions(updatedSessions);
    // 保存到localStorage
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  // 保存聊天消息到当前会话
  const saveMessagesToSession = (updatedMessages: ChatMessage[]) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        // 更新会话标题（优先使用AI回复总结，其次使用用户第一条消息）
        let newTitle = s.title;
        if (newTitle === '新会话' && updatedMessages.length > 0) {
          // 查找是否有AI回复
          const aiMessage = updatedMessages.find(m => m.role === 'assistant' && m.content);
          if (aiMessage && aiMessage.content) {
            // 使用AI回复的前20个字符作为标题（AI的回复通常更能概括会话主题）
            newTitle = aiMessage.content.substring(0, 20) + (aiMessage.content.length > 20 ? '...' : '');
          } else {
            // 如果没有AI回复，使用第一条用户消息
            const firstUserMessage = updatedMessages.find(m => m.role === 'user');
            if (firstUserMessage) {
              newTitle = firstUserMessage.content.substring(0, 20) + (firstUserMessage.content.length > 20 ? '...' : '');
            }
          }
        }
        
        return {
          ...s,
          messages: updatedMessages,
          title: newTitle,
          updatedAt: Date.now()
        };
      }
      return s;
    });
    
    setSessions(updatedSessions);
    // 保存到localStorage
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input, 
      timestamp: Date.now() 
    };
    
    // 先更新UI，显示用户消息
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessagesToSession(updatedMessages);
    
    setInput('');
    setLoading(true);

    try {
      // 从本地存储获取AI模型配置和用户选择的模型
      const savedConfig = localStorage.getItem('aiModelConfig');
      const modelConfig = savedConfig ? JSON.parse(savedConfig) : {};
      const userSelectedModel = localStorage.getItem('selectedAiModel') || 'auto';
      
      // 确定要使用的模型和API密钥
      let selectedModel = null;
      let selectedApiKey = null;
      let selectedModelName = null;
      
      // 根据用户选择的具体模型版本确定模型类型和名称
      if (userSelectedModel === 'auto') {
        // 自动选择（优先级：OpenAI > DeepSeek > 豆包）
        if (modelConfig.openaiApiKey) {
          selectedModel = 'openai';
          selectedApiKey = modelConfig.openaiApiKey;
          selectedModelName = modelConfig.openaiModel || 'gpt-3.5-turbo';
        } else if (modelConfig.deepseekApiKey) {
          selectedModel = 'deepseek';
          selectedApiKey = modelConfig.deepseekApiKey;
          selectedModelName = modelConfig.deepseekModel || 'deepseek-chat';
        } else if (modelConfig.doubaoApiKey) {
          selectedModel = 'doubao';
          selectedApiKey = modelConfig.doubaoApiKey;
          selectedModelName = modelConfig.doubaoModel || 'doubao-seed-1-6-251015';
        }
      } else {
        // 根据具体模型版本确定模型类型
        selectedModelName = userSelectedModel;
        
        // 确定模型类型
        if (userSelectedModel.startsWith('gpt-')) {
          // OpenAI模型
          selectedModel = 'openai';
          selectedApiKey = modelConfig.openaiApiKey;
        } else if (userSelectedModel.startsWith('deepseek-')) {
          // DeepSeek模型
          selectedModel = 'deepseek';
          selectedApiKey = modelConfig.deepseekApiKey;
        } else if (userSelectedModel.startsWith('doubao-')) {
          // 豆包模型
          selectedModel = 'doubao';
          selectedApiKey = modelConfig.doubaoApiKey;
        }
      }
      
      // 如果没有获取到有效的API密钥，尝试自动选择
      if (!selectedApiKey && userSelectedModel !== 'auto') {
        if (modelConfig.openaiApiKey) {
          selectedModel = 'openai';
          selectedApiKey = modelConfig.openaiApiKey;
          selectedModelName = modelConfig.openaiModel || 'gpt-3.5-turbo';
        } else if (modelConfig.deepseekApiKey) {
          selectedModel = 'deepseek';
          selectedApiKey = modelConfig.deepseekApiKey;
          selectedModelName = modelConfig.deepseekModel || 'deepseek-chat';
        } else if (modelConfig.doubaoApiKey) {
          selectedModel = 'doubao';
          selectedApiKey = modelConfig.doubaoApiKey;
          selectedModelName = modelConfig.doubaoModel || 'doubao-seed-1-6-251015';
        }
      }
      
      // 使用流式请求获取AI响应
      const response = await fetch('http://localhost:8000/api/agent/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          chat_history: messages,
          model: selectedModel,
          model_name: selectedModelName,
          api_key: selectedApiKey
        }),
      });

      if (response.ok && response.body) {
        // 初始化AI响应消息，添加"正在输入..."状态
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isTyping: true
        };
        const tempMessages = [...updatedMessages, aiMessage];
        setMessages(tempMessages);
        
        // 获取流式响应阅读器
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialData = '';
        let finalChatHistory: ChatMessage[] = [];
        
        try {
          // 读取流式响应
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // 解码新数据
            const chunk = decoder.decode(value, { stream: true });
            partialData += chunk;
            
            // 处理SSE格式的数据
            const lines = partialData.split('\n\n');
            // 保存未处理完的行
            partialData = lines.pop() || '';
            
            // 处理每一行完整的SSE消息
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                try {
                  const data = JSON.parse(jsonStr);
                  
                  if (data.chunk) {
                    // 更新AI消息内容
                    tempMessages[tempMessages.length - 1].content += data.chunk;
                    setMessages([...tempMessages]);
                  }
                  
                  if (data.done) {
                    // 流式传输结束，保存完整的聊天历史
                    finalChatHistory = data.chat_history.map((msg: any) => ({
                      ...msg,
                      timestamp: msg.timestamp || Date.now(),
                      isTyping: false // 确保移除正在输入状态
                    }));
                  }
                } catch (e) {
                  console.error('解析SSE数据失败:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('流式响应处理失败:', error);
          tempMessages[tempMessages.length - 1].content += '\n\n抱歉，流式响应处理失败，请稍后再试。';
          setMessages([...tempMessages]);
        } finally {
          // 确保阅读器被释放
          reader.releaseLock();
        }
        
        // 保存最终的聊天历史
        if (finalChatHistory.length > 0) {
          setMessages(finalChatHistory);
          saveMessagesToSession(finalChatHistory);
        } else {
          // 如果没有获取到最终的聊天历史，使用临时消息
          saveMessagesToSession(tempMessages);
        }
      } else {
        const errorMessage: ChatMessage = { 
          role: 'assistant', 
          content: '抱歉，我暂时无法处理你的请求，请稍后再试。',
          timestamp: Date.now() 
        };
        const errorMessages = [...updatedMessages, errorMessage];
        setMessages(errorMessages);
        saveMessagesToSession(errorMessages);
      }
    } catch (error) {
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: '抱歉，连接服务器失败，请检查网络连接。',
        timestamp: Date.now() 
      };
      const errorMessages = [...updatedMessages, errorMessage];
      setMessages(errorMessages);
      saveMessagesToSession(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container" style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
      {/* 左侧：历史聊天列表 */}
      <div 
        style={{
          width: '300px',
          backgroundColor: '#f0f2f5',
          borderRight: '1px solid #e8e8e8',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        {/* 会话列表头部 */}
        <div 
          style={{
            padding: '16px',
            borderBottom: '1px solid #e8e8e8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ margin: 0 }}>聊天记录</h3>
          <button
            onClick={createNewSession}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            + 新会话
          </button>
        </div>
        
        {/* 会话列表 */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => switchSession(session.id)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                backgroundColor: session.id === activeSessionId ? '#e6f7ff' : '#ffffff',
                border: session.id === activeSessionId ? '1px solid #91d5ff' : '1px solid #e8e8e8',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                  {session.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 防止触发会话切换
                    showDeleteConfirm(session.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'transparent',
                    color: '#8c8c8c',
                    border: '1px solid #d9d9d9',
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '40px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  删除
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>
                {new Date(session.updatedAt).toLocaleString('zh-CN')}
              </div>
              <div 
                style={{
                  fontSize: '12px',
                  color: '#595959',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {session.messages.length > 0 
                  ? session.messages[session.messages.length - 1].content 
                  : '无消息'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 右侧：当前聊天内容 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 聊天头部 */}
        <div 
          className="chat-header" 
          style={{ 
            padding: '16px', 
            borderBottom: '1px solid #e8e8e8', 
            backgroundColor: '#f0f2f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <h2 style={{ margin: 0 }}>AI聊天助手</h2>
          
          {/* 模型选择 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#666' }}>模型:</label>
            <select
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid #d9d9d9',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                minWidth: '200px'
              }}
              onChange={(e) => {
                localStorage.setItem('selectedAiModel', e.target.value);
              }}
              defaultValue={localStorage.getItem('selectedAiModel') || 'auto'}
            >
              <option value="auto">自动选择</option>
              <option value="gpt-3.5-turbo">OpenAI - GPT-3.5 Turbo</option>
              <option value="gpt-4">OpenAI - GPT-4</option>
              <option value="deepseek-chat">DeepSeek - DeepSeek Chat</option>
              <option value="deepseek-coder">DeepSeek - DeepSeek Coder</option>
              <option value="doubao-seed-1-6-251015">豆包 - 1.6 Pro (seed)</option>
              <option value="doubao-seed-1-6-lite-251015">豆包 - 1.6 Lite (seed)</option>
              <option value="doubao-seed-1-6-flash-250828">豆包 - 1.6 Flash (seed)</option>
              <option value="doubao-seed-1-6-vision-250815">豆包 - 1.6 Vision (seed)</option>
            </select>
          </div>
        </div>
        
        {/* 右侧聊天内容 - 固定输入区域在底部 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* 聊天消息区域 - 外层容器，用于定位滚动按钮 */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* 聊天消息区域 */}
            <div 
              ref={messagesContainerRef}
              className="chat-messages" 
              style={{ 
                height: '100%',
                overflowY: 'auto', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#ffffff',
                wordBreak: 'break-word'
              }}
              onScroll={handleScroll}
            >
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <div 
                    style={{
                      padding: '12px 16px',
                      borderRadius: '18px',
                      backgroundColor: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                      color: msg.role === 'user' ? 'white' : 'black',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    {msg.content}
                    {msg.isTyping && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#8c8c8c', 
                        marginLeft: '5px',
                        fontStyle: 'italic'
                      }}>
                        正在输入...
                      </span>
                    )}
                  </div>
                  {/* 显示工具调用过程 */}
                  {msg.tool_calls && msg.tool_calls.length > 0 && (
                    <div style={{ marginTop: '10px', width: '100%' }}>
                      <ToolCallVisualization 
                        steps={msg.tool_calls.map(call => ({
                          thought: call.thought || '无思考过程',
                          action: call.action || '未知工具',
                          action_input: call.action_input || {},
                          observation: call.observation || '无结果',
                          status: 'success'
                        }))} 
                      />
                    </div>
                  )}
                </div>
              ))}
              {/* 用于自动滚动到底部的占位元素 */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* 一键滚动到底部按钮 - 放置在消息容器的外层，固定在右下角 */}
            {showScrollButton && (
              <button
                onClick={handleManualScrollToBottom}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '16px',
                  transition: 'all 0.3s',
                  opacity: 0.8,
                  zIndex: 10,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="滚动到最新消息"
              >
                ↓
              </button>
            )}
          </div>
          
          {/* 聊天输入区域 - 固定在底部 */}
          <div className="chat-input" style={{ padding: '16px', borderTop: '1px solid #e8e8e8', backgroundColor: '#f0f2f5', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入消息..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '24px',
                border: '1px solid #d9d9d9',
                fontSize: '14px',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '24px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
              }}
            >
              {loading ? '发送中...' : '发送'}
            </button>
          </div>
        </div>
      </div>
    
    {/* 删除确认弹窗 */}
    <Modal
      title="确认删除"
      open={isDeleteModalVisible}
      onOk={handleDeleteConfirm}
      onCancel={handleDeleteCancel}
      okText="确认删除"
      cancelText="取消"
      centered
    >
      <p>确定要删除这个聊天会话吗？此操作不可恢复。</p>
    </Modal>
  </div>
);
};

// 数据管理首页
const DataManagementPage: React.FC = () => {
  return <div>请选择要管理的数据类型</div>;
};

// 财务记录页面已从外部导入

// 技能记录页面已从外部导入

// 学习记录页面已从外部导入

// 设置页面
const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  
  // 加载本地存储的配置
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('aiModelConfig');
    if (savedConfig) {
      form.setFieldsValue(JSON.parse(savedConfig));
    }
  }, [form]);
  
  // 保存配置到本地存储
  const handleSave = (values: any) => {
    localStorage.setItem('aiModelConfig', JSON.stringify(values));
    message.success('配置保存成功');
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>AI模型配置</h2>
      <p>请配置以下AI模型的API密钥，用于AI聊天功能</p>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ maxWidth: 600, marginTop: 20 }}
      >
        {/* OpenAI配置 */}
        <Card title="OpenAI" size="small" style={{ marginBottom: 20 }}>
          <Form.Item
            name="openaiApiKey"
            label="API Key"
            rules={[{ required: false, message: '请输入OpenAI API Key' }]}
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item
            name="openaiModel"
            label="模型"
          >
            <Select defaultValue="gpt-3.5-turbo">
              <Select.Option value="gpt-3.5-turbo">gpt-3.5-turbo</Select.Option>
              <Select.Option value="gpt-4">gpt-4</Select.Option>
              <Select.Option value="gpt-4o">gpt-4o</Select.Option>
            </Select>
          </Form.Item>
        </Card>
        
        {/* DeepSeek配置 */}
        <Card title="DeepSeek" size="small" style={{ marginBottom: 20 }}>
          <Form.Item
            name="deepseekApiKey"
            label="API Key"
            rules={[{ required: false, message: '请输入DeepSeek API Key' }]}
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item
            name="deepseekModel"
            label="模型"
          >
            <Select defaultValue="deepseek-chat">
              <Select.Option value="deepseek-chat">deepseek-chat</Select.Option>
              <Select.Option value="deepseek-coder">deepseek-coder</Select.Option>
            </Select>
          </Form.Item>
        </Card>
        
        {/* 豆包配置 */}
        <Card title="豆包" size="small" style={{ marginBottom: 20 }}>
          <Form.Item
            name="doubaoApiKey"
            label="API Key"
            rules={[{ required: false, message: '请输入豆包API Key' }]}
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item
            name="doubaoModel"
            label="模型"
          >
            <Select defaultValue="doubao-seed-1-6-251015">
              <Select.Option value="doubao-seed-1-6-251015">豆包1.6 Pro (seed)</Select.Option>
              <Select.Option value="doubao-seed-1-6-lite-251015">豆包1.6 Lite (seed)</Select.Option>
              <Select.Option value="doubao-seed-1-6-flash-250828">豆包1.6 Flash (seed)</Select.Option>
              <Select.Option value="doubao-seed-1-6-vision-250815">豆包1.6 Vision (seed)</Select.Option>
            </Select>
          </Form.Item>
        </Card>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
            保存配置
          </Button>
          <Button onClick={() => form.resetFields()}>
            重置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/skill-tree" element={<SkillTreePage />} />
          <Route path="/data" element={<DataManagementPage />} />
          <Route path="/data/emotions" element={<EmotionManagementPage />} />
          <Route path="/data/finances" element={<FinanceManagementPage />} />
          <Route path="/data/skills" element={<SkillManagementPage />} />
          <Route path="/data/learnings" element={<LearningManagementPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;