// ==UserScript==
// @name         B站剧场模式
// @name:zh-CN   B站剧场模式
// @namespace    https://github.com/astrytk/bilibili-theater-mode
// @version      0.0.1
// @description  为B站普通投稿视频添加类YouTube剧场模式。按 T 键切换，或通过油猴菜单配置选项。
// @description:zh-CN  为B站普通投稿视频添加类YouTube剧场模式。按 T 键切换，或通过油猴菜单配置选项。
// @author       astrytk
// @match        https://www.bilibili.com/video/*
// @license      MIT
// @homepageURL  https://github.com/astrytk/bilibili-theater-mode
// @supportURL   https://github.com/astrytk/bilibili-theater-mode/issues
// @updateURL    https://raw.githubusercontent.com/astrytk/bilibili-theater-mode/main/bili-theater.user.js
// @downloadURL  https://raw.githubusercontent.com/astrytk/bilibili-theater-mode/main/bili-theater.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

// ─── 用户可调参数 ──────────────────────────────────────────────────────────────
//
//  VIDEO_RATIO   播放器区域占视口（去掉顶栏后）高度的比例
//                默认 11/13 可按喜好调小（如 4/5）让播放器矮一些
//
// ──────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const VIDEO_RATIO = 11 / 13;  // 可调：播放器高度占可用视口的比例（如 4/5 等）
  const STYLE_ID    = 'bili-theater-style';
  const BTN_ID      = 'bili-theater-btn';
  const TOAST_ID    = 'bili-theater-toast';
  const THEME_MAP   = 'https://s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/';

  // ─── 用户配置（持久化） ────────────────────────────────────────────────────────
  let prefDarkMode = GM_getValue('darkMode', true);   // 是否自动开启深色模式
  let prefShowBtn  = GM_getValue('showBtn',  false);  // 是否显示悬浮按钮

  let theaterOn     = false;
  let originalTheme = null;

  // ─── 基础样式（Toast + 按钮） ─────────────────────────────────────────────────
  GM_addStyle(`
    #${TOAST_ID} {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      padding: 8px 20px;
      border-radius: 20px;
      background: rgba(0,0,0,0.75);
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #${TOAST_ID}.show {
      opacity: 1;
    }

    #${BTN_ID} {
      position: fixed;
      bottom: 80px;
      right: 24px;
      z-index: 99999;
      padding: 6px 14px;
      border-radius: 20px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      background: #00aeec;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: background 0.2s, transform 0.1s;
      user-select: none;
    }
    #${BTN_ID}:hover  { background: #0099cc; }
    #${BTN_ID}.active { background: #444;    }
    #${BTN_ID}:active { transform: scale(0.95); }
  `);

  // ─── Toast 提示 ───────────────────────────────────────────────────────────────
  let toastTimer = null;

  function showToast(msg) {
    let el = document.getElementById(TOAST_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOAST_ID;
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  // ─── 主题控制 ─────────────────────────────────────────────────────────────────
  function getCurrentTheme() {
    const map = document.getElementById('__css-map__');
    return map?.href.includes('dark') ? 'dark' : 'light';
  }

  function switchTheme(theme) {
    const map = document.getElementById('__css-map__');
    if (!map) return;
    map.href = `${THEME_MAP}${theme}.css`;
    document.documentElement.classList.toggle('night-mode', theme === 'dark');
  }

  // ─── 生成剧场模式 CSS ──────────────────────────────────────────────────────────
  function buildCSS() {
    const vh         = window.innerHeight;
    const videoAreaH = Math.floor(vh * VIDEO_RATIO);

    return `
      /* ── 1. 隐藏：视频标题栏、右侧栏、底部占位元素 ── */
      #viewbox_report,
      .right-container,
      #bilibili-player-placeholder-bottom-left,
      #bilibili-player-placeholder-bottom-right {
        display: none !important;
      }

      /* ── 2. 主布局容器满宽 ── */
      .video-container-v1 {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* ── 3. left-container 满宽铺开 ── */
      .left-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        flex: none !important;
      }

      /* ── 4. playerWrap：全宽，背景透明让页面深色背景透出 ── */
      #playerWrap,
      .player-wrap {
        width: 100% !important;
        height: ${videoAreaH}px !important;
        max-height: ${videoAreaH}px !important;
        background: transparent !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* ── 5. #bilibili-player：全宽撑满，比例交给B站宽屏模式处理 ── */
      #bilibili-player {
        width: 100% !important;
        height: ${videoAreaH}px !important;
        flex-shrink: 0 !important;
        background: transparent !important;
      }

      /* ── 6. bpx 容器跟随父级尺寸，去掉辉光，背景透明（小窗时跳过尺寸覆盖） ── */
      .bpx-player-container:not([data-screen="mini"]) {
        width: 100% !important;
        height: 100% !important;
        background: transparent !important;
      }
      /* ── 7. primary-area 撑满播放器（小窗时跳过） ── */
      .bpx-player-container:not([data-screen="mini"]) .bpx-player-primary-area {
        width: 100% !important;
        height: 100% !important;
      }

      /* ── 8. 视频画面区域（小窗时跳过） ── */
      .bpx-player-container:not([data-screen="mini"]) .bpx-player-video-area {
        width: 100% !important;
        height: 100% !important;
      }

      .bpx-player-container:not([data-screen="mini"]) video {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        background: #000 !important;
      }

      /* ── 9. 弹幕发送栏跟随播放器宽度（小窗时跳过） ── */
      .bpx-player-container:not([data-screen="mini"]) .bpx-player-sending-area {
        width: 100% !important;
        background: transparent !important;
      }
      .bpx-player-container:not([data-screen="mini"]) .bpx-player-sending-bar {
        width: 100% !important;
        box-sizing: border-box !important;
      }

      /* ── 10. 播放器下方内容居中 ── */
      #arc_toolbar_report,
      #v_desc,
      .video-tag-container,
      .activity-m-v1,
      .ad-report,
      #commentapp {
        max-width: 1200px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding-left: 24px !important;
        padding-right: 24px !important;
        box-sizing: border-box !important;
      }
    `;
  }

  // ─── 宽屏模式控制 ─────────────────────────────────────────────────────────────
  function getScreenState() {
    const container = document.querySelector('.bpx-player-container');
    return container ? container.getAttribute('data-screen') : null;
  }

  function clickWidescreenBtn() {
    const btn = document.querySelector('.bpx-player-ctrl-wide');
    if (btn) { btn.click(); return true; }
    return false;
  }

  function enterWidescreen() {
    if (getScreenState() === 'wide') return;
    if (!clickWidescreenBtn()) {
      const timer = setInterval(() => {
        if (getScreenState() === 'wide') { clearInterval(timer); return; }
        if (clickWidescreenBtn()) clearInterval(timer);
      }, 300);
      setTimeout(() => clearInterval(timer), 5000);
    }
  }

  function exitWidescreen() {
    if (getScreenState() !== 'wide') return;
    clickWidescreenBtn();
  }

  // ─── 开启剧场模式 ─────────────────────────────────────────────────────────────
  function enableTheater() {
    originalTheme = getCurrentTheme();
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = buildCSS();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    enterWidescreen();
    if (prefDarkMode) switchTheme('dark');
  }

  // ─── 关闭剧场模式 ─────────────────────────────────────────────────────────────
  function disableTheater() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
    exitWidescreen();
    if (prefDarkMode && originalTheme) {
      switchTheme(originalTheme);
      originalTheme = null;
    }
  }

  // ─── 切换 ─────────────────────────────────────────────────────────────────────
  function toggleTheater() {
    theaterOn = !theaterOn;
    const btn = document.getElementById(BTN_ID);
    if (theaterOn) {
      enableTheater();
      showToast('📽 剧场模式已开启（T 键退出）');
      if (btn) { btn.textContent = '📽 退出剧场'; btn.classList.add('active'); }
    } else {
      disableTheater();
      showToast('📽 剧场模式已关闭');
      if (btn) { btn.textContent = '📽 剧场模式'; btn.classList.remove('active'); }
    }
  }

  // ─── 快捷键：T 键切换（输入框内不触发） ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key !== 't' && e.key !== 'T') return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) return;
    toggleTheater();
  });

  // ─── 窗口缩放时重新计算 ───────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    if (theaterOn) {
      const el = document.getElementById(STYLE_ID);
      if (el) el.textContent = buildCSS();
    }
  });

  // ─── 油猴菜单配置项 ───────────────────────────────────────────────────────────
  // 用固定 id 注册，重复调用时 Tampermonkey 会原地更新标题而不是新增条目
  function registerMenus() {
    GM_registerMenuCommand(
      (prefDarkMode ? '✅' : '⬜') + ' 自动深色模式',
      () => {
        prefDarkMode = !prefDarkMode;
        GM_setValue('darkMode', prefDarkMode);
        showToast('自动深色模式：' + (prefDarkMode ? '已开启' : '已关闭'));
        registerMenus();
      },
      { id: 'menu-darkmode' }
    );
    GM_registerMenuCommand(
      (prefShowBtn ? '✅' : '⬜') + ' 显示悬浮按钮',
      () => {
        prefShowBtn = !prefShowBtn;
        GM_setValue('showBtn', prefShowBtn);
        updateBtnVisibility();
        showToast('悬浮按钮：' + (prefShowBtn ? '已显示' : '已隐藏'));
        registerMenus();
      },
      { id: 'menu-showbtn' }
    );
  }

  // ─── 悬浮按钮显示控制 ─────────────────────────────────────────────────────────
  function updateBtnVisibility() {
    const btn = document.getElementById(BTN_ID);
    if (!btn) return;
    btn.style.display = prefShowBtn ? '' : 'none';
  }

  // ─── 挂载按钮 ─────────────────────────────────────────────────────────────────
  function mountButton() {
    if (document.getElementById(BTN_ID)) return;
    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.textContent = '📽 剧场模式';
    btn.addEventListener('click', toggleTheater);
    document.body.appendChild(btn);
    updateBtnVisibility();
  }

  registerMenus();
  setTimeout(mountButton, 800);

})();