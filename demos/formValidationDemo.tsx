import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, message, Form, Spin } from 'antd';
import DynamicForm from '@/index';
import { customComponents } from './customComponents';
import { FormConfig } from '@/types';
import { useInitHandlers } from '@/exports';
import { exampleHandlers } from './customHandlers';
import { mockFetchFormData } from '../src/utils';

const { Title, Paragraph } = Typography;

const FormValidationDemo: React.FC = () => {
  const [form] = Form.useForm();

  const formConfig: FormConfig = {
    groups: [
      {
        id: 'baseInfo',
        title: '基础信息',
        fields: [
          {
            id: 'name',
            label: '姓名',
            component: 'TextInput',
            rules: [
              { required: true, message: '请输入姓名' },
              { min: 2, max: 20, message: '姓名长度必须在2-20个字符之间' }
            ],
            span: 12
          },
          {
            id: 'email',
            label: '邮箱',
            component: 'TextInput',
            rules: [
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ],
            span: 12
          }
        ]
      },
      {
        id: 'complexComponent',
        title: '复杂组件校验演示',
        fields: [
          {
            id: 'projects',
            label: '项目信息管理',
            component: 'CustomProjectList',
            rules: [
              { required: true, message: '至少需要添加一个项目' },
              {
                validator: async (_rule: any, value: any) => {
                  // 这里可以添加更复杂的校验逻辑
                  const errors: string[] = [];
                  (value || []).forEach(
                    (project: { name: string; members: string | any[] }, index: number) => {
                      if (!project.name?.trim()) {
                        errors.push(`项目${index + 1}名称不能为空`);
                      }
                      if (!project.members?.length) {
                        errors.push(`项目${index + 1}至少需要一个成员`);
                      }
                    }
                  );

                  if (errors.length > 0) {
                    return Promise.reject(errors.join('\n')); // 换行分隔更清晰
                  }
                  return Promise.resolve();
                }
              }
            ],
            span: 24
          },
          {
            id: 'userTable',
            label: '用户信息表格',
            component: 'CustomEditTable',
            rules: [{ required: true, message: '至少需要添加一行数据' }],
            span: 24
          }
        ]
      }
    ]
  };

  const componentRegistryConfig = {
    customComponents,
    allowOverride: false
  };

  useInitHandlers({
    enabled: true,
    handlers: exampleHandlers,
    options: { override: false },
    debug: true
  });

  const handleSubmit = (values: any) => {
    console.log('表单数据:', values);
    message.success('表单提交成功！');
  };

  const handleValidate = async () => {
    try {
      const values = await form.validateFields();
      console.log('校验通过:', values);
      message.success('所有字段校验通过！');
    } catch (error) {
      console.log('校验失败:', error);
      message.error('表单校验失败，请检查输入');
    }
  };

  const [initialValues, setInitialValues] = useState<Record<string, any>>();
  useEffect(() => {
    async function fetchData() {
      const testData = {
        name: 'gas递四方速递',
        email: 'whynotsnow@163.com',
        projects: [
          {
            name: '噶手动阀是的',
            description: '去玩儿萨达阿斯顿发生是的发生',
            members: [
              {
                name: '三大发',
                role: 'developer',
                email: 'whynotsnow@163.com'
              },
              {
                name: '3',
                role: 'tester',
                email: 'whynotsnow@163.com'
              },
              {
                name: '是的',
                role: 'product',
                email: 'whynotsnow@163.com'
              },
              {
                name: '撒旦法',
                role: 'designer',
                email: 'whynotsnow@163.com'
              }
            ],
            tasks: [
              {
                title: '撒大声地',
                description: '三大发',
                assignee: '撒旦法',
                status: 'pending',
                priority: 'low',
                dueDate: '2025-08-19T16:00:00.000Z'
              },
              {
                title: '是的发生',
                description: '三大发',
                assignee: '是打发打发',
                status: 'in_progress',
                priority: 'medium',
                dueDate: '2025-08-09T16:00:00.000Z'
              },
              {
                title: '噶手动阀是否',
                description: '士大夫撒',
                assignee: '撒旦法',
                status: 'completed',
                priority: 'high',
                dueDate: '2025-08-09T16:00:00.000Z'
              }
            ],
            fruit: ['Apple', 'Orange'],
            multipleSelect: ['d13', 'c12', 'f15']
          },
          {
            name: '噶是多少胜多负少噶手动阀分手大师三大发',
            description: '三大发三大发是三大发收费多少是东风风神',
            members: [
              {
                name: '是打发打发是',
                role: 'developer',
                email: 'whynotsnow@163.com'
              }
            ],
            tasks: [
              {
                title: '噶手动阀',
                description: '士大夫撒',
                assignee: '三大发',
                status: 'completed',
                priority: 'high',
                dueDate: '2025-08-23T16:00:00.000Z'
              }
            ],
            fruit: ['Apple', 'Pear', 'Orange'],
            multipleSelect: ['a10', 'b11', 'c12', 'd13']
          }
        ],
        userTable: [
          {
            key: '1754668878601',
            name: 'notsnow why',
            age: '18',
            address: '阿斯顿发大街1号',
            email: 'whynotsnow@163.com',
            phone: '13148978094',
            status: 'active'
          }
        ]
      };
      const data = await mockFetchFormData(testData);
      setInitialValues(data);
    }
    fetchData();
  }, []);

  if (!initialValues) return <Spin />;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Form.Item 校验集成演示</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="说明" size="small">
          <Paragraph>
            本演示展示了如何在 DynamicForm 中为自定义组件配置 Form.Item 校验规则。
          </Paragraph>
          <ul>
            <li>基础字段使用标准的 Ant Design Form 校验规则</li>
            <li>自定义组件通过 rules 配置校验规则</li>
            <li>支持复杂的自定义校验逻辑</li>
            <li>校验错误会显示在 Form.Item 的错误状态中</li>
          </ul>
        </Card>

        <Card title="操作" size="small">
          <Space>
            <Button type="primary" onClick={handleValidate}>
              校验所有字段
            </Button>
            <Button onClick={() => form.resetFields()}>重置表单</Button>
          </Space>
        </Card>

        <Card title="表单" size="small">
          <DynamicForm
            form={form}
            // values={initialValues}
            formConfig={formConfig}
            onSubmit={handleSubmit}
            componentRegistry={componentRegistryConfig}
            submitButtonText="提交表单"
          />
        </Card>
      </Space>
    </div>
  );
};

export default FormValidationDemo;
