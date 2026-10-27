# DeepSeek 光标呼吸灯 / DeepSeek Cursor Halo

一个无感跟随鼠标的 DSH Web 插件：隐藏系统鼠标指针，在指针处只显示 DeepSeek 主题色的实心圆核心、无缝衔接的呼吸光晕，以及跟随移动渐隐的拖尾。

## 效果

- **隐藏原生指针**：首次收到指针移动后隐藏 DSH 页面内的系统鼠标光标，只保留呼吸灯。
- **实心核心**：`#4d6bfe`（DeepSeek 蓝）12px 圆点。
- **无缝光晕**：88px 的中心向外径向渐变，核心与光晕之间不再有透明空隙，向外逐渐透明。
- **呼吸动画**：纯 CSS `transform: scale()` + `opacity`，6 秒慢呼吸，从 0.70 倍收缩状态平滑扩张到 1.12 倍，再收缩回来。
- **鼠标拖尾**：Canvas 绘制的一条连续渐变线，沿最近约 0.32 秒的指针轨迹平滑延伸，快速移动时也不会断成多个点。
- **点击收束**：按下鼠标左键时光晕猛地向内收一下，再回弹到当前呼吸状态；实心圆核心保持不动。
- **设置面板**：在「设置」中新增「光标呼吸灯」栏目，可实时调整是否显示拖尾、拖尾时长、是否显示光晕、光晕大小、闪动开关与周期，是否用蓝点替换系统鼠标指针，以及是否在所有弹层上隐藏。
- **多语言界面**：设置页和插件管理元数据支持中文、English（美国/英国）、Français、Русский、日本語。
- **始终置顶**：通过 `document.body` 顶层 Portal 挂载，并使用最高 `z-index`；蓝色圆点自身 `z-index` 高于光晕，拖尾位于最底层。
- **全局弹层开关**：默认在指针进入菜单、下拉列表、对话框或设置面板时隐藏光晕并恢复系统鼠标指针，离开后恢复；可在设置中关闭「在所有弹层上隐藏」，让效果在所有弹层上也继续保持。
- **零打扰**：`pointer-events: none`，不拦截任何鼠标操作，也不读写其他插件的 DOM。
- **自然出入**：指针离开页面、窗口失焦或页面隐藏时淡出并恢复原生指针；再次移动时重新隐藏并淡入。触摸输入不显示。
- **无障碍**：`aria-hidden="true"`；系统开启“减少动态效果”时停止光晕缩放和点击收束动画。

## 文件

| 文件 | 作用 |
|---|---|
| `package.json` | Bundle 清单、`dsh.bundle.patch` 与 `dsh.client` 声明 |
| `cordis.patch.yml` | 插入 `dsh-cursor-halo` 插件行 |
| `index.js` | Host 半边（无宿主能力，仅占位） |
| `client.js` | Client 半边：`shell.overlay` 槽位、设置页、多语言字典、指针监听、Canvas 拖尾与 CSS 绘制 |
| `locale/*.json` | 插件管理器中的标题与描述：`en`、`zh`、`fr`、`ru`、`ja` |
| `icon.svg` | 插件管理器图标 |

## 安装

在 DSH 中通过 Plugin Manager 安装本地 bundle：

```text
plugin_manager install_bundle
target: E:\DSH WORKSTATON\dsh-cursor-halo
```

安装后插件立即生效；移动鼠标后原生指针隐藏，只显示呼吸灯。因本包是本地目录链接安装，修改 `client.js` 后 HMR 会重新加载模块。插件卸载或禁用时会自动移除隐藏光标的 CSS 类，恢复原生指针。

> 隐藏光标作用于 DSH 页面本身；离开 DSH 窗口到其他应用时，系统指针照常显示。内嵌 iframe 内部的指针由 iframe 自身控制，不受本页面样式影响。

## 设置

打开 DSH 的「设置」，在左侧选择「**光标呼吸灯**」：

| 设置项 | 说明 |
|---|---|
| 将鼠标替换为蓝点 | 关闭后显示系统指针，同时隐藏中心蓝点 |
| 在所有弹层上隐藏 | 默认开启；菜单、下拉列表、对话框、设置面板等全部弹层上恢复系统指针并隐藏效果；关闭后所有弹层上也保持效果 |
| 开启光晕 | 显示/隐藏指针周围的光晕 |
| 光晕大小 | 40–180px |
| 开启闪动 | 光晕是否随时间呼吸 |
| 闪动周期 | 1000–12000ms |
| 开启拖尾 | 是否绘制 Canvas 连续尾线 |
| 拖尾时长 | 80–1200ms 的历史轨迹长度 |

修改会立即应用并通过 `localStorage` 保存在本机，同时提供「恢复默认」按钮。

## 多语言

插件注册了以下语言包和设置页字典：

- 中文（简体）
- English（美国 / 英国）
- Français
- Русский
- 日本語

在 DSH 的 **Settings → General → Language** 中切换语言后，设置页与插件栏目标题会实时更新。`fr`、`ru`、`ja` 是插件通过 Client locale service 注册的外置语言包；DSH 内置文案若没有对应翻译，会按框架的回退规则显示为英文。插件管理中的标题和描述也提供对应的 `locale/*.json` 元数据。

## 可调参数（`client.js` 中的 CSS）

- 品牌色：`.dsh-cursor-halo__core { background }` 与光晕渐变里的 `rgba(77, 107, 254, …)`。
- 光晕大小：`.dsh-cursor-halo__ring { width/height/margin }`（默认 88px）。
- 呼吸速度：`animation: dsh-cursor-halo-breathe 6s ...`。
- 呼吸幅度：`@keyframes dsh-cursor-halo-breathe` 中 `scale(0.7)` 与 `scale(1.12)`。
- 拖尾长度：`TRAIL_LIFETIME_MS` 已移除，运行时读取设置里的「拖尾时长」。
- 拖尾线条：`drawTrail()` 中的渐变 stops、`lineWidth`（18 / 9 / 3.5 / 1.4px）与 `TRAIL_MAX_POINTS`。
- 点击收束：`CLICK_PULSE_MS`（默认 260ms）与 `CLICK_PULSE_SCALE`（默认 0.32）。
- 设置默认值与范围：`DEFAULT_SETTINGS`、`SETTINGS_BOUNDS`。
