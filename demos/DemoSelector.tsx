import React, { useState } from 'react';
import { Card, Select, Space, Typography } from 'antd';
import SyncTest from './SyncTest';
import CustomHandlersDemo from './customHandlersDemo';
import CustomComponentsDemo from './customComponentsDemo';
import UIConfigDemo from './uiConfigDemo';
import RenderExtensionDemo from './renderExtensionDemo';
import { DEMO_COMPONENTS, DemoType, FormValidationDemo } from './index';
import { LogCategory, logger } from '@/shared/utils/logger';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface DemoSelectorProps {
  defaultDemo?: DemoType;
}

const DemoSelector: React.FC<DemoSelectorProps> = ({ defaultDemo = 'syncTest' }) => {
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
    <div className="dynamic-form-demo-page" style={{ padding: 20 }}>
      <style>
        {`
          .dynamic-form-demo-page {
            width: 100%;
            min-width: 960px;
            box-sizing: border-box;
          }
          .dynamic-form-demo-page .ant-card,
          .dynamic-form-demo-page .ant-form,
          .dynamic-form-demo-page .ant-form-item {
            width: 100%;
          }
          .dynamic-form-demo-page .ant-col {
            min-width: 0;
          }
          .dynamic-form-demo-content {
            width: 100%;
            max-width: 1200px;
            min-height: 640px;
            margin: 0 auto;
          }
        `}
      </style>
      <Card title="DynamicForm 演示组件选择器" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }} align="start">
          <div>
            <Title level={4}>从下拉菜单中选择要查看的演示组件：</Title>
          </div>

          <Select
            value={currentDemo}
            onChange={setCurrentDemo}
            style={{ width: 320 }}
            placeholder="选择演示组件"
          >
            {Object.entries(DEMO_COMPONENTS).map(([key, demo]) => (
              <Option key={key} value={key}>
                {demo.title}
              </Option>
            ))}
          </Select>

          <div className="dynamic-form-demo-content" style={{ marginTop: 16 }}>
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
