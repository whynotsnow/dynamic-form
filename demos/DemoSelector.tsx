import React, { useState } from 'react';
import { Card, Select, Space, Typography } from 'antd';
import SyncTest from './SyncTest';
import CustomHandlersDemo from './customHandlersDemo';
import CustomComponentsDemo from './customComponentsDemo';
import UIConfigDemo from './uiConfigDemo';
import RenderExtensionDemo from './renderExtensionDemo';
import { DEMO_COMPONENTS, DemoType, FormValidationDemo } from './index';
import { LogCategory, logger } from '@/utils/logger';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface DemoSelectorProps {
  defaultDemo?: DemoType;
}

const DemoSelector: React.FC<DemoSelectorProps> = ({ defaultDemo = 'uiConfig' }) => {
  const [currentDemo, setCurrentDemo] = useState<DemoType>(defaultDemo);

  logger.enableCategories([LogCategory.RENDER]);

  const renderDemo = () => {
    switch (currentDemo) {
      case 'syncTest':
        return <SyncTest />;
      case 'customHandlers':
        return <CustomHandlersDemo />;
      case 'customComponents':
        return <CustomComponentsDemo />;
      case 'formValidation':
        return <FormValidationDemo />;
      case 'uiConfig':
        return <UIConfigDemo />;
      case 'renderExtension':
        return <RenderExtensionDemo />;
      default:
        return <SyncTest />;
    }
  };

  const getCurrentDemoInfo = () => {
    return DEMO_COMPONENTS[currentDemo];
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="DynamicForm 演示组件选择器" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }} align="center">
          <div>
            <Title level={4}>从下拉菜单中选择要查看的演示组件：</Title>
          </div>

          <Select
            value={currentDemo}
            onChange={setCurrentDemo}
            style={{ width: 300 }}
            placeholder="选择演示组件"
          >
            {Object.entries(DEMO_COMPONENTS).map(([key, demo]) => (
              <Option key={key} value={key}>
                {demo.title}
              </Option>
            ))}
          </Select>

          <div style={{ marginTop: '16px' }}>
            <Title level={5}>{getCurrentDemoInfo().title}</Title>
            <Paragraph type="secondary">{getCurrentDemoInfo().description}</Paragraph>

            {renderDemo()}
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default DemoSelector;
