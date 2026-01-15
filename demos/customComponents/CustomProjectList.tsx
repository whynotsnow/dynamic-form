import React from 'react';
import { FieldComponentProps } from '@/types';
import {
  Form,
  Input,
  Button,
  Space,
  Card,
  Select,
  DatePicker,
  Row,
  Col,
  SelectProps,
  Checkbox
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// 可拆分为独立文件
const MemberForm: React.FC<{ name: string | number; remove: () => void }> = ({ name, remove }) => (
  <Card size="small" style={{ marginBottom: 8 }}>
    <Space align="start" style={{ marginBottom: 8 }}>
      <Form.Item name={[name, 'name']} rules={[{ required: true, message: '成员姓名不能为空' }]}>
        <Input placeholder="成员姓名" style={{ width: 120 }} />
      </Form.Item>
      <Form.Item name={[name, 'role']} rules={[{ required: true, message: '角色不能为空' }]}>
        <Select
          placeholder="角色"
          style={{ width: 100 }}
          options={[
            { label: '开发', value: 'developer' },
            { label: '测试', value: 'tester' },
            { label: '产品', value: 'product' },
            { label: '设计', value: 'designer' }
          ]}
        />
      </Form.Item>
      <Form.Item
        name={[name, 'email']}
        rules={[
          { required: true, message: '邮箱不能为空' },
          { type: 'email', message: '邮箱格式不正确' }
        ]}
      >
        <Input placeholder="邮箱" style={{ width: 200 }} />
      </Form.Item>
      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={remove} />
    </Space>
  </Card>
);

const TaskForm: React.FC<{ name: string | number; remove: () => void }> = ({ name, remove }) => (
  <Card size="small" style={{ marginBottom: 8 }}>
    <Space align="start" style={{ width: '100%' }}>
      <Form.Item name={[name, 'title']} rules={[{ required: true, message: '任务标题不能为空' }]}>
        <Input placeholder="任务标题" style={{ width: 120 }} />
      </Form.Item>
      <Form.Item
        name={[name, 'description']}
        rules={[{ required: true, message: '任务描述不能为空' }]}
      >
        <Input.TextArea placeholder="任务描述" style={{ width: 180 }} rows={1} />
      </Form.Item>
      <Form.Item name={[name, 'assignee']} rules={[{ required: true, message: '负责人不能为空' }]}>
        <Input placeholder="负责人" style={{ width: 100 }} />
      </Form.Item>
      <Form.Item
        name={[name, 'dueDate']}
        getValueProps={(value) => ({
          value: value ? dayjs(value) : null
        })}
      >
        <DatePicker
          placeholder="截止日期"
          style={{ width: 140 }}
          disabledDate={(current) => current && current.isBefore(new Date(), 'day')}
        />
      </Form.Item>
      <Form.Item name={[name, 'status']} rules={[{ required: true, message: '请选择状态' }]}>
        <Select
          placeholder="状态"
          style={{ width: 100 }}
          options={[
            { label: '待处理', value: 'pending' },
            { label: '进行中', value: 'in_progress' },
            { label: '已完成', value: 'completed' }
          ]}
        />
      </Form.Item>
      <Form.Item name={[name, 'priority']} rules={[{ required: true, message: '请选择优先级' }]}>
        <Select
          placeholder="优先级"
          style={{ width: 100 }}
          options={[
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' }
          ]}
        />
      </Form.Item>
      <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={remove} />
    </Space>
  </Card>
);

const CustomProjectList: React.FC<FieldComponentProps> = ({ field, form }) => {
  const options: SelectProps['options'] = [];

  for (let i = 10; i < 36; i++) {
    options.push({
      value: i.toString(36) + i,
      label: i.toString(36) + i
    });
  }
  return (
    <Form.List
      name={field.id}
      rules={[
        {
          validator: async (_, projects) => {
            if (!projects || projects.length === 0) {
              return Promise.reject(new Error('至少需要添加一个项目'));
            }
          }
        }
      ]}
    >
      {(projectFields, { add: addProject, remove: removeProject }) => {
        return (
          <div>
            <Button
              type="dashed"
              onClick={() => addProject({ name: '', description: '', members: [], tasks: [] })}
              icon={<PlusOutlined />}
              style={{ marginBottom: 16 }}
            >
              添加项目
            </Button>
            {projectFields.map((projectField, idx) => (
              <Card
                key={projectField.key}
                title={`项目${idx + 1}`}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeProject(projectField.name)}
                  >
                    删除项目
                  </Button>
                }
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  label="项目名称"
                  name={[projectField.name, 'name']}
                  rules={[
                    { required: true, message: '项目名称不能为空' },
                    { min: 2, max: 50, message: '项目名称长度必须在2-50个字符之间' }
                  ]}
                  style={{ width: '100%' }} // 添加宽度控制
                >
                  <Input placeholder="项目名称" />
                </Form.Item>

                <Form.Item
                  label="项目描述"
                  name={[projectField.name, 'description']}
                  rules={[
                    { required: true, message: '项目描述不能为空' },
                    { min: 10, max: 500, message: '项目描述长度必须在10-500个字符之间' }
                  ]}
                  style={{ width: '100%' }} // 添加宽度控制
                >
                  <Input.TextArea placeholder="项目描述" rows={4} />
                </Form.Item>

                <Form.Item
                  label="水果"
                  name={[projectField.name, 'fruit']}
                  rules={[{ required: true, message: '水果不能为空' }]}
                >
                  <Checkbox.Group
                    style={{ width: 800 }}
                    options={[
                      { label: 'Apple', value: 'Apple', className: 'label-1' },
                      { label: 'Pear', value: 'Pear', className: 'label-2' },
                      { label: 'Orange', value: 'Orange', className: 'label-3' }
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label="多选"
                  name={[projectField.name, 'multipleSelect']}
                  rules={[{ required: true, message: '多选不能为空' }]}
                >
                  <Select mode="multiple" style={{ width: 800 }} options={options}></Select>
                </Form.Item>

                {/* 成员列表 */}
                <Form.List
                  name={[projectField.name, 'members']}
                  rules={[
                    {
                      validator: async (_, members) => {
                        if (!members || members.length === 0) {
                          return Promise.reject(new Error('项目至少需要一个成员'));
                        }
                      }
                    }
                  ]}
                >
                  {(memberFields, { add: addMember, remove: removeMember }) => (
                    <div style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8
                        }}
                      >
                        <strong>项目成员</strong>
                        <Button
                          size="small"
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => addMember({ name: '', role: '', email: '' })}
                        >
                          添加成员
                        </Button>
                      </div>
                      {memberFields.map((memberField) => (
                        <MemberForm
                          key={memberField.key}
                          name={memberField.name}
                          remove={() => removeMember(memberField.name)}
                        />
                      ))}
                    </div>
                  )}
                </Form.List>

                {/* 任务列表 */}
                <Form.List
                  name={[projectField.name, 'tasks']}
                  rules={[
                    {
                      validator: async (_, tasks) => {
                        if (!tasks || tasks.length === 0) {
                          return Promise.reject(new Error('项目至少需要一个任务'));
                        }
                      }
                    }
                  ]}
                >
                  {(taskFields, { add: addTask, remove: removeTask }) => (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8
                        }}
                      >
                        <strong>项目任务</strong>
                        <Button
                          size="small"
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            addTask({
                              title: '',
                              description: '',
                              assignee: '',
                              status: 'pending',
                              priority: 'medium'
                            })
                          }
                        >
                          添加任务
                        </Button>
                      </div>
                      {taskFields.map((taskField) => (
                        <TaskForm
                          key={taskField.key}
                          name={taskField.name}
                          remove={() => removeTask(taskField.name)}
                        />
                      ))}
                    </div>
                  )}
                </Form.List>
              </Card>
            ))}
          </div>
        );
      }}
    </Form.List>
  );
};

export default CustomProjectList;
