# Bilibili Theater Mode

[繁體中文](README.md) · [简体中文](README.zh-CN.md) · **English**

A userscript that adds a YouTube-style theater mode to regular videos on Bilibili's desktop website. The player spans the page, with the title, video information, and uploader details below it. Recommendations and comments remain available.

Forked from [astrytk/bilibili-theater-mode](https://github.com/astrytk/bilibili-theater-mode), with subsequent changes maintained by TW527E. Current version: **0.3.5**.

## Installation and updates

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/).
2. [Install Bilibili Theater Mode](https://raw.githubusercontent.com/TW527E/bilibili-theater-mode/main/bili-theater.user.js) and confirm installation in your userscript manager.
3. Reload the Bilibili video page.

If the link displays source code, create a script in your manager, paste the full contents of [bili-theater.user.js](bili-theater.user.js), and save. If you already use the upstream version or a local review copy, update or replace that script and keep only one copy enabled.

This fork retains the original script name and `@namespace` to support updating an existing installation and retaining preferences. Once installed, updates come from TW527E's repository. Installations that still point to upstream need a one-time manual update.

## Features

- **Player control button:** The theater button sits immediately to the left of Bilibili's native wide-screen button and appears with the player controls. Blue indicates that theater mode is enabled.
- **Remembered theater mode:** The next video loads with your last theater-mode preference.
- **Centered danmaku controls:** In theater mode, the viewer count, danmaku controls, and message field form a centered group with a maximum width of 1200px. The background extends to both player edges.
- **Details below the player:** The title, video information, and uploader details appear below the player in both normal and theater modes, including the avatar and follow button.
- **Recommendations preserved:** Recommended videos, the description, interaction buttons, and comments remain available.
- **Lights off during playback:** Uses Bilibili's native lights-off control during playback and restores its previous state on pause or completion. This also works in normal mode.
- **Native mode support:** Clicking the native wide-screen button exits theater mode and saves that preference. Fullscreen, web fullscreen, and mini-player modes temporarily suspend the theater layout; it returns when you return to the page player.
- **Dynamic player support:** Controls are reattached when the player loads late, its controls are rebuilt, or you navigate between videos.

## Controls and settings

| Action | Result |
| --- | --- |
| Click the theater button in the player controls | Enter or exit theater mode |
| Press `T` | Toggle theater mode; ignored while editing text, composing input, holding a modifier, or repeating a key |
| Focus the theater button and press `Enter` or Space | Toggle theater mode |
| Click the native wide-screen button | Exit theater mode and let the native player handle the screen change |
| Player settings → More playback settings → Other settings → 自動關燈 | Toggle lights off during playback, using the same checkbox style as adjacent settings |

The added lights setting is labeled **自動關燈** (“automatic lights off”). It defaults to enabled and inherits the old automatic-dark-mode preference. It does not change the website theme. If lights were already off before playback, they stay off after pausing. The old floating button and userscript-manager settings menu have been removed.

Exiting with the theater button or `T` restores the normal/wide-screen state from before entering theater mode. To adjust player height, edit `VIDEO_RATIO` near the top of the script; the default is `11/13` of the viewport height.

## Scope and compatibility

- Matches `https://www.bilibili.com/video/*` and `https://www.bilibili.com/zh-Hant/video/*`.
- Intended for regular uploads on the desktop player. Series, livestreams, and the mobile site are outside its supported scope. Narrow windows remain subject to Bilibili's native minimum page and control widths.
- Automatic lights off requires the native lights-off control to be available. Changes to Bilibili's player structure may require script updates.
- Preferences are stored by the userscript manager. The script adds no external network requests or data uploads.

Report problems in [Issues](https://github.com/TW527E/bilibili-theater-mode/issues), including the script version, browser, video URL, and steps to reproduce.

## Local tests

No npm dependencies are required. Run from the repository root:

```sh
node --check bili-theater.user.js
node --check tests/player.test.js
python -m http.server 8765 --bind 127.0.0.1
```

Open the [test page](http://127.0.0.1:8765/tests/player.html). Tests run automatically and display their results. Add `?saved=true` to test a saved theater preference, or `?lights=off` to test a disabled legacy lights preference.

The suite currently contains **69 browser assertions** covering mode changes and restoration, native wide-screen interaction, stored preferences, centered danmaku controls, details layout, delayed initialization, player replacement, keyboard shortcuts, and automatic lights off. It uses a fixed player fixture and does not replace compatibility checks on the real Bilibili website.

## License and credits

Released under the [MIT License](LICENSE), retaining the upstream copyright notice. Thanks to [astrytk](https://github.com/astrytk) for the original project.
