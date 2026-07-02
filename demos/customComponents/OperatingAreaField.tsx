import { Select, Space, Typography } from 'antd';
import { FieldComponentProps } from '@/shared/types';
import { EffectFn } from 'form-chain-effect-engine';

/**
 * 主营品类类型
 */
export type CategoryType =
  | 'fruitsAndVegetables'
  | 'aquatic'
  | 'cookedFood'
  | 'Icecream/frozenProducts';

/**
 * Select 选项类型
 */
export interface AreaOption {
  value: string;
  label: string;
}

/**
 * 主营品类 -> 经营地区映射
 *
 * 供组件和 Effect 共享使用。
 */
export const AREA_OPTIONS_MAP: Record<CategoryType, AreaOption[]> = {
  fruitsAndVegetables: [
    {
      value: 'guangzhou',
      label: '广州'
    },
    {
      value: 'shenzhen',
      label: '深圳'
    }
  ],

  aquatic: [
    {
      value: 'guangzhou',
      label: '广州'
    },
    {
      value: 'shanghai',
      label: '上海'
    }
  ],

  cookedFood: [
    {
      value: 'beijing',
      label: '北京'
    }
  ],

  'Icecream/frozenProducts': [
    {
      value: 'guangzhou',
      label: '广州'
    },
    {
      value: 'shenzhen',
      label: '深圳'
    },
    {
      value: 'shanghai',
      label: '上海'
    },
    {
      value: 'beijing',
      label: '北京'
    }
  ]
};
type OperatingAreaFieldProps = FieldComponentProps & {
  options?: AreaOption[];
};
/**
 * DynamicForm 自定义业务组件 Demo
 *
 * 注意：
 * 当前组件仅负责展示。
 *
 * options 数据由 DependencyEngine
 * 通过 RuntimeMeta 注入。
 */

export const OperatingAreaField: React.FC<OperatingAreaFieldProps> = (connect) => {
  const { value, onChange, options = [] } = connect;
  console.log(connect, 'connect');
  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Select
        value={value as string}
        onChange={onChange}
        options={options}
        placeholder="请选择经营地区"
      />

      <Typography.Text type="secondary">
        联动示例：经营地区选项由 DynamicForm DependencyEngine 动态计算
      </Typography.Text>
    </Space>
  );
};

/**
 * categories -> operatingArea
 *
 * DynamicForm DependencyEngine 副作用示例
 *
 * 职责：
 * 1. 根据主营品类计算经营地区选项
 * 2. 更新 operatingArea RuntimeMeta
 * 3. 自动修正非法值
 */
export const operatingAreaEffect: EffectFn = (category, allValues) => {
  const options = AREA_OPTIONS_MAP[allValues.categories as CategoryType] ?? [];

  const currentValue = allValues.operatingArea;

  const valid = options.some((item) => item.value === currentValue);

  return {
    componentProps: {
      options
    },

    ...(valid
      ? {}
      : {
          value: options[0]?.value
        })
  };
};

export default OperatingAreaField;
