import type { FieldState, GroupFieldState, FieldRegistry, Fieldchain } from '../types';

/** --------------------- 配置分析结果 --------------------- */
export interface ConfigAnalysisResult {
  effectMap: Record<string, Fieldchain>;
  fieldRegistry: Record<string, FieldRegistry>;
}

/** --------------------- 带初始值的结果 --------------------- */
export interface HydratedConfigResult {
  initialValues: Record<string, any>;
  initializedFields: Record<string, FieldState>;
  initializedGroupFields: Record<string, GroupFieldState>;
}

/** --------------------- 最终组合后的完整信息 --------------------- */
export interface ConfigProcessInfo extends ConfigAnalysisResult, HydratedConfigResult {}
