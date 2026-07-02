import { FieldComponentProps } from '@/exports';
import { Space, Tag, Select } from 'antd';
import type { SelectProps } from 'antd';
import { EffectFn } from 'form-chain-effect-engine';

export const PriorityField: React.FC<FieldComponentProps> = ({ field, value, onChange }) => {
  return (
    <Select
      value={value as SelectProps['value']}
      onChange={onChange}
      options={(field.componentProps as { options?: SelectProps['options'] } | undefined)?.options}
    />
  );
};
export default PriorityField;

const renderPriorityLabel = (value?: string) => {
  if (value === 'high') {
    return (
      <Space>
        <span>🔥 高优先级</span>
        <Tag color="red">重要</Tag>
      </Space>
    );
  }

  if (value === 'low') {
    return (
      <Space>
        <span>🧊 低优先级</span>
        <Tag color="blue">次要</Tag>
      </Space>
    );
  }

  return (
    <Space>
      <span>⭐ 中优先级</span>
      <Tag color="blue">一般</Tag>
    </Space>
  );
};

export const priorityEffect: EffectFn = (_changedValue, allValues) => {
  console.log('_changedValue, allValues', _changedValue, allValues);
  const value = allValues.priority;

  return {
    formItemProps: {
      label: renderPriorityLabel(value)
    }
  };
};
