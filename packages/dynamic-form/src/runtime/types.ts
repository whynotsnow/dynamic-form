/**
 * 字段运行时能力
 */
export interface FieldCapability {
  /**
   * 是否应该被渲染
   */
  rendered: boolean;

  /**
   * 是否参与提交
   */
  submitable: boolean;

  /**
   * 是否可编辑
   */
  editable: boolean;

  /**
   * 是否只读
   */
  readonly: boolean;

  /**
   * 是否禁用
   */
  disabled: boolean;

  /**
   * 是否参与校验
   */
  validatable: boolean;
}

/**
 * 分组运行时能力
 */
export interface GroupCapability {
  /**
   * 是否应该被渲染
   */
  rendered: boolean;
}

export type NodeCapability = FieldCapability | GroupCapability;
