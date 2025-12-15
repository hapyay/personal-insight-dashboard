import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Row,
  Col,
  Card,
  InputNumber,
  Rate,
  Progress,
  Collapse,
  Divider
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons';
import { getSkills, createSkill, updateSkill, deleteSkill, Skill, SkillCreate, SkillUpdate } from '../services/skillService';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const SkillManagementPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 加载技能记录
  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await getSkills(0, 100, selectedCategory);
      setSkills(data);
    } catch (error) {
      message.error('加载技能记录失败');
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, [selectedCategory]);

  // 处理添加按钮点击
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentSkill(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑按钮点击
  const handleEdit = (record: Skill) => {
    setIsEditing(true);
    setCurrentSkill(record);
    form.setFieldsValue({
      name: record.name,
      category: record.category,
      level: record.level,
      progress: record.progress,
      description: record.description,
      tags: record.tags,
      learning_paths: record.learning_paths,
      future_directions: record.future_directions,
      related_skills: record.related_skills,
      skill_tree_id: record.skill_tree_id
    });
    setModalVisible(true);
  };

  // 处理删除按钮点击
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条技能记录吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteSkill(id);
          message.success('删除成功');
          loadSkills();
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete skill:', error);
        }
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const skillData: SkillCreate | SkillUpdate = {
        name: values.name,
        category: values.category,
        level: values.level,
        progress: values.progress,
        description: values.description,
        tags: values.tags || [],
        learning_paths: values.learning_paths || {
          resources: [],
          practiceProjects: []
        },
        future_directions: values.future_directions || [],
        related_skills: values.related_skills || [],
        skill_tree_id: values.skill_tree_id
      };

      if (isEditing && currentSkill) {
        await updateSkill(currentSkill.id, skillData as SkillUpdate);
        message.success('更新成功');
      } else {
        await createSkill(skillData as SkillCreate);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadSkills();
    } catch (error) {
      message.error('操作失败');
      console.error('Failed to submit skill:', error);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '技能名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => <Rate disabled value={level} />
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200
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
      sorter: (a: Skill, b: Skill) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Skill) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="responsive-container">
      <Card title="技能记录管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加技能记录</Button>}>
        {/* 筛选条件 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Input
              placeholder="搜索技能名称或描述"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder="选择技能类别"
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              allowClear
            >
              {Array.from(new Set(skills.map(s => s.category))).map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* 技能记录表格 */}
        <Table
          columns={columns}
          dataSource={skills.filter(item => 
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div>
                <Collapse defaultActiveKey={['1']}>
                  <Panel header="学习路径" key="1">
                    {record.learning_paths.resources?.length ? (
                      <div>
                        <h4>学习资源</h4>
                        <ul>
                          {record.learning_paths.resources.map((resource, index) => (
                            <li key={index} style={{ marginBottom: 8 }}>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <LinkOutlined /> {resource.title}
                              </a>
                              <Tag style={{ marginLeft: 8 }}>{resource.type}</Tag>
                              <Tag color={
                                resource.difficulty === 'beginner' ? 'green' :
                                resource.difficulty === 'intermediate' ? 'blue' : 'red'
                              }>
                                {resource.difficulty}
                              </Tag>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p>暂无学习资源</p>
                    )}
                    {record.learning_paths.practiceProjects?.length ? (
                      <div style={{ marginTop: 16 }}>
                        <h4>实践项目</h4>
                        <ul>
                          {record.learning_paths.practiceProjects.map((project, index) => (
                            <li key={index}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p>暂无实践项目</p>
                    )}
                  </Panel>
                  <Panel header="未来方向" key="2">
                    {record.future_directions.length ? (
                      <ul>
                        {record.future_directions.map((direction, index) => (
                          <li key={index}>{direction}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>暂无未来方向</p>
                    )}
                  </Panel>
                  <Panel header="相关技能" key="3">
                    {record.related_skills.length ? (
                      <Space size="small">
                        {record.related_skills.map((skill, index) => (
                          <Tag key={index} color="purple">{skill}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <p>暂无相关技能</p>
                    )}
                  </Panel>
                </Collapse>
              </div>
            )
          }}
        />

        {/* 编辑/添加模态框 */}
        <Modal
          title={isEditing ? '编辑技能记录' : '添加技能记录'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText={isEditing ? '更新' : '创建'}
          cancelText="取消"
          width={800}
        >
          <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="技能名称"
                  rules={[{ required: true, message: '请输入技能名称' }]}
                >
                  <Input placeholder="请输入技能名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="类别"
                  rules={[{ required: true, message: '请输入技能类别' }]}
                >
                  <Input placeholder="请输入技能类别（如：前端开发、后端开发、AI/ML）" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="level"
                  label="等级"
                  rules={[{ required: true, message: '请选择技能等级' }]}
                >
                  <Select placeholder="请选择技能等级">
                    {[1, 2, 3, 4, 5].map(level => (
                      <Option key={level} value={level}>{level} 级</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="progress"
                  label="学习进度"
                  rules={[{ required: true, message: '请输入学习进度' }]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={5}
                    placeholder="请输入学习进度（0-100）"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea rows={4} placeholder="请输入技能描述" />
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
            <Divider orientation="left">学习路径</Divider>
            <Form.Item
              name="learning_paths"
              label=""
            >
              <TextArea
                rows={4}
                placeholder={"请输入JSON格式的学习路径信息，如：{\"resources\": [{\"type\": \"course\", \"title\": \"React入门\", \"url\": \"https://example.com\", \"difficulty\": \"beginner\"}], \"practiceProjects\": [\"TODO应用\"]}"}
              />
            </Form.Item>
            <Form.Item
              name="future_directions"
              label="未来方向"
            >
              <Select
                mode="tags"
                placeholder="请输入未来方向，按回车键添加"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="related_skills"
              label="相关技能"
            >
              <Select
                mode="tags"
                placeholder="请输入相关技能，按回车键添加"
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="skill_tree_id"
              label="技能树ID"
            >
              <InputNumber placeholder="请输入关联的技能树ID" style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default SkillManagementPage;
