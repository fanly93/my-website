## MODIFIED Requirements

### Requirement: 手动切换亮/暗主题

系统 SHALL 提供主题切换入口，允许用户在亮色和暗色模式之间手动切换，切换结果通过 `.dark` class 应用到 `<html>` 元素。切换入口 SHALL 位于 Navbar 右侧，不再作为独立浮动按钮存在。

#### Scenario: 用户从亮色切换到暗色

- **WHEN** 当前主题为亮色，用户点击 Navbar 中的主题切换按钮
- **THEN** `<html>` 元素添加 `.dark` class，页面颜色方案立即更新

#### Scenario: 用户从暗色切换到亮色

- **WHEN** 当前主题为暗色，用户点击 Navbar 中的主题切换按钮
- **THEN** `<html>` 元素移除 `.dark` class，页面颜色方案立即更新

#### Scenario: 键盘访问切换按钮

- **WHEN** 用户通过 Tab 键聚焦到切换按钮并按下 Enter 或 Space
- **THEN** 触发与鼠标点击相同的主题切换行为
