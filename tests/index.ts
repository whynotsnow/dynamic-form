// DynamicForm 测试工具索引

// 测试数据
export * from './testData';

// 批量更新测试
export * from './testBatchUpdate';

// 统一性能监控工具（替代原来的两个性能监控文件）
export * from './unifiedPerformanceMonitor';

// 测试工具使用说明
export const TEST_TOOLS_GUIDE = {
  testData: '测试数据配置，包含各种表单配置示例',
  testBatchUpdate: '批量更新测试工具，验证批量更新机制',
  unifiedPerformanceMonitor: '统一性能监控工具，包含渲染监控和通用性能测试',
  formItemPropsTest: 'formItemProps优先级测试，验证字段级别配置覆盖全局配置'
};
