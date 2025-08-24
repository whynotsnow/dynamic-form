import React from 'react';
import { Card, Space, Form } from 'antd';
import { supplierFormConfig } from '../tests/testData';
import { useInitHandlers } from '@/hooks';
import { DynamicForm } from '@/exports';
const SyncTest: React.FC = () => {
  const handleSubmit = (values: any) => {
    console.log('[SyncTest] 表单提交:', values);
  };

  // 初始化处理器系统，确保所有演示组件都能正常工作
  useInitHandlers({
    enabled: true,
    handlers: [], // 使用默认处理器
    options: { override: false },
    debug: true
  });

  const [form] = Form.useForm();

  return (
    <div style={{ padding: '20px' }}>
      <Card title="表单同步功能测试" style={{ marginBottom: '20px' }}>
        <Space direction="vertical">
          <div>
            <h3>测试说明：</h3>
            <ul>
              <li>修改&quot;员工数量&quot;字段，观察控制台日志</li>
              <li>检查 State 和 Form 的值是否同步</li>
              <li>观察 effect 返回值是否正确处理</li>
              <li>验证分组显示/隐藏功能</li>
            </ul>
          </div>
        </Space>
      </Card>
      <DynamicForm
        onSubmit={handleSubmit}
        form={form}
        submitButtonText="提交表单"
        formConfig={supplierFormConfig}
      />
    </div>
  );
};

export default SyncTest;
