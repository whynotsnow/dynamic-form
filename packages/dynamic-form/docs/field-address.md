# Field Address

DynamicForm 将 `FieldAddress` 纳入当前能力基线，用来把字段的稳定逻辑标识与 Ant Design Form 值路径分离：

```ts
interface FieldAddress {
  id: string;
  name: NamePath;
}
```

- `id` 是 Runtime、field registry、effect graph 和 meta 更新使用的全局唯一标识。
- `name` 是 Ant Design `Form.Item`、值读写和校验使用的 `NamePath`。
- 未配置 `name` 时自动使用 `id`，现有单层配置无需迁移。
- 在 4.0 `nodes` 中，父级 container 的 `name` 会作为后代字段 `name` 的前缀。

## 嵌套值路径

```ts
const formConfig: FormConfig = {
  fields: [
    {
      id: 'shippingCity',
      name: ['shipping', 'city'],
      component: 'TextInput',
      initialValue: 'Shanghai',
      dependents: ['shippingDistrict']
    },
    {
      id: 'shippingDistrict',
      name: ['shipping', 'district'],
      component: 'TextInput'
    }
  ]
};
```

提交值会保持 `{ shipping: { city, district } }` 结构。`dependents` 仍引用稳定 `id`，不引用 `NamePath`，因此值结构调整不会直接改变 effect graph 节点。Effect 和函数式 `initialValue` 接收的 values 同时保留嵌套结构，并提供按稳定 `id` 读取的字段别名。

## 公共工具

包导出 `resolveFieldAddress(field)` 和 `getFieldName(field)`。自定义 `Form.Item`、`Form.List` 或手工调用 `form.validateFields()` 时应使用 `getFieldName(field)`。

JsonSchema、OpenAPI 和 Metadata adapters 可以通过 metadata 显式透传 `name`，最终仍落到现有 `BaseFieldConfig.name`。这适合外部 schema 输入需要生成嵌套 values，但不改变 effect graph 仍引用稳定 `id` 的规则。

## Container 前缀

4.0 的 `ContainerNode.name` 会成为后代字段的 Ant Design 值路径前缀：

```ts
const formConfig: FormConfig = {
  nodes: [
    {
      nodeType: 'container',
      id: 'shipping',
      name: 'shipping',
      children: [
        {
          nodeType: 'field',
          id: 'city',
          component: 'TextInput'
        }
      ]
    }
  ]
};
```

字段 `city` 的最终 `NamePath` 是 `['shipping', 'city']`。如果字段显式声明 `name: 'addressCity'`，最终路径会变成 `['shipping', 'addressCity']`。

## 稳定边界

字段、group 和 container 的 `id` 仍须全局唯一。两个字段不应使用相同最终 `name` 路径，否则 Ant Design Form 的值读写会发生冲突。

分组只影响 Runtime 渲染、提交和校验能力；`groups` 不会为字段值路径自动增加 group 前缀。只有 `nodes` 中声明了 `name` 的 container 会参与值路径组合。

面向后续结构性升级时，应始终使用全局唯一、稳定的 field/group `id`。需要嵌套提交值时显式配置 `name`，不要把嵌套语义编码进 `id`。
