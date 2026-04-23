# mouse-trail Specification

## Purpose
TBD - created by archiving change add-hero-section. Update Purpose after archive.
## Requirements
### Requirement: 鼠标移动时产生发光拖尾

系统 SHALL 在鼠标移动时，于光标经过的路径上渲染一条由发光圆点组成的彗星尾迹，圆点随时间消散。拖尾覆盖整个视口，不局限于 Hero 区域。

#### Scenario: 鼠标移动时显示拖尾

- **WHEN** 用户在页面任意位置移动鼠标
- **THEN** 光标路径上出现发光圆点序列，越旧的圆点越小越透明，形成消散的彗星尾迹

#### Scenario: 拖尾颜色跟随主题

- **WHEN** 当前主题为暗色模式
- **THEN** 拖尾颜色为紫色调（`rgba(167, 139, 250, ...)`）

#### Scenario: 拖尾颜色跟随主题（亮色）

- **WHEN** 当前主题为亮色模式
- **THEN** 拖尾颜色为深紫色调（`rgba(124, 58, 237, ...)`）

#### Scenario: 鼠标静止后拖尾消散

- **WHEN** 用户停止移动鼠标
- **THEN** 已有拖尾圆点在 500ms 内逐渐消散至不可见

---

### Requirement: 拖尾不干扰页面交互

拖尾 Canvas SHALL 覆盖在页面最顶层（`z-index: 40`），但 SHALL NOT 拦截任何鼠标事件，不影响按钮点击、文字选取等交互。

#### Scenario: 点击 CTA 按钮不被拖尾阻挡

- **WHEN** 拖尾 Canvas 覆盖在 CTA 按钮上方
- **THEN** 用户点击 CTA 按钮仍然有效，Canvas 不消费鼠标事件

#### Scenario: 视口尺寸变化时 Canvas 自适应（边界）

- **WHEN** 用户调整浏览器窗口大小
- **THEN** 拖尾 Canvas 尺寸同步更新为新视口尺寸，拖尾不出现错位

---

### Requirement: prefers-reduced-motion 下禁用拖尾

系统 SHALL 在检测到 `prefers-reduced-motion: reduce` 时完全不渲染拖尾组件。

#### Scenario: 减少动效偏好时无拖尾（边界）

- **WHEN** 用户系统开启「减少动态效果」偏好
- **THEN** MouseTrail 组件不渲染，光标移动时无任何拖尾效果

