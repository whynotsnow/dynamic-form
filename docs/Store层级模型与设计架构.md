# Store 层级模型与设计架构

本总结了当前 Store 层级模型、配置来源、合并规则、设计原则与实现要点（含示例与 TypeScript 草案）。

>

---

## 一、概览

设计目标：把「静态配置 / 动态配置」与「全局 / 字段级别」明确分层，职责清晰、合并规则可预测、性能可控。

核心约定：

- 静态字段配置：由 `formConfig` 提供，初始化后不频繁改动，保存在字段对象（`fields[fieldName].meta`）顶层。
- 动态字段配置：由 effect / 运行时逻辑写入，统一写入 `fields[fieldName].meta.formItemProps`（外层）或 `fields[fieldName].meta.componentProps`（内层）。
- 全局静态配置：由用户把 `uiConfig` 作为组件 props 传入（不一定写入 store，直接通过 props/context 使用）。
- 全局动态配置：写入 `store.dynamicUIConfig`，并在渲染前合并/解析。

---

## 二、Store 数据结构（示例）

    store = {
      configProcessInfo: {
        effectMap: {...},
        // ...
      },

      // 动态全局配置（运行时变化）
      dynamicUIConfig: {
        formItemProps: { ... },
        componentProps: { ... },
        // ...
      },

      // 字段值（运行时）
      fieldValues: {
        username: 'alice',
        email: 'a@x.com',
        // ...
      },

      // 字段运行时元信息（包含静态 + 动态）
      fields: {
        username: {
          meta: {
            // === 静态（来自 formConfig） ===
            label: '用户名',
            placeholder: '请输入用户名',
            span: 12,
            // === 动态（由 effect 写入） ===
            formItemProps: { /* 动态外层属性，如 label: __deferred__ */ },
            componentProps: { /* 动态内层属性 */ },
            // optional: render, visible, disabled ...
          }
        },
        // ...
      },


      initialized: true
    }

---

## 三、配置来源与存储策略（简表）

| 维度 |             静态（来源） |                         存储位置 | 动态（来源）             |                                                                                 存储位置 |
| ---- | -----------------------: | -------------------------------: | ------------------------ | ---------------------------------------------------------------------------------------: |
| 全局 | `uiConfig`（组件 props） |              ——（props/context） | effect / 运行时          |                                                                        `dynamicUIConfig` |
| 字段 |   `formConfig`（初始化） | `fields[field].meta`（顶层静态） | effect / 交互 / 规则触发 | `fields[field].meta.formItemProps`（外层） / `fields[field].meta.componentProps`（内层） |

---

## 四、渲染前合并规则（伪码）

合并优先级（低 → 高）：**静态字段配置 → 全局动态配置 → 字段动态配置**

    // 最终用于 Form.Item 的 props
    finalFormItemProps = merge(
      pickStaticFormItemProps(field.meta),     // 静态：meta 顶层中的 label/name 等
      dynamicUIConfig?.formItemProps,          // 全局动态（可选）
      field.meta?.formItemProps                // 字段动态（最高优先）
    );

    // 最终用于内部组件的 props
    finalComponentProps = merge(
      pickStaticComponentProps(field.meta),    // 静态：placeholder 等
      dynamicUIConfig?.componentProps,         // 全局动态（可选）
      field.meta?.componentProps               // 字段动态（最高优先）
    );

备注：

- `merge` 语义以浅合并为主；对于 `rules`、`style` 等复合值，可以使用深合并或自定义合并策略（例如规则数组合并而非覆盖）。

---

## 五、设计原则（要点）

1. **职责清晰**
   - `meta.formItemProps` → 外层（`<Form.Item>`）相关的动态配置（label、help、extra、rules、tooltip 等）。
   - `meta.componentProps` → 内层组件（Input/Select 等）相关的动态配置（placeholder、options、disabled 等）。

2. **静态 / 动态分离**
   - 静态配置：初始化保存（`formConfig` → `fields[].meta`），仅少量变更。
   - 动态配置：运行时写入 `meta.formItemProps` / `meta.componentProps` 或 `dynamicUIConfig`。

3. **合并规则可预测**
   - 按「静态 < 全局动态 < 字段动态」合并，避免歧义。

4. **不把不可序列化产物直接写入 store**
   - 不将 JSX/ReactElement 或已执行的函数结果直接持久化。渲染相关函数应在存储时包装为延迟对象（例：`{ __deferred__: true, fn }`）或 descriptor。

5. **性能优先**
   - 存储阶段只做必要封装（不要递归执行深层函数）。
   - 渲染阶段做递归解析，并使用 `WeakMap` 缓存防止重复解析和循环引用。
   - 字段组件应只订阅自身相关的 store 子集，避免全表重渲染。

---

