import React, { useState } from 'react';
import { Layout, Menu, theme, Form, Card, Input, Select, Button, message } from 'antd';
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
    <Layout style={{ minHeight: '100vh' }}>
      <SiderMenu />
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
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

  // 删除会话
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    
    // 如果删除的是当前活跃会话，激活第一个会话或创建新会话
    if (sessionId === activeSessionId) {
      if (updatedSessions.length > 0) {
        const firstSession = updatedSessions[0];
        setActiveSessionId(firstSession.id);
        setMessages(firstSession.messages);
      } else {
        createNewSession();
      }
    }
    
    // 保存到localStorage
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
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
        // 更新会话标题（使用第一条用户消息）
        let newTitle = s.title;
        if (newTitle === '新会话' && updatedMessages.length > 0) {
          const firstUserMessage = updatedMessages.find(m => m.role === 'user');
          if (firstUserMessage) {
            newTitle = firstUserMessage.content.substring(0, 20) + (firstUserMessage.content.length > 20 ? '...' : '');
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
      
      const response = await fetch('http://localhost:8000/api/agent/chat', {
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

      if (response.ok) {
        const data = await response.json();
        // 添加时间戳到AI响应
        const aiMessageWithTimestamp = data.chat_history.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp || Date.now()
        }));
        setMessages(aiMessageWithTimestamp);
        saveMessagesToSession(aiMessageWithTimestamp);
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
          flexDirection: 'column'
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
                    deleteSession(session.id);
                  }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    fontSize: '10px',
                    cursor: 'pointer'
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
                // 保存用户选择的模型
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
        
        {/* 聊天消息区域 */}
        <div 
          className="chat-messages" 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#ffffff'
          }}
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
                      status: 'success' // 默认成功，实际应根据返回结果设置
                    }))} 
                  />
                </div>
              )}
              {/* 显示消息时间 */}
              {msg.timestamp && (
                <div 
                  style={{
                    fontSize: '10px',
                    color: '#8c8c8c',
                    marginTop: '4px',
                    textAlign: msg.role === 'user' ? 'right' : 'left'
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
              <div style={{ padding: '12px 16px', borderRadius: '18px', backgroundColor: '#f0f0f0', color: 'black', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
                正在思考中...
              </div>
            </div>
          )}
        </div>
        
        {/* 聊天输入区域 */}
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