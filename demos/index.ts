// 演示组件统一导出
export { default as StoreBoundaryDemo } from './storeBoundaryDemo';
export { default as DemoSelector } from './DemoSelector';
export { default as CustomHandlersDemo } from './customHandlersDemo';
export { default as CustomComponentsDemo } from './customComponentsDemo';
export { default as FormValidationDemo } from './formValidationDemo';
export { default as UIConfigDemo } from './uiConfigDemo';
export { default as RenderExtensionDemo } from './renderExtensionDemo';
export { default as CompilerFoundationDemo } from './compilerFoundationDemo';
export { default as NodeModel4Demo } from './nodeModel4Demo';
export { nodeModel4DemoConfig, nodeModel4DemoValues } from './nodeModel4DemoConfig';
export { DEMO_COMPONENTS } from './demoRegistry';
export type { DemoType, DemoDefinition } from './demoRegistry';
export { useDemoInitHandlers } from './useDemoInitHandlers';

// 演示组件类型定义
export interface DemoComponentProps {
  title?: string;
  description?: string;
}
