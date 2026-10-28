# B 站劇場模式

**繁體中文** · [简体中文](https://github.com/TW527E/bilibili-theater-mode/blob/main/README.zh-CN.md) · [English](https://github.com/TW527E/bilibili-theater-mode/blob/main/README.en.md)

為 Bilibili 桌面版一般投稿影片加入類似 YouTube 的劇場模式。播放器橫向鋪滿，標題、影片資訊與 UP 主資料排列在播放器下方，推薦影片與評論保留。

此版本由 [astrytk/bilibili-theater-mode](https://github.com/astrytk/bilibili-theater-mode) fork，後續修改由 TW527E 維護。目前版本：**0.3.11**。

## 安裝與更新

也可從 [GreasyFork](https://greasyfork.org/scripts/602246) 安裝。GreasyFork 已設定從本儲存庫的 `main` 分支定時自動同步腳本與說明；更新不一定在推送後立即出現。請擇一來源安裝，避免重複啟用。

1. 安裝 [Tampermonkey](https://www.tampermonkey.net/) 等使用者腳本管理器。
2. [安裝 B 站劇場模式](https://raw.githubusercontent.com/TW527E/bilibili-theater-mode/main/bili-theater.user.js)，在腳本管理器中確認安裝。
3. 重新整理 Bilibili 影片頁面。

若連結只顯示程式碼，可在腳本管理器中新增腳本，貼上 [bili-theater.user.js](https://github.com/TW527E/bilibili-theater-mode/blob/main/bili-theater.user.js) 的完整內容後儲存。已安裝上游版或本機審核版時，請更新或替換原有腳本，並確認只啟用一份。

本 fork 保留原腳本的名稱與 `@namespace`，方便原地更新及沿用偏好；安裝本版後，更新來源改為 TW527E 的儲存庫。原先仍指向上游的安裝需要手動更新一次。

## 功能

- **播放器內切換**：劇場按鈕位於原生「寬屏」按鈕左側，隨播放器控制列顯示或隱藏；藍色表示開啟。
- **深色導覽列**：劇場模式將原生 Bilibili 或 Bewly 頂欄與搜尋框改為深色，其他區域保留原本主題；退出後還原。播放時自動關燈仍由原開關獨立控制。
- **記住劇場模式**：下次載入影片會沿用上次的開關狀態。
- **彈幕列置中**：劇場模式下，觀看人數、彈幕控制與發送欄整組置中，內容最大寬度為 1200px；背景延伸至播放器兩側。
- **資訊排列在下方**：一般模式與劇場模式都將影片標題、播放資訊及 UP 主資料放在播放器下方，保留頭像與關注功能。
- **保留推薦內容**：推薦影片、簡介、互動按鈕與評論仍可使用。
- **播放時自動關燈**：利用 B 站原生關燈功能，播放時開啟、暫停或結束時恢復原狀；一般模式也適用。
- **配合原生模式**：手動按寬屏會退出劇場並記住關閉狀態。全螢幕、網頁全螢幕或小窗期間暫停劇場佈局，返回頁面後恢復。
- **支援動態載入**：播放器延遲出現、控制列重建與站內換片時會重新掛載控制項。

## 操作與設定

| 操作 | 效果 |
| --- | --- |
| 點擊控制列中的劇場按鈕 | 開啟或退出劇場模式 |
| 按 `T` | 切換劇場模式；輸入文字、中文組字、組合鍵或長按時不觸發 |
| 聚焦劇場按鈕後按 `Enter` 或空格 | 切換劇場模式 |
| 點擊原生寬屏按鈕 | 退出劇場，交由原生播放器切換畫面 |
| 播放器設定 → 更多播放設置 → 其他設置 → 自動關燈 | 開關播放時自動關燈；使用與同層選項一致的勾選框 |

自動關燈預設開啟，並沿用舊版「自動深色模式」的開關偏好。它不切換網站主題；若播放前已手動關燈，暫停後仍維持關燈。舊版懸浮按鈕與腳本管理器中的設定選單已移除。

透過劇場按鈕或 `T` 退出時，會還原進入前的一般／寬屏狀態。播放器高度比例可修改腳本頂部的 `VIDEO_RATIO`，預設為視窗高度的 `11/13`。

## Bewly 頂欄相容性

已針對 [BewlyBewly-AveMujica](https://github.com/VentusUta/BewlyBewly-AveMujica) 與 [BewlyCat](https://github.com/keleus/BewlyCat) 驗證。劇場模式沿用已安裝版本的深色變數、陰影、磨砂效果與主題色，只套用在頂欄及其選單，不啟用全站深色。未安裝 Bewly 時，原生 Bilibili 頂欄仍可獨立運作。

主題漸層跟隨原生「在頂欄顯示主題色漸變」開關：Bewly 位於「桌面和 Dock 欄」，BewlyCat 位於「Bewly 元件 → 頂欄」。

- 首次使用請在影片頁打開一次該設定面板，讓腳本讀取實際值；尚未讀到設定時不顯示自訂漸層。
- 在同一頁切換開關會立即同步，並由腳本管理器記住最後讀到的值。
- 漸層只出現在劇場頂欄，離開頁首後收起。BewlyCat 保留新版白色圖示條件，實驗毛玻璃樣式沿用較深的主題色漸層；全站深色時交回擴充功能自己處理。
- Bewly 與 BewlyCat 目前都未提供此偏好的頁面公開介面，因此其他分頁的變更不保證自動同步。重新打開本頁設定面板即可重新讀取；未來設定文字或結構變更可能需要重新適配。

## 適用範圍

- 支援 `https://www.bilibili.com/video/*` 與 `https://www.bilibili.com/zh-Hant/video/*`。
- 針對桌面版一般投稿播放器；番劇、直播與行動版不在適配範圍內。窄視窗仍受 B 站原生頁面與控制列的最小寬度限制。
- 自動關燈需要頁面提供原生關燈控制項。B 站更新播放器結構後可能需要重新適配。
- 偏好儲存在腳本管理器內；本腳本不新增外部網路請求或資料上傳。

遇到問題可至 [Issues](https://github.com/TW527E/bilibili-theater-mode/issues) 附上腳本版本、瀏覽器、影片網址與重現步驟。

## 本機測試

不需安裝 npm 依賴。在專案根目錄執行：

```sh
node --check bili-theater.user.js
node --check tests/player.test.js
python -m http.server 8765 --bind 127.0.0.1
```

開啟 [測試頁](http://127.0.0.1:8765/tests/player.html)；測試會自動執行並顯示結果。可加上 `?saved=true` 檢查已儲存的劇場偏好，或 `?lights=off` 檢查舊版關燈偏好為關閉的情況。

也可加上 `?gradient=on` 或 `?gradient=off` 檢查已儲存的 Bewly 漸層偏好；使用 `?bewly=cat` 測試 BewlyCat，參數可用 `&` 組合。

原版 Bewly 包含 **118 項瀏覽器斷言**，BewlyCat 包含 **124 項**，涵蓋模式切換與還原、寬屏互動、偏好儲存、彈幕列置中、資訊排列、延遲初始化、換片、快捷鍵、自動關燈、原生與 Bewly 頂欄主題、主題漸層及設定面板同步；另檢查 BewlyCat 遮罩、自訂深色基底及設定面板定位。測試使用固定的播放器模擬頁；它不能取代實際 Bilibili 環境的相容性檢查。

## 授權與致謝

採用 [MIT License](https://github.com/TW527E/bilibili-theater-mode/blob/main/LICENSE)，保留上游著作權聲明。感謝 [astrytk](https://github.com/astrytk) 提供原始專案。
