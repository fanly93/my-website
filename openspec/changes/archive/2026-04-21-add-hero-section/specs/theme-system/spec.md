## ADDED Requirements

### Requirement: 手动切换亮/暗主题

系统 SHALL 提供主题切换入口，允许用户在亮色和暗色模式之间手动切换，切换结果通过 `.dark` class 应用到 `<html>` 元素。

#### Scenario: 用户从亮色切换到暗色

- **WHEN** 当前主题为亮色，用户点击主题切换按钮
- **THEN** `<html>` 元素添加 `.dark` class，页面颜色方案立即更新

#### Scenario: 用户从暗色切换到亮色

- **WHEN** 当前主题为暗色，用户点击主题切换按钮
- **THEN** `<html>` 元素移除 `.dark` class，页面颜色方案立即更新

#### Scenario: 键盘访问切换按钮

- **WHEN** 用户通过 Tab 键聚焦到切换按钮并按下 Enter 或 Space
- **THEN** 触发与鼠标点击相同的主题切换行为

---

### Requirement: 主题偏好持久化

系统 SHALL 将用户的主题选择持久化到 `localStorage`，键名为 `theme`，值为 `"light"` 或 `"dark"`。

#### Scenario: 切换后刷新页面保持主题

- **WHEN** 用户切换主题后刷新页面
- **THEN** 页面加载后仍应用用户上次选择的主题

#### Scenario: 清除 localStorage 后回退系统偏好

- **WHEN** 用户清除 localStorage 后访问页面
- **THEN** 页面使用系统 `prefers-color-scheme` 作为默认主题

---

### Requirement: 防止主题闪烁（FOUC）

系统 SHALL 在页面首次渲染前完成主题初始化，避免出现错误主题的短暂闪烁。

#### Scenario: 已有 localStorage 主题偏好时无闪烁

- **WHEN** 用户存有 `localStorage.theme = "dark"` 并访问页面
- **THEN** 页面首次渲染直接呈现暗色主题，不出现亮色→暗色的闪烁

#### Scenario: 无 localStorage 偏好时跟随系统（边界）

- **WHEN** 用户首次访问且系统偏好为暗色
- **THEN** 页面首次渲染直接呈现暗色主题，不出现亮色→暗色的闪烁

#### Scenario: localStorage 值无效时的降级（边界）

- **WHEN** `localStorage.theme` 存有非 `"light"/"dark"` 的无效值
- **THEN** 系统忽略无效值，回退到 `prefers-color-scheme` 决定的主题
