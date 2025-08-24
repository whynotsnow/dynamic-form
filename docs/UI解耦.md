# DynamicForm 组件 UI 解耦与渲染链路文档

本文档介绍 **DynamicForm** 组件的 UI 解耦设计，重点说明用户如何通过 `renderFieldItem`、`renderFields`、`renderGroupItem`、`renderGroups`、`renderFormInner` 等 props 来自定义表单渲染，同时保证组件的核心功能不丢失。

---

## 1. 设计目标

- **逻辑与 UI 分离**：DynamicForm 内部只处理数据流、依赖链和副作用，UI 通过渲染函数定制。
- **逐层覆盖**：从最小粒度字段到整个表单，用户可按需覆盖。
- **兜底机制**：最小粒度的字段渲染 (`renderFieldItem`) 提供默认渲染，确保组件核心功能完整。
- **高层向下传递 defaultRender**：用户可选择使用下一级渲染或自定义渲染，避免功能缺失。

---

## 2. 渲染链路（Render Props）

### 层级关系

```
DynamicForm
└─ renderFormInner (整体表单)
   └─ renderGroups (分组集合)
      └─ renderGroupItem (单分组)
         └─ renderFields (分组内字段区域)
            └─ renderFieldItem (单字段)
```

> 每层渲染函数都会提供一个 `defaultRender` 给下一层，保证逐层扩展和兜底功能。

---

## 3. 类型定义示意

```
interface RenderFieldItemParams {
  field: FieldState;
  form: FormInstance;
  fieldValue: any;
  renderField: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

interface RenderFieldsParams {
  fields: FieldState[];
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

interface RenderGroupItemParams {
  group: GroupFieldState;
  dynamicUIConfig: UIConfig;
  renderFields: (fields: FieldState[]) => React.ReactNode;
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

interface RenderGroupsParams {
  groupFields: Record<string, GroupFieldState>;
  renderGroupItem: (group: GroupFieldState) => React.ReactNode;
  renderFields: (fields: FieldState[]) => React.ReactNode;
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: React.ReactNode;
}

interface RenderFormParams {
  form: FormInstance;
  fields: Record<string, FieldState>;
  groupFields: Record<string, GroupFieldState>;
  dynamicUIConfig: UIConfig;
  renderGroups: (groups: Record<string, GroupFieldState>) => React.ReactNode;
  renderGroupItem: (group: GroupFieldState) => React.ReactNode;
  renderFields: (fields: FieldState[]) => React.ReactNode;
  renderFieldItem: (field: FieldState) => React.ReactNode;
  defaultRender: {
    fieldsArea: React.ReactNode;
    submitArea: React.ReactNode;
  };
}
```

---

## 4. 渲染流程

1. **DynamicForm** 初始化，获取表单数据、字段状态和分组状态。
2. **renderFormInner**：用户可完全自定义表单布局或使用 `defaultRender`。
3. **renderGroups**：可覆盖整个分组集合的渲染逻辑，仍可调用 `renderGroupItem`。
4. **renderGroupItem**：覆盖单个分组的渲染，内部可调用 `renderFields`。
5. **renderFields**：覆盖字段区域渲染，内部可调用 `renderFieldItem`。
6. **renderFieldItem**：最小粒度字段渲染，提供默认渲染保证功能完整。

> 注意：高层渲染函数必须显式调用下一层函数或 `defaultRender` 才能保持功能完整。

---

## 5. UI 盒模型/组件层级图

```
Form
├─ fieldsArea (fields 或 groups)
│  ├─ Groups (renderGroups)
│  │  ├─ GroupItem (renderGroupItem)
│  │  │  └─ Fields (renderFields)
│  │  │     └─ FieldItem (renderFieldItem)
│  └─ Fields (renderFields)
│     └─ FieldItem (renderFieldItem)
└─ submitArea
   └─ SubmitButton
```

---

## 6. 用户使用示例

```
<DynamicForm
  form={form}
  formConfig={formConfig}
  componentRegistry={componentRegistry}
  renderFieldItem={renderFieldItem}
  renderFields={renderFields}
  renderGroupItem={renderGroupItem}
  renderGroups={renderGroups}
  renderFormInner={renderFormInner}
/>
```

- `renderFieldItem`：单字段自定义
- `renderFields`：字段集合自定义
- `renderGroupItem`：单分组自定义
- `renderGroups`：分组集合自定义
- `renderFormInner`：整个表单布局自定义
