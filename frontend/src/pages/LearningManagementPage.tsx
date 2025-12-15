import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Space,
  message,
  Row,
  Col,
  Card,
  InputNumber,
  Statistic
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getLearnings, createLearning, updateLearning, deleteLearning, Learning, LearningCreate, LearningUpdate } from '../services/learningService';
import { getSkills, Skill } from '../services/skillService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const LearningManagementPage: React.FC = () => {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentLearning, setCurrentLearning] = useState<Learning | null>(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

  // 计算学习统计数据，使用 useMemo 确保数据变化时自动更新
  const stats = React.useMemo(() => {
    const filteredLearnings = learnings.filter(item => 
      item.topic.toLowerCase().includes(searchText.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchText.toLowerCase())
    );
    
    const totalDuration = filteredLearnings
      .reduce((sum, item) => sum + item.duration, 0);
    
    const totalDays = new Set(filteredLearnings.map(item => item.date)).size;
    
    return {
      totalDuration,
      averageDaily: totalDays > 0 ? Math.round(totalDuration / totalDays) : 0,
      totalRecords: filteredLearnings.length
    };
  }, [learnings, searchText]);

  // 加载技能列表（用于关联技能选择）
  const loadSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  // 加载学习记录
  const loadLearnings = async () => {
    setLoading(true);
    try {
      const start_date = dateRange[0]?.format('YYYY-MM-DD');
      const end_date = dateRange[1]?.format('YYYY-MM-DD');
      const data = await getLearnings(0, 100, start_date, end_date, selectedSkill || undefined);
      setLearnings(data);
    } catch (error) {
      message.error('加载学习记录失败');
      console.error('Failed to load learnings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
    loadLearnings();
  }, [dateRange, selectedSkill]);

  // 处理添加按钮点击
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentLearning(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑按钮点击
  const handleEdit = (record: Learning) => {
    setIsEditing(true);
    setCurrentLearning(record);
    form.setFieldsValue({
      topic: record.topic,
      duration: record.duration,
      content: record.content,
      date: dayjs(record.date),
      tags: record.tags,
      skill_id: record.skill_id
    });
    setModalVisible(true);
  };

  // 处理删除按钮点击
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条学习记录吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteLearning(id);
          message.success('删除成功');
          loadLearnings();
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete learning:', error);
        }
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const learningData: LearningCreate | LearningUpdate = {
        topic: values.topic,
        duration: values.duration,
        content: values.content,
        date: values.date.format('YYYY-MM-DD'),
        tags: values.tags || [],
        skill_id: values.skill_id
      };

      if (isEditing && currentLearning) {
        await updateLearning(currentLearning.id, learningData as LearningUpdate);
        message.success('更新成功');
      } else {
        await createLearning(learningData as LearningCreate);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadLearnings();
    } catch (error) {
      message.error('操作失败');
      console.error('Failed to submit learning:', error);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '学习主题',
      dataIndex: 'topic',
      key: 'topic',
      width: 200
    },
    {
      title: '学习时长',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a: Learning, b: Learning) => a.duration - b.duration,
      render: (duration: number) => `${duration} 分钟`
    },
    {
      title: '关联技能',
      dataIndex: 'skill_id',
      key: 'skill_id',
      render: (skillId: number) => {
        const skill = skills.find(s => s.id === skillId);
        return skill ? <Tag color="blue">{skill.name}</Tag> : '-';
      }
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 250
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Learning, b: Learning) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size="small">
          {tags.map((tag) => (
            <Tag key={tag} color="green">
              {tag}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a: Learning, b: Learning) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Learning) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="responsive-container">
      <Card title="学习记录管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加学习记录</Button>}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic 
                title="总学习时长" 
                value={stats.totalDuration} 
                suffix="分钟" 
                valueStyle={{ color: '#3f8600' }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="平均每日学习" 
                value={stats.averageDaily} 
                suffix="分钟" 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="学习记录总数" 
                value={stats.totalRecords} 
                valueStyle={{ color: '#722ed1' }} 
              />
            </Card>
          </Col>
        </Row>

        {/* 筛选条件 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={8}>
            <Input
              placeholder="搜索学习主题或内容"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="选择关联技能"
              value={selectedSkill}
              onChange={setSelectedSkill}
              style={{ width: '100%' }}
              allowClear
            >
              {skills.map(skill => (
                <Option key={skill.id} value={skill.id}>{skill.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* 学习记录表格 */}
        <Table
          columns={columns}
          dataSource={learnings.filter(item => 
            item.topic.toLowerCase().includes(searchText.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        {/* 编辑/添加模态框 */}
        <Modal
          title={isEditing ? '编辑学习记录' : '添加学习记录'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText={isEditing ? '更新' : '创建'}
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="topic"
              label="学习主题"
              rules={[{ required: true, message: '请输入学习主题' }]}
            >
              <Input placeholder="请输入学习主题" />
            </Form.Item>
            <Form.Item
              name="duration"
              label="学习时长"
              rules={[{ required: true, message: '请输入学习时长' }]}
            >
              <InputNumber
                min={1}
                placeholder="请输入学习时长（分钟）"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="skill_id"
              label="关联技能"
            >
              <Select placeholder="请选择关联技能" allowClear>
                {skills.map(skill => (
                  <Option key={skill.id} value={skill.id}>{skill.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="content"
              label="学习内容"
            >
              <TextArea rows={4} placeholder="请输入学习内容" />
            </Form.Item>
            <Form.Item
              name="date"
              label="学习日期"
              rules={[{ required: true, message: '请选择学习日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="tags"
              label="标签"
            >
              <Select
                mode="tags"
                placeholder="请输入标签，按回车键添加"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default LearningManagementPage;