## 六、Handler / Effect 写入约定

- **Effect 返回示例**：

  // effect 返回一个结构化的对象（只包含要更新的部分）
  return {
  formItemProps: {
  label: ({ values }) => <DynamicLabel values={values} />,
  extra: '来自 effect 的说明'
  },
  componentProps: {
  disabled: someCondition
  },
  value: 'newValue'
  };

- **写入 store（建议）**：
  - 外层/内层动态配置：合并写入 `fields[fieldName].meta.formItemProps` / `componentProps`（使用合并而非替换，保留已有属性）。
  - 全局变化写入 `dynamicUIConfig`。
  - 对渲染类函数（返回 JSX 的函数）在写入时包装为延迟对象： `{ __deferred__: true, fn: labelFn }`。

- **渲染时解析**：
  - 在 `useMemo` 中合并静态 + 全局动态 + 字段动态得到 `merged`，然后调用 `resolveConfigTree(merged, { field, form, values })`，该函数递归解析 `__deferred__`、function、object，使用缓存避免重复。

---

## 七、示例：`testDynamicLabel` 的处理流程

字段定义（静态）：

    {
      id: 'testDynamicLabel',
      component: 'TextInput',
      label: '测试动态Label', // 静态 label（fallback）
      span: 12,
      effect: (_changedValue, allValues) => ({
        formItemProps: {
          label: ({ field }) => (
            <Space> ... 动态 JSX（使用 allValues.username） ... </Space>
          )
        }
      })
    }

存入 store（建议）：

- 保留静态： `fields.testDynamicLabel.meta.label = '测试动态Label'`
- effect 返回的 label 存为延迟对象：
  `fields.testDynamicLabel.meta.formItemProps.label = { __deferred__: true, fn: ({field, form, values}) => <JSX/> }`

渲染合并与解析：

- mergedFormItemProps = merge(staticMeta, dynamicUIConfig.formItemProps, field.meta.formItemProps)
- resolveConfigTree(mergedFormItemProps, { field, form, values }) 会在渲染时执行 `__deferred__.fn` 并返回真实 JSX（使用最新 values）。

---

## 八、性能与实现要点

- **prepareForStore（写入阶段）**：只做顶层封装（把渲染函数包为 `__deferred__`），不要递归执行或替换整个对象结构。
- **resolveConfigTree（渲染阶段）**：递归解析，并用 `WeakMap` 做缓存与循环引用保护；先做浅判断跳过纯静态对象以减少递归。
- **订阅策略**：字段组件订阅 `fields[fieldName].meta`、`fields[fieldName].value` 与必要 `dynamicUIConfig` 子集，不订阅全 store。
- **序列化**：若需持久化 store（localStorage / server），先移除或序列化 `__deferred__` / 函数 / JSX（例如转换为 descriptor）。

---

## 九、迁移建议（从旧结构到新结构）

1. **读取兼容**：在读取 `meta` 时，优先读取 `meta.formItemProps` / `meta.componentProps`，若发现旧字段（`meta.style`、`meta.rules` 等），在读取时合并到 `formItemProps`（写操作可渐进）。
2. **渐进写入**：当 effect 或其它流程更新时，优先写入新结构（`formItemProps` / `componentProps`），并在后台/迁移脚本中把旧结构转为新结构。
3. **文档与校验**：更新开发文档与类型定义（TypeScript interface），并在 CI/测试中添加兼容性检查。
4. **回退策略**：上线初期保留兼容层 1 个版本，收集并修复对旧结构的引用后再移除。

---

## 十、TypeScript 类型草案（参考）

    interface Store {
      configProcessInfo: ConfigProcessInfo;
      dynamicUIConfig: Record<string, any>;
      fieldValues: Record<string, any>;
      fields: Record<string, FieldState>;
      initialized: boolean;
    }

    interface FieldState {
      id: string;
      meta: FieldMeta;
      // ...其它运行时字段
    }

    interface FieldMeta {
      // 静态（初始化）
      label?: string | React.ReactNode;
      placeholder?: string;
      span?: number;
      // 动态（运行时）
      formItemProps?: Record<string, any>;   // 外层（Form.Item）
      componentProps?: Record<string, any>;  // 内层组件
      render?: any;
      visible?: boolean;
      disabled?: boolean;
    }

备注：可把 `formItemProps` / `componentProps` 的类型进一步细化为泛型或具体接口以获得更强的类型检查。

---

## 十一、结语

- 将「静态」与「动态」、以及「全局」与「字段级别」明确分层，能极大提升可维护性与可预测性。
- 存储阶段只封装（不执行），渲染阶段递归解析并缓存，是性能与正确性的最佳折中。
- 迁移时使用读取兼容 + 渐进写入策略可以平滑过渡到新结构。
