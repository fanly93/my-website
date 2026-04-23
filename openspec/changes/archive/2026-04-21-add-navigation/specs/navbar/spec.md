## ADDED Requirements

### Requirement: 固定顶部导航栏

Navbar SHALL 固定在视口顶部（`position: fixed`），高度 64px，横跨全屏宽度，z-index 为 50，始终覆盖在页面内容之上。左侧显示站点名字，右侧显示导航链接和 ThemeToggle。

#### Scenario: 页面滚动时 Navbar 保持固定

- **WHEN** 用户向下滚动页面
- **THEN** Navbar 始终固定在视口顶部，不随内容滚动

#### Scenario: Navbar 覆盖在所有内容之上（边界）

- **WHEN** 页面中存在粒子背景、鼠标拖尾等绝对定位元素
- **THEN** Navbar 始终显示在所有内容层之上，不被遮挡

---

### Requirement: 滚动触发磨砂玻璃背景

Navbar 在页面顶部时 SHALL 保持完全透明背景；当页面向下滚动超过 60px 后，SHALL 过渡为半透明磨砂玻璃背景（`backdrop-blur` + 半透明底色），并添加底部分隔线。

#### Scenario: 页面顶部时 Navbar 透明

- **WHEN** 用户位于页面顶部（scroll < 60px）
- **THEN** Navbar 背景完全透明，粒子效果可透过 Navbar 区域显示

#### Scenario: 滚动后触发磨砂玻璃效果

- **WHEN** 用户向下滚动超过 60px
- **THEN** Navbar 背景变为半透明磨砂玻璃（亮色：`bg-white/80 backdrop-blur`，暗色：`bg-gray-950/80 backdrop-blur`），并出现底部分隔线

#### Scenario: 回滚到顶部恢复透明（边界）

- **WHEN** 用户从滚动状态回滚到页面顶部（scroll < 60px）
- **THEN** Navbar 背景平滑过渡回透明状态

---

### Requirement: 导航链接平滑跳转

Navbar 右侧 SHALL 包含「首页」「项目」「联系我」三个导航链接，点击后页面平滑滚动至对应 section（`#home`、`#projects`、`#contact`）。

#### Scenario: 点击导航链接跳转

- **WHEN** 用户点击「项目」链接
- **THEN** 页面平滑滚动至 `#projects` section，且 Navbar 高度不遮挡 section 标题（`scroll-margin-top: 64px`）

#### Scenario: 键盘访问导航链接

- **WHEN** 用户通过 Tab 键聚焦到导航链接并按下 Enter
- **THEN** 触发与鼠标点击相同的平滑跳转行为

#### Scenario: 目标 section 不存在（边界）

- **WHEN** 点击的导航链接对应 section 尚未在页面中渲染
- **THEN** 点击不触发报错，页面无可见跳转（浏览器默认行为）

---

### Requirement: 当前 section Active 高亮

Navbar SHALL 通过 IntersectionObserver 追踪当前视口中央可见的 section，并将对应导航链接标记为高亮激活状态（区别于未激活链接的颜色）。

#### Scenario: 滚动到 Projects section 时高亮

- **WHEN** 用户滚动使 `#projects` section 占据视口中央
- **THEN** 「项目」链接显示高亮激活样式，其他链接恢复默认样式

#### Scenario: 页面顶部时首页高亮

- **WHEN** 用户位于页面顶部，`#home` section 可见
- **THEN** 「首页」链接显示高亮激活样式

#### Scenario: 两个 section 切换时高亮平滑过渡（边界）

- **WHEN** 用户缓慢滚动经过两个 section 的边界
- **THEN** 高亮状态切换到新的 section 对应链接，不出现两个链接同时高亮
