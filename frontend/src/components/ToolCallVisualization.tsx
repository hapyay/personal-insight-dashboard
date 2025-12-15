import React from 'react';
import { Card, Collapse, Tag, Descriptions, Space } from 'antd';
import { CodeOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

interface ToolCallStep {
  thought: string;
  action: string;
  action_input: any;
  observation: string;
  status: 'success' | 'error' | 'loading';
}

interface ToolCallVisualizationProps {
  steps: ToolCallStep[];
  expanded?: boolean;
}

const ToolCallVisualization: React.FC<ToolCallVisualizationProps> = ({ steps, expanded = false }) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <Card title="工具调用过程" size="small" style={{ margin: '10px 0' }}>
      <Collapse defaultActiveKey={expanded ? ['0'] : []}>
        {steps.map((step, index) => (
          <Panel 
            header={`步骤 ${index + 1}: ${step.action}`} 
            key={index} 
            extra={
              <Space>
                {step.status === 'success' && <Tag color="green" icon={<CheckCircleOutlined />}>成功</Tag>}
                {step.status === 'error' && <Tag color="red" icon={<CloseCircleOutlined />}>失败</Tag>}
                {step.status === 'loading' && <Tag color="blue" icon={<LoadingOutlined />}>执行中</Tag>}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="思考过程">{step.thought}</Descriptions.Item>
                <Descriptions.Item label="工具名称">{step.action}</Descriptions.Item>
                <Descriptions.Item label="输入参数">
                  <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(step.action_input, null, 2)}
                  </pre>
                </Descriptions.Item>
                <Descriptions.Item label="执行结果">
                  <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                    {typeof step.observation === 'string' ? (
                      step.observation
                    ) : (
                      <pre>{JSON.stringify(step.observation, null, 2)}</pre>
                    )}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

export default ToolCallVisualization;

export interface ToolCallMessage {
  role: 'tool_call' | 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCallStep[];
}
