import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, message, Space } from 'antd';
import { ReloadOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { getSkills, Skill } from '../services/skillService';
import SkillTreeVisualization from '../components/SkillTreeVisualization';

const { Option } = Select;

const SkillTreePage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  
  // 用于跟踪是否已经执行过useEffect（解决React.StrictMode下useEffect执行两次的问题）
  const hasLoadedRef = React.useRef(false);

  // 加载技能数据
  const loadSkills = async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const data = await getSkills(0, 100, selectedCategory);
      setSkills(data);
      if (showSuccessMessage) {
        message.success('技能数据加载成功');
      }
    } catch (error) {
      message.error('技能数据加载失败');
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 组件挂载或类别变化时加载数据，不显示成功通知
    loadSkills(false);
  }, [selectedCategory]);

  // 处理缩放
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // 获取所有技能类别
  const categories = Array.from(new Set(skills.map(skill => skill.category)));

  return (
    <div className="responsive-container" style={{ padding: '20px' }}>
      <Card 
        title="技能树可视化" 
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadSkills(true)} 
              loading={loading}
            >
              刷新数据
            </Button>
            <Button 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
            >
              放大
            </Button>
            <Button 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
            >
              缩小
            </Button>
          </Space>
        }
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={24}>
            <Select
              placeholder="选择技能类别"
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '200px' }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        <div 
          className="skill-tree-container"
          style={{ 
            height: '600px', 
            border: '1px solid #e8e8e8',
            borderRadius: '8px',
            overflow: 'auto',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease'
          }}
        >
          <SkillTreeVisualization 
            skills={skills} 
            width={800} 
            height={600} 
          />
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="技能统计">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <h3>{skills.length}</h3>
                  <p>总技能数</p>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <h3>{categories.length}</h3>
                  <p>技能类别数</p>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <h3>{skills.filter(s => s.level >= 4).length}</h3>
                  <p>高级技能数</p>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <h3>{Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / Math.max(skills.length, 1))}%</h3>
                  <p>平均学习进度</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SkillTreePage;