# DeepSeek 光标呼吸灯 / DeepSeek Cursor Halo

<p align="center">
  <img src="./icon.svg" width="88" height="88" alt="DeepSeek Cursor Halo icon">
</p>

一个跟随鼠标的 DSH Web 光标特效插件：把系统指针换成 DeepSeek 蓝色圆点，并绘制无缝呼吸光晕、连续 Canvas 拖尾和点击收束效果；进入菜单/对话框时可以选择恢复系统指针。

支持 **中文、English（美国 / 英国）、Français、Русский、日本語**。

## 特性

- **实心蓝点**：`#4d6bfe` DeepSeek 蓝，12px 圆点，始终位于光晕上方。
- **无缝呼吸光晕**：径向渐变从中心向外渐隐，默认 88px，6 秒呼吸周期。
- **连续拖尾**：Canvas 绘制的一条连续渐变线，沿最近约 0.32 秒的指针轨迹平滑延伸。
- **点击收束**：按下左键时光晕向内收一下再回弹，核心蓝点保持不动。
- **弹层保护**：默认在菜单、下拉列表、对话框和设置面板上隐藏效果并恢复系统指针；可在设置中关闭，让效果在全部弹层上保持。
- **实时设置**：拖尾开关/时长、光晕开关/大小、闪动开关/周期、是否替换蓝点、是否在弹层上隐藏。
- **多语言**：设置页与设置栏目跟随 DSH 当前语言实时切换。
- **始终置顶**：挂载在 `document.body` 的最高层级，`pointer-events: none`，不拦截任何鼠标操作。
- **轻量隐私**：无网络请求、无 Host 工具、无 shell 调用；设置只写入浏览器 `localStorage`。

## 安装

### 从插件市场安装

插件收录到 **DSHMARKET / DSH 插件市场**后，在 DSH 中打开：

**设置 → 插件市场**，搜索 **Cursor Halo** 并安装。

安装完成后移动鼠标即可看到效果；设置页位于 **设置 → 光标呼吸灯**。

### 从本地目录安装（开发）

1. 将本仓库/目录放到本机。
2. 在 DSH 插件管理器中选择安装本地 bundle，目标指向本目录。
3. 本插件不需要构建步骤，`client.js` 已经是可直接加载的浏览器模块。

安装后客户端由 DSH 的 HMR 自动加载；修改 `client.js` 后刷新页面或等待热更新。

## 设置项

| 设置 | 说明 | 默认 |
|---|---|---|
| 将鼠标替换为蓝点 | 关闭后显示系统指针，同时隐藏蓝点 | 开 |
| 在所有弹层上隐藏 | 菜单、下拉列表、对话框、设置面板上隐藏效果并恢复系统指针 | 开 |
| 开启光晕 | 显示/隐藏光晕 | 开 |
| 光晕大小 | 40–180px | 88px |
| 开启闪动 | 光晕是否随时间呼吸 | 开 |
| 闪动周期 | 1000–12000ms | 6000ms |
| 开启拖尾 | 是否绘制连续尾线 | 开 |
| 拖尾时长 | 80–1200ms 的历史轨迹长度 | 320ms |

所有设置实时生效并自动保存到本机；设置页提供「恢复默认」。

## 多语言

插件注册以下语言包和设置页字典：

| 语言 | 标识 |
|---|---|
| 中文（简体） | `zh` |
| English（美国 / 英国） | `en` |
| Français | `fr` |
| Русский | `ru` |
| 日本語 | `ja` |

在 **Settings → General → Language** 中切换后，设置页与栏目名实时刷新。`fr`、`ru`、`ja` 是插件通过 Client locale service 注册的外置语言包；DSH 内置文案若没有对应翻译，会按框架回退规则显示英文。

## 兼容性

- 已在 **DSH 0.2.1-rc.2（DSH Desktop Next）** 测试。
- `package.json` 声明 `engines.dsh: ">=0.2.1-rc.2"`。
- Web 端插件，无需 Node 构建步骤；无 Host 侧权限。
- 指针离开 DSH 页面、窗口失焦或页面隐藏时会恢复系统指针；iframe 内部指针不受本插件控制。

## 文件结构

| 文件 | 作用 |
|---|---|
| `package.json` | Bundle 清单、`dsh.bundle.patch`、`dsh.client` 与兼容性声明 |
| `cordis.patch.yml` | 插入 `dsh-cursor-halo` 插件行 |
| `index.js` | Host 半边（无能力，仅占位） |
| `client.js` | Client 半边：`shell.overlay` 槽位、设置页、i18n 字典、Canvas 拖尾与 CSS |
| `locale/*.json` | 插件管理器标题与描述：`en`、`zh`、`fr`、`ru`、`ja` |
| `icon.svg` | 插件图标 |
| `LICENSE` | MIT 许可证 |

## 开发

```text
client.js   # 浏览器端唯一实现，修改后由 DSH HMR 重新加载
index.js    # Host 占位入口
```

无 npm 运行时依赖；React / ReactDOM 使用 DSH 客户端模块表提供。

## 许可

[Apache License 2.0](./LICENSE)

---

## English summary

DeepSeek Cursor Halo is a DSH web plugin that replaces the native pointer with a DeepSeek-blue dot and draws a seamless breathing halo, continuous canvas trail, and click-snap effect. Menus and dialogs can restore the native pointer; every effect is configurable from **Settings → Cursor Halo**. The UI is localized in English, Chinese, French, Russian, and Japanese.

Install from **Settings → Plugin Market** once listed, or install this directory as a local bundle for development. No network access, shell commands, or host-side tools are used; settings persist in browser `localStorage`. Licensed under MIT.
