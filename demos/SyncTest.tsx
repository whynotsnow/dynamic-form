import React from 'react';
import { Card, Space, Form } from 'antd';
import { supplierFormConfig } from '../tests/testData';
import { useInitHandlers } from '@/consumer';
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
      <Card title="Form Store 联动测试" style={{ marginBottom: '20px' }}>
        <Space direction="vertical">
          <div>
            <h3>测试说明：</h3>
            <ul>
              <li>修改&quot;员工数量&quot;字段，观察控制台日志</li>
              <li>检查字段值是否始终以 Ant Design Form 为唯一来源</li>
              <li>观察 effect 返回的 value 是否直接写入 Form</li>
              <li>观察 effect 返回的 visible/disabled 等 meta 是否写入 DynamicForm Store</li>
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
