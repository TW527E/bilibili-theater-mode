# B站剧场模式

为哔哩哔哩普通投稿视频页面（`/video/*`）添加类 YouTube 剧场模式的油猴脚本。

## 功能

- 开启后隐藏侧边栏与视频标题区，播放器横向铺满屏幕，并自动切换宽屏模式
- 按 **T** 键一键切换剧场模式开关

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. [点击安装脚本](https://raw.githubusercontent.com/astrytk/bilibili-theater-mode/main/bili-theater.user.js)

## 用法

| 操作 | 说明 |
|------|------|
| 按 `T` 键 | 切换剧场模式开关 |
| 油猴菜单 → ✅ 自动深色模式 | 开启剧场模式时是否自动切换深色主题 |
| 油猴菜单 → ✅ 显示悬浮按钮 | 是否在页面右下角显示切换按钮 |

**可调参数**（在脚本顶部手动修改）：

- `VIDEO_RATIO`：播放器高度占视口的比例，默认 `11/13`，可改为 `4/5`等

## 注意事项

- 仅支持普通投稿视频页面（`bilibili.com/video/*`），番剧、直播页面暂不适配
- B 站前端更新后部分选择器可能失效，如遇问题请提 [Issue](https://github.com/astrytk/bilibili-theater-mode/issues)
- 深色模式目前为 B 站内测功能，稳定性由 B 站自身保证

## 免责声明

本脚本仅供个人学习与体验优化使用，不对因使用本脚本导致的任何问题负责。使用本脚本即表示你已了解并接受上述风险。