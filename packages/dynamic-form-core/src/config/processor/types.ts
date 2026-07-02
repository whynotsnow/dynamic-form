import type {
  FieldState,
  GroupFieldState,
  FieldRegistry,
  Fieldchain,
  FieldAddress,
  NodeRegistryEntry,
  ContainerRegistryEntry,
  ContainerState
} from '../../shared/types';

/** --------------------- 配置分析结果 --------------------- */
export interface ConfigAnalysisResult {
  effectMap: Record<string, Fieldchain>;
  nodeRegistry: Record<string, NodeRegistryEntry>;
  containerRegistry: Record<string, ContainerRegistryEntry>;
  fieldRegistry: Record<string, FieldRegistry>;
  fieldAddressRegistry: Record<string, FieldAddress>;
  rootNodeIds: string[];
}

/** --------------------- 带初始值的结果 --------------------- */
export interface HydratedConfigResult {
  initialValues: Record<string, any>;
  initializedFields: Record<string, FieldState>;
  initializedGroupFields: Record<string, GroupFieldState>;
  initializedNodes: Record<string, FieldState | ContainerState>;
  initializedContainerFields: Record<string, Record<string, FieldState>>;
}

/** --------------------- 最终组合后的完整信息 --------------------- */
export interface ConfigProcessInfo extends ConfigAnalysisResult, HydratedConfigResult {}
