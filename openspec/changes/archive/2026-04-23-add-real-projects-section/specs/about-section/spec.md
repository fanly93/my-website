## MODIFIED Requirements

### Requirement: 社交账号链接展示

关于我区域 SHALL 在简介下方展示社交账号入口，至少包含 GitHub 链接和邮箱链接。每个链接 SHALL 带图标，GitHub 链接在新标签页打开（`target="_blank" rel="noopener noreferrer"`），邮箱链接使用 `mailto:` 协议，收件人地址为 `fanly93@qq.com`。系统 SHALL NOT 提供任何表单输入或信息提交功能。

#### Scenario: GitHub 链接跳转

- **WHEN** 用户点击 GitHub 图标链接
- **THEN** 在新标签页打开 GitHub 主页，`rel="noopener noreferrer"` 已设置

#### Scenario: 邮箱链接触发邮件客户端

- **WHEN** 用户点击邮箱图标链接
- **THEN** 系统调用默认邮件客户端并预填收件人地址 `fanly93@qq.com`

#### Scenario: 无表单提交功能（边界）

- **WHEN** 用户浏览关于我区域
- **THEN** 页面不存在任何输入框、提交按钮或表单元素

#### Scenario: 键盘访问社交链接

- **WHEN** 用户通过 Tab 键聚焦到社交链接并按下 Enter
- **THEN** 触发与鼠标点击相同的跳转行为，焦点样式可见
