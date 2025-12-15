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
  Radio,
  Statistic
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFinances, createFinance, updateFinance, deleteFinance, Finance, FinanceCreate, FinanceUpdate } from '../services/financeService';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;
const { Group: RadioGroup } = Radio;

const FinanceManagementPage: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentFinance, setCurrentFinance] = useState<Finance | null>(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 计算财务统计数据，使用 useMemo 确保数据变化时自动更新
  const stats = React.useMemo(() => {
    const filteredFinances = finances.filter(item => 
      item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchText.toLowerCase())
    );
    
    const income = filteredFinances
      .filter(item => item.category === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const expense = filteredFinances
      .filter(item => item.category === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    
    return { income, expense, balance: income - expense };
  }, [finances, searchText]);

  // 加载财务记录
  const loadFinances = async () => {
    setLoading(true);
    try {
      const start_date = dateRange[0]?.format('YYYY-MM-DD');
      const end_date = dateRange[1]?.format('YYYY-MM-DD');
      const data = await getFinances(0, 100, start_date, end_date, selectedCategory);
      setFinances(data);
    } catch (error) {
      message.error('加载财务记录失败');
      console.error('Failed to load finances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinances();
  }, [dateRange, selectedCategory]);

  // 处理添加按钮点击
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentFinance(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑按钮点击
  const handleEdit = (record: Finance) => {
    setIsEditing(true);
    setCurrentFinance(record);
    form.setFieldsValue({
      amount: record.amount,
      category: record.category,
      subcategory: record.subcategory,
      description: record.description,
      date: dayjs(record.date),
      tags: record.tags
    });
    setModalVisible(true);
  };

  // 处理删除按钮点击
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条财务记录吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteFinance(id);
          message.success('删除成功');
          loadFinances();
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete finance:', error);
        }
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const financeData: FinanceCreate | FinanceUpdate = {
        amount: values.amount,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        tags: values.tags || []
      };

      if (isEditing && currentFinance) {
        await updateFinance(currentFinance.id, financeData as FinanceUpdate);
        message.success('更新成功');
      } else {
        await createFinance(financeData as FinanceCreate);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadFinances();
    } catch (error) {
      message.error('操作失败');
      console.error('Failed to submit finance:', error);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: Finance, b: Finance) => a.amount - b.amount,
      render: (amount: number, record: Finance) => {
        const color = record.category === 'income' ? 'green' : 'red';
        const prefix = record.category === 'income' ? '+' : '-';
        return <span style={{ color }}>{prefix}¥{amount.toFixed(2)}</span>;
      }
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const color = category === 'income' ? 'green' : 'red';
        const label = category === 'income' ? '收入' : '支出';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '子类别',
      dataIndex: 'subcategory',
      key: 'subcategory'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Finance, b: Finance) => new Date(a.date).getTime() - new Date(b.date).getTime()
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a: Finance, b: Finance) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Finance) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="responsive-container">
      <Card title="财务记录管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加财务记录</Button>}>
        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic 
                title="总收入" 
                value={stats.income} 
                prefix="¥" 
                valueStyle={{ color: '#3f8600' }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="总支出" 
                value={stats.expense} 
                prefix="¥" 
                valueStyle={{ color: '#cf1322' }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="结余" 
                value={stats.balance} 
                prefix="¥" 
                valueStyle={{ color: stats.balance >= 0 ? '#3f8600' : '#cf1322' }} 
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
              placeholder="搜索描述或子类别"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <RadioGroup 
              onChange={(e) => setSelectedCategory(e.target.value)} 
              value={selectedCategory}
              style={{ width: '100%' }}
            >
              <Radio.Button value="">全部</Radio.Button>
              <Radio.Button value="income">收入</Radio.Button>
              <Radio.Button value="expense">支出</Radio.Button>
            </RadioGroup>
          </Col>
        </Row>

        {/* 财务记录表格 */}
        <Table
          columns={columns}
          dataSource={finances.filter(item => 
            (item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
             item.subcategory.toLowerCase().includes(searchText.toLowerCase()))
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        {/* 编辑/添加模态框 */}
        <Modal
          title={isEditing ? '编辑财务记录' : '添加财务记录'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText={isEditing ? '更新' : '创建'}
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="amount"
              label="金额"
              rules={[{ required: true, message: '请输入金额' }]}
            >
              <InputNumber<number>
                min={0.01}
                step={0.01}
                precision={2}
                placeholder="请输入金额"
                style={{ width: '100%' }}
                formatter={(value) => `¥${value}`}
                parser={(value) => parseFloat(value?.replace(/¥/g, '') || '0')}
              />
            </Form.Item>
            <Form.Item
              name="category"
              label="类别"
              rules={[{ required: true, message: '请选择类别' }]}
            >
              <Select placeholder="请选择类别">
                <Option value="income">收入</Option>
                <Option value="expense">支出</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="subcategory"
              label="子类别"
              rules={[{ required: true, message: '请输入子类别' }]}
            >
              <Input placeholder="请输入子类别（如：餐饮、交通、工资）" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={2} placeholder="请输入描述" />
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
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default FinanceManagementPage;
