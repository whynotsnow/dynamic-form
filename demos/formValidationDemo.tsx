import React, { useEffect, useMemo, useState } from 'react';
import { Space, Button, message, Form } from 'antd';
import type { FormInstance } from 'antd';
import type { RuleObject } from 'antd/es/form';
import DynamicForm from '@/index';
import { customComponents } from './customComponents';
import { validateEditTableRows } from './customComponents/CustomEditTable';
import { FormConfig } from '@/exports';
import { exampleHandlers } from './customHandlers';
import { mockFetchFormData } from '../packages/dynamic-form/src/shared/utils';
import { useDemoInitHandlers } from './useDemoInitHandlers';
import DemoLoading from './DemoLoading';
import { useDemoSubmitResult } from './useDemoSubmitResult';

type ProjectMemberValue = {
  name: string;
  role: string;
  email: string;
};

type ProjectTaskValue = {
  title: string;
  description: string;
  assignee: string;
  status: string;
  priority: string;
  dueDate: string;
};

type ProjectValue = {
  name: string;
  description: string;
  members: ProjectMemberValue[];
  tasks: ProjectTaskValue[];
  targetPlatforms: string[];
  techStack: string[];
};

type UserTableRowValue = {
  key: string;
  name: string;
  age: string;
  address: string;
  email: string;
  phone: string;
  status: string;
};

type DemoFormValues = {
  name: string;
  email: string;
  projects: ProjectValue[];
  userTable: UserTableRowValue[];
};

const futureDate = (daysFromToday: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString();
};

const cloneDemoValues = (values: DemoFormValues): DemoFormValues =>
  JSON.parse(JSON.stringify(values)) as DemoFormValues;

const FormValidationDemo: React.FC<{ form?: FormInstance; hideSubmitButton?: boolean }> = ({
  form: externalForm,
  hideSubmitButton = false
}) => {
  const [localForm] = Form.useForm();
  const form = externalForm ?? localForm;

  const formConfig = useMemo<FormConfig>(
    () => ({
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
                  validator: async (_rule: RuleObject, value: ProjectValue[] | undefined) => {
                    // 这里可以添加更复杂的校验逻辑
                    const errors: string[] = [];
                    const projects = value ?? [];
                    projects.forEach((project, index) => {
                      if (!project.name?.trim()) {
                        errors.push(`项目${index + 1}名称不能为空`);
                      }
                      if (!project.members?.length) {
                        errors.push(`项目${index + 1}至少需要一个成员`);
                      }
                    });

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
              rules: [
                { required: true, message: '至少需要添加一行数据' },
                { validator: validateEditTableRows }
              ],
              formItemProps: {
                labelCol: { span: 24 },
                wrapperCol: { span: 24 }
              },
              span: 24
            }
          ]
        }
      ]
    }),
    []
  );

  const componentRegistryConfig = useMemo(
    () => ({
      customComponents,
      allowOverride: false
    }),
    []
  );

  useDemoInitHandlers({ handlers: exampleHandlers });
  const { showSubmitResult, submitResultModal } = useDemoSubmitResult();

  const handleSubmit = (values: DemoFormValues) => {
    console.log('表单数据:', values);
    message.success('表单提交成功！');
  };

  const loadInvalidExample = () => {
    if (!initialValues) return;

    form.setFieldsValue({
      ...cloneDemoValues(initialValues),
      name: 'A',
      email: 'invalid-email',
      projects: [
        {
          name: '',
          description: '',
          members: [],
          tasks: [],
          targetPlatforms: [],
          techStack: []
        }
      ],
      userTable: []
    });
  };

  const [initialValues, setInitialValues] = useState<DemoFormValues>();
  useEffect(() => {
    async function fetchData() {
      const testData = {
        name: '示例用户',
        email: 'demo@example.com',
        projects: [
          {
            name: '客户门户改版',
            description: '升级客户自助服务门户的账户管理和工单查询流程。',
            members: [
              {
                name: '成员 A',
                role: 'developer',
                email: 'member-a@example.com'
              },
              {
                name: '成员 B',
                role: 'tester',
                email: 'member-b@example.com'
              }
            ],
            tasks: [
              {
                title: '设计导航结构',
                description: '整理常用入口和页面层级',
                assignee: '成员 A',
                status: 'pending',
                priority: 'high',
                dueDate: futureDate(14)
              },
              {
                title: '验证工单查询',
                description: '覆盖筛选和详情查看流程',
                assignee: '成员 B',
                status: 'in_progress',
                priority: 'medium',
                dueDate: futureDate(21)
              }
            ],
            targetPlatforms: ['web', 'miniProgram'],
            techStack: ['react', 'typescript', 'nodejs']
          },
          {
            name: '运营数据看板',
            description: '建设跨渠道运营数据看板和关键指标监控页面。',
            members: [
              {
                name: '成员 C',
                role: 'developer',
                email: 'member-c@example.com'
              }
            ],
            tasks: [
              {
                title: '实现指标卡片',
                description: '展示流量与转化数据',
                assignee: '成员 C',
                status: 'pending',
                priority: 'high',
                dueDate: futureDate(28)
              }
            ],
            targetPlatforms: ['web', 'mobileApp', 'desktop'],
            techStack: ['vue', 'typescript', 'java', 'postgresql']
          }
        ],
        userTable: [
          {
            key: 'demo-user',
            name: '示例用户',
            age: '28',
            address: '示例路 1 号',
            email: 'demo@example.com',
            phone: '13800000000',
            status: 'active'
          }
        ]
      };
      const data = (await mockFetchFormData(testData)) as DemoFormValues;
      setInitialValues(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(cloneDemoValues(initialValues));
    }
  }, [form, initialValues]);

  if (!initialValues) return <DemoLoading />;

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button onClick={loadInvalidExample}>填入校验错误示例</Button>
        </Space>

        <DynamicForm
          form={form}
          formConfig={formConfig}
          uiConfig={
            hideSubmitButton ? { submitAreaProps: { style: { display: 'none' } } } : undefined
          }
          onSubmit={(values) => {
            const submittedValues = values as DemoFormValues;
            handleSubmit(submittedValues);
            showSubmitResult(submittedValues);
          }}
          componentRegistry={componentRegistryConfig}
          submitButtonText="提交表单"
        />
      </Space>
      {submitResultModal}
    </div>
  );
};

export default FormValidationDemo;
