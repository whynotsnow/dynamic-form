# Field Address

DynamicForm 3.1 引入 `FieldAddress`，将字段的稳定逻辑标识与 Ant Design Form 值路径分离：

```ts
interface FieldAddress {
  id: string;
  name: NamePath;
}
```

- `id` 是 Runtime、field registry、effect graph 和 meta 更新使用的全局唯一标识。
- `name` 是 Ant Design `Form.Item`、值读写和校验使用的 `NamePath`。
- 未配置 `name` 时自动使用 `id`，现有单层配置无需迁移。

### 嵌套值路径

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

### 公共工具

包导出 `resolveFieldAddress(field)` 和 `getFieldName(field)`。自定义 `Form.Item`、`Form.List` 或手工调用 `form.validateFields()` 时应使用 `getFieldName(field)`。

### 当前边界

3.1 提供字段寻址和嵌套值路径基础，但不引入 container 字段或递归节点树。字段和 group 的 `id` 仍须全局唯一，两个字段不能使用相同 `name` 路径。

