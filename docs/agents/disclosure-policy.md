# 信息披露策略

## 主仓库公开文档

跟踪到主仓库的文档可以记录可复用的项目架构、维护流程、公开运行要求和经过脱敏的故障特征。敏感信息或只对某台机器、某个会话成立的观察不得写入。

## Sidecar

RM、task、plan、decision、run、validation note 和 handoff 属于相邻 `dynamic-form.sidecar`。Sidecar 记录也必须经过脱敏；不要复制完整终端日志或环境状态。

## 本地状态与秘密

不要在跟踪文档中保存个人身份、用户主目录绝对路径、主机信息、私有仓库地址、凭据、token、cookie、密码、私钥或包含凭据的 URL。确需说明格式时使用 `$HOME`、`<token>`、`<private-url>` 等占位符。

不要自行建立或跟踪本地 runtime 状态目录。若以后采用 Agent Workspace，应按 manifest 声明的 public/local 边界存储，并遵守 `.gitignore`。

## 提炼与验证

将观察写入长期文档前，先确认它可复用且属于项目公开约定；删除身份、机器、基础设施和凭据细节；选唯一 owner；再运行 Agent Docs validator 和适用的项目检查。
