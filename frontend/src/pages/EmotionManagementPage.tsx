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
  InputNumber
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getEmotions, createEmotion, updateEmotion, deleteEmotion, Emotion, EmotionCreate, EmotionUpdate } from '../services/emotionService';
import DataChart from '../components/DataChart';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const EmotionManagementPage: React.FC = () => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [searchText, setSearchText] = useState<string>('');
  const [chartData, setChartData] = useState<any>({});

  // 生成图表数据
  const generateChartData = (emotionList: Emotion[]) => {
    // 情感分布饼图数据
    const sentimentCount: { [key: string]: number } = {};
    emotionList.forEach(emotion => {
      const sentiment = emotion.sentiment || 'unknown';
      sentimentCount[sentiment] = (sentimentCount[sentiment] || 0) + 1;
    });
    
    const pieData = Object.entries(sentimentCount).map(([name, value]) => ({
      name,
      value
    }));
    
    // 情感分数趋势图数据
    const sortedEmotions = [...emotionList].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const lineData = {
      xAxis: sortedEmotions.map(e => e.date),
      series: [{
        name: '情感分数',
        data: sortedEmotions.map(e => e.sentiment_score || 0)
      }]
    };
    
    setChartData({
      pie: pieData,
      line: lineData
    });
  };
  
  // 加载情感记录
  const loadEmotions = async () => {
    setLoading(true);
    try {
      const start_date = dateRange[0]?.format('YYYY-MM-DD');
      const end_date = dateRange[1]?.format('YYYY-MM-DD');
      const data = await getEmotions(0, 100, start_date, end_date);
      setEmotions(data);
      generateChartData(data);
    } catch (error) {
      message.error('加载情感记录失败');
      console.error('Failed to load emotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmotions();
  }, [dateRange]);

  // 处理添加按钮点击
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentEmotion(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑按钮点击
  const handleEdit = (record: Emotion) => {
    setIsEditing(true);
    setCurrentEmotion(record);
    form.setFieldsValue({
      content: record.content,
      date: dayjs(record.date),
      tags: record.tags,
      sentiment: record.sentiment,
      sentiment_score: record.sentiment_score
    });
    setModalVisible(true);
  };

  // 处理删除按钮点击
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条情感记录吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteEmotion(id);
          message.success('删除成功');
          loadEmotions();
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete emotion:', error);
        }
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const emotionData: EmotionCreate | EmotionUpdate = {
        content: values.content,
        date: values.date.format('YYYY-MM-DD'),
        tags: values.tags || [],
        sentiment: values.sentiment,
        sentiment_score: values.sentiment_score
      };

      if (isEditing && currentEmotion) {
        await updateEmotion(currentEmotion.id, emotionData as EmotionUpdate);
        message.success('更新成功');
      } else {
        await createEmotion(emotionData as EmotionCreate);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadEmotions();
    } catch (error) {
      message.error('操作失败');
      console.error('Failed to submit emotion:', error);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 300
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Emotion, b: Emotion) => new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size="small">
          {tags.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '情感',
      dataIndex: 'sentiment',
      key: 'sentiment',
      render: (sentiment: string) => {
        if (!sentiment) return '-';
        const color = sentiment === 'positive' ? 'green' : sentiment === 'negative' ? 'red' : 'gray';
        return <Tag color={color}>{sentiment}</Tag>;
      }
    },
    {
      title: '情感分数',
      dataIndex: 'sentiment_score',
      key: 'sentiment_score',
      render: (score: number) => score ? score.toFixed(2) : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a: Emotion, b: Emotion) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Emotion) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="responsive-container">
      <Card title="情感记录管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加情感记录</Button>}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={12}>
            <Input
              placeholder="搜索内容"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>

        {/* 数据可视化图表 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="情感分布" size="small">
              {chartData.pie && (
                <DataChart
                  type="pie"
                  data={{ series: chartData.pie }}
                  title="情感分布"
                  height={300}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="情感分数趋势" size="small">
              {chartData.line && (
                <DataChart
                  type="line"
                  data={chartData.line}
                  title="情感分数趋势"
                  height={300}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={emotions.filter(item => 
            item.content.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={isEditing ? '编辑情感记录' : '添加情感记录'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText={isEditing ? '更新' : '创建'}
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="content"
              label="内容"
              rules={[{ required: true, message: '请输入情感记录内容' }]}
            >
              <TextArea rows={4} placeholder="请输入情感记录内容" />
            </Form.Item>
            <Form.Item
              name="date"
              label="日期"
              rules={[{ required: true, message: '请选择日期' }]}
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
            <Form.Item
              name="sentiment"
              label="情感"
            >
              <Select placeholder="请选择情感类型">
                <Option value="positive">正面</Option>
                <Option value="neutral">中性</Option>
                <Option value="negative">负面</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="sentiment_score"
              label="情感分数"
            >
              <InputNumber
                min={-1}
                max={1}
                step={0.1}
                placeholder="请输入情感分数（-1到1）"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default EmotionManagementPage;
