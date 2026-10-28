# B 站剧场模式

[繁體中文](https://github.com/TW527E/bilibili-theater-mode/blob/main/README.md) · **简体中文** · [English](https://github.com/TW527E/bilibili-theater-mode/blob/main/README.en.md)

为 Bilibili 桌面版普通投稿视频加入类似 YouTube 的剧场模式。播放器横向铺满，标题、视频信息与 UP 主资料排列在播放器下方，推荐视频与评论保留。

此版本 fork 自 [astrytk/bilibili-theater-mode](https://github.com/astrytk/bilibili-theater-mode)，后续修改由 TW527E 维护。当前版本：**0.3.11**。

## 安装与更新

也可从 [GreasyFork](https://greasyfork.org/scripts/602246) 安装。GreasyFork 已设置从本仓库的 `main` 分支定时自动同步脚本与说明；更新不一定在推送后立即出现。请选择一个来源安装，避免重复启用。

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 等用户脚本管理器。
2. [安装 B 站剧场模式](https://raw.githubusercontent.com/TW527E/bilibili-theater-mode/main/bili-theater.user.js)，在脚本管理器中确认安装。
3. 刷新 Bilibili 视频页面。

如果链接只显示代码，可在脚本管理器中新建脚本，粘贴 [bili-theater.user.js](https://github.com/TW527E/bilibili-theater-mode/blob/main/bili-theater.user.js) 的完整内容并保存。已安装上游版或本地审核版时，请更新或替换原有脚本，并确认只启用一份。

本 fork 保留原脚本的名称与 `@namespace`，便于原地更新并沿用偏好；安装本版后，更新来源改为 TW527E 的仓库。原先仍指向上游的安装需要手动更新一次。

## 功能

- **播放器内切换**：剧场按钮位于原生“宽屏”按钮左侧，随播放器控制栏显示或隐藏；蓝色表示开启。
- **深色导航栏**：剧场模式将原生 Bilibili 或 Bewly 顶栏与搜索框改为深色，其他区域保留原有主题；退出后还原。播放时自动关灯仍由原开关独立控制。
- **记住剧场模式**：下次加载视频会沿用上次的开关状态。
- **弹幕栏居中**：剧场模式下，观看人数、弹幕控制与发送栏整组居中，内容最大宽度为 1200px；背景延伸至播放器两侧。
- **信息排列在下方**：普通模式与剧场模式都将视频标题、播放信息及 UP 主资料放在播放器下方，保留头像与关注功能。
- **保留推荐内容**：推荐视频、简介、互动按钮与评论仍可使用。
- **播放时自动关灯**：利用 B 站原生关灯功能，播放时开启、暂停或结束时恢复原状；普通模式也适用。
- **配合原生模式**：手动按宽屏会退出剧场并记住关闭状态。全屏、网页全屏或小窗期间暂停剧场布局，返回页面后恢复。
- **支持动态加载**：播放器延迟出现、控制栏重建与站内换片时会重新挂载控件。

## 操作与设置

| 操作 | 效果 |
| --- | --- |
| 点击控制栏中的剧场按钮 | 开启或退出剧场模式 |
| 按 `T` | 切换剧场模式；输入文字、中文组字、组合键或长按时不触发 |
| 聚焦剧场按钮后按 `Enter` 或空格 | 切换剧场模式 |
| 点击原生宽屏按钮 | 退出剧场，交由原生播放器切换画面 |
| 播放器设置 → 更多播放设置 → 其他设置 → 自動關燈 | 开关播放时自动关灯；使用与同层选项一致的复选框 |

自动关灯默认开启，并沿用旧版“自动深色模式”的开关偏好。它不切换网站主题；如果播放前已手动关灯，暂停后仍保持关灯。新增选项的实际标签是繁体“自動關燈”。旧版悬浮按钮与脚本管理器中的设置菜单已移除。

通过剧场按钮或 `T` 退出时，会还原进入前的普通／宽屏状态。播放器高度比例可修改脚本顶部的 `VIDEO_RATIO`，默认为窗口高度的 `11/13`。

## Bewly 顶栏兼容性

已针对 [BewlyBewly-AveMujica](https://github.com/VentusUta/BewlyBewly-AveMujica) 与 [BewlyCat](https://github.com/keleus/BewlyCat) 验证。剧场模式沿用已安装版本的深色变量、阴影、磨砂效果与主题色，只应用于顶栏及其菜单，不启用全站深色。未安装 Bewly 时，原生 Bilibili 顶栏仍可独立工作。

主题渐变跟随原生“在顶栏显示主题色渐变”开关：Bewly 位于“桌面和 Dock 栏”，BewlyCat 位于“Bewly 组件 → 顶栏”。

- 首次使用请在视频页打开一次该设置面板，让脚本读取实际值；尚未读取设置时不显示自定义渐变。
- 在同一页切换开关会立即同步，并由脚本管理器记住最后读取的值。
- 渐变仅显示在剧场顶栏，离开页首后收起。BewlyCat 保留新版白色图标条件，实验毛玻璃样式沿用较深的主题色渐变；全站深色时交回扩展自己处理。
- Bewly 与 BewlyCat 目前都未提供此偏好的页面公开接口，因此其他标签页的变更不保证自动同步。重新打开本页设置面板即可重新读取；未来设置文字或结构变更可能需要重新适配。

## 适用范围

- 支持 `https://www.bilibili.com/video/*` 与 `https://www.bilibili.com/zh-Hant/video/*`。
- 针对桌面版普通投稿播放器；番剧、直播与移动版不在适配范围内。窄窗口仍受 B 站原生页面与控制栏的最小宽度限制。
- 自动关灯需要页面提供原生关灯控件。B 站更新播放器结构后可能需要重新适配。
- 偏好保存在脚本管理器内；本脚本不新增外部网络请求或数据上传。

遇到问题可到 [Issues](https://github.com/TW527E/bilibili-theater-mode/issues) 附上脚本版本、浏览器、视频网址与复现步骤。

## 本地测试

无需安装 npm 依赖。在项目根目录执行：

```sh
node --check bili-theater.user.js
node --check tests/player.test.js
python -m http.server 8765 --bind 127.0.0.1
```

打开 [测试页](http://127.0.0.1:8765/tests/player.html)；测试会自动执行并显示结果。可添加 `?saved=true` 检查已保存的剧场偏好，或 `?lights=off` 检查旧版关灯偏好为关闭的情况。

也可添加 `?gradient=on` 或 `?gradient=off` 检查已保存的 Bewly 渐变偏好；使用 `?bewly=cat` 测试 BewlyCat，参数可用 `&` 组合。

原版 Bewly 包含 **118 项浏览器断言**，BewlyCat 包含 **124 项**，覆盖模式切换与还原、宽屏交互、偏好保存、弹幕栏居中、信息排列、延迟初始化、换片、快捷键、自动关灯、原生与 Bewly 顶栏主题、主题渐变及设置面板同步；另检查 BewlyCat 遮罩、自定义深色基底及设置面板定位。测试使用固定的播放器模拟页，不能替代实际 Bilibili 环境的兼容性检查。

## 许可与致谢

采用 [MIT License](https://github.com/TW527E/bilibili-theater-mode/blob/main/LICENSE)，保留上游版权声明。感谢 [astrytk](https://github.com/astrytk) 提供原始项目。
