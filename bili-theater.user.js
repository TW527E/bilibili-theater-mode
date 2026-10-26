// ==UserScript==
// @name         B站剧场模式
// @name:zh-CN   B站剧场模式
// @namespace    https://github.com/astrytk/bilibili-theater-mode
// @version      0.3.10
// @description  为B站普通投稿视频添加类YouTube剧场模式。点击播放器控制栏的剧场按钮或按 T 键切换。
// @description:zh-CN  为B站普通投稿视频添加类YouTube剧场模式。点击播放器控制栏的剧场按钮或按 T 键切换。
// @author       astrytk, TW527E
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/zh-Hant/video/*
// @license      MIT
// @homepageURL  https://github.com/TW527E/bilibili-theater-mode
// @supportURL   https://github.com/TW527E/bilibili-theater-mode/issues
// @updateURL    https://raw.githubusercontent.com/TW527E/bilibili-theater-mode/main/bili-theater.user.js
// @downloadURL  https://raw.githubusercontent.com/TW527E/bilibili-theater-mode/main/bili-theater.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const VIDEO_RATIO = 11 / 13; // 播放器高度占视口的比例，可改为 4/5 等。
  const BTN_ID = 'bili-theater-btn';
  let autoLights = GM_getValue('autoLights', GM_getValue('darkMode', true)) === true;
  let theaterOn = GM_getValue('theaterOn', false) === true;
  let player = null;
  let changedWide = false;
  let enteringWide = false;
  let video = null;
  let lightControl = null;
  let originalLight = null;

  GM_addStyle(`
    .bili-details-layout { position: relative !important; }
    .bili-details-layout .left-container,
    .bili-details-layout .right-container,
    .bili-details-layout .right-container-inner {
      position: static !important;
    }
    .bili-details-layout .left-container { display: flex; flex-direction: column; }
    .bili-details-layout .left-container > * { flex-shrink: 0; }
    .bili-details-layout #playerWrap { order: -2; }
    .bili-details-layout #viewbox_report {
      order: -1;
      height: auto !important;
      padding: 20px 0 0 !important;
      margin-bottom: calc(var(--bili-up-height, 0px) + 32px) !important;
    }
    .bili-details-layout .up-panel-container {
      position: absolute !important;
      top: var(--bili-up-top);
      left: var(--bili-up-left);
      width: var(--bili-up-width) !important;
      margin: 0 !important;
    }
    .bili-details-layout .up-panel-container .up-info--right {
      flex: 1;
      min-width: 0;
    }
    #bili-theater-auto-lights:focus-within { outline: 2px solid #fff; outline-offset: 2px; }
    .bpx-player-ctrl-setting-menu-right:has(#bili-theater-auto-lights),
    .bui-panel-item:has(> .bpx-player-ctrl-setting-menu-right #bili-theater-auto-lights) {
      height: auto !important;
      align-self: flex-start;
    }
    .bui-panel-wrap:has(.bui-panel-item-active #bili-theater-auto-lights) {
      height: var(--bili-settings-height) !important;
    }
    #${BTN_ID} {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 36px;
      width: 36px;
      height: 22px;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }
    #${BTN_ID} svg {
      width: 24px;
      height: 24px;
      pointer-events: none;
      transition: transform 120ms ease;
    }
    #${BTN_ID}:hover,
    #${BTN_ID}[aria-pressed="true"] { color: #00aeec; }
    #${BTN_ID}:active svg { transform: scale(.9); }
    #${BTN_ID}:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
    .bpx-player-control-bottom:has(#${BTN_ID}:focus-visible),
    .bpx-player-control-wrap:has(#${BTN_ID}:focus-visible) .bpx-player-control-mask {
      opacity: 1 !important;
    }
    #${BTN_ID} .bili-theater-fill { opacity: 0; }
    #${BTN_ID}[aria-pressed="true"] .bili-theater-fill { opacity: 1; }
    #${BTN_ID} .bili-theater-tooltip {
      position: absolute;
      bottom: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      padding: 6px 8px;
      background: #181818;
      color: #fff;
      font: 12px/1.5 sans-serif;
      white-space: nowrap;
      pointer-events: none;
      visibility: hidden;
    }
    #${BTN_ID}:hover .bili-theater-tooltip,
    #${BTN_ID}:focus-visible .bili-theater-tooltip { visibility: visible; }
    .bpx-player-container:not([data-screen="normal"]):not([data-screen="wide"]) #${BTN_ID} {
      display: none;
    }
    @media (prefers-reduced-motion: reduce) {
      #${BTN_ID} svg { transition: none; }
    }
  `);

  const theaterStyle = document.createElement('style');
  theaterStyle.id = 'bili-theater-style';
  theaterStyle.disabled = true;
  document.head.append(theaterStyle);

  const BEWLY_HEADER = '#bewly-wrapper header:has(> main[h="$bew-top-bar-height"])';
  const bewlyStyle = document.createElement('style');
  bewlyStyle.id = 'bili-theater-bewly-style';
  const bewlyPageStyle = document.createElement('style');
  bewlyPageStyle.id = 'bili-theater-bewly-page-style';
  document.head.append(bewlyPageStyle);
  let bewlyRoot = null;
  let bewlyGradient = GM_getValue('bewlyThemeGradient', null);
  const darkHeaders = new Set();
  const bewlyObserver = new MutationObserver(syncBewly);
  const reloadBewlyTheme = ({ target }) => {
    if (!target.matches?.('link[rel="stylesheet"]')) return;
    bewlyStyle.textContent = '';
    syncBewly();
  };

  function syncBewlyGradient() {
    if (!bewlyRoot) return;
    // shortcut: 只读取本页设置面板，扩展公开接口后再同步其他分页的变更。
    const row = [...bewlyRoot.querySelectorAll('.b-settings-item')].find(item =>
      /^(在顶栏显示主题色渐变|在頂欄顯示主題色漸變|Show theme color gradient in top bar|喺頂部欄顯示主題色漸變)/.test(item.querySelector('.left-content > div')?.textContent.trim()));
    const control = row?.querySelector('.right-content input[type="checkbox"]');
    if (control && control.checked !== bewlyGradient) {
      bewlyGradient = control.checked;
      GM_setValue('bewlyThemeGradient', bewlyGradient);
    }
    bewlyRoot.host.toggleAttribute('data-bili-theater-gradient', bewlyGradient === true);
  }

  function syncBewly() {
    const root = document.getElementById('bewly')?.shadowRoot;
    if (root !== bewlyRoot) {
      bewlyObserver.disconnect();
      bewlyRoot?.removeEventListener('load', reloadBewlyTheme, true);
      bewlyRoot?.removeEventListener('change', syncBewlyGradient);
      bewlyRoot = root;
      bewlyStyle.textContent = '';
      if (root) {
        root.append(bewlyStyle);
        bewlyObserver.observe(root, { childList: true, subtree: true });
        root.addEventListener('load', reloadBewlyTheme, true);
        root.addEventListener('change', syncBewlyGradient);
      }
    }
    syncBewlyGradient();
    if (root && !bewlyStyle.textContent) {
      let css = '';
      // 复用已安装版本的深色变量及外观选项，保留原生阴影、磨砂和用户主题色。
      for (const sheet of root.styleSheets) {
        let rules;
        try { rules = sheet.cssRules; } catch { continue; }
        for (const rule of rules) {
          const host = rule.selectorText?.match(/:host\(#bewly((?:\.[\w-]+)+)\)/);
          if (!host) continue;
          const options = host[1].replace(/\.dark\b/g, '');
          css += `:is(:host(#bewly${options}), :root${options}) :is(.bili-header, ${BEWLY_HEADER}) {${rule.style.cssText}}\n`;
        }
      }
      if (css) {
        // 局部深色时补上原本由全站深色背景提供的底色，避免透明顶栏透出白色。
        css += `:is(.bili-header, ${BEWLY_HEADER}) { color: var(--bew-text-1); background: var(--bew-bg); }`;
        // 使用原生滚动遮罩判断是否在页首；全站深色时保留 Bewly 自己的渐层。
        css += `
          :host(#bewly[data-bili-theater-gradient]:not(.dark)) ${BEWLY_HEADER}:not(.force-white-icon):not(:has(> main > [style*="mask-image"]))::after {
            content: "";
            position: absolute;
            inset: 0 0 auto;
            height: var(--bew-top-bar-height);
            z-index: 0;
            pointer-events: none;
            background: linear-gradient(to bottom, var(--bew-theme-color-10), transparent);
          }
        `;
        bewlyStyle.textContent = css;
        bewlyPageStyle.textContent = css;
      }
    }
    const enabled = !!root && !!bewlyStyle.textContent && !theaterStyle.disabled;
    bewlyStyle.disabled = bewlyPageStyle.disabled = !enabled;
    const headers = enabled ? [root.querySelector(BEWLY_HEADER), document.querySelector('.bili-header')].filter(Boolean) : [];
    for (const header of darkHeaders) {
      if (!headers.includes(header)) { header.classList.remove('dark'); darkHeaders.delete(header); }
    }
    for (const header of headers) {
      bewlyObserver.observe(header, { attributes: true, attributeFilter: ['class'] });
      if (!header.classList.contains('dark')) { header.classList.add('dark'); darkHeaders.add(header); }
    }
  }

  function updateLayout() {
    const height = Math.floor(window.innerHeight * VIDEO_RATIO);
    const width = Math.max(document.documentElement.clientWidth, document.getElementById('app')?.clientWidth || 0);
    const contentWidth = Math.min(1200, width - 48);
    theaterStyle.textContent = `
      .bili-header {
        --bg1: #18191c;
        --bg2: #232528;
        --bg3: #2f3134;
        --bg1_float: #232528;
        --bg2_float: #2f3134;
        --bg3_float: #36383c;
        --text1: #f1f2f3;
        --text2: #c9ccd0;
        --text3: #a2a7ae;
        --text4: #61666d;
        --line_regular: #3b3d42;
        --line_light: #2f3134;
        --graph_bg_thin: #232528;
        --graph_bg_regular: #2f3134;
        --graph_bg_thick: #3b3d42;
        --graph_icon: #c9ccd0;
      }
      #bilibili-player-placeholder-bottom-left,
      #bilibili-player-placeholder-bottom-right { display: none !important; }

      .video-container-v1 {
        display: flex !important;
        align-items: flex-start !important;
        width: ${contentWidth}px !important;
        max-width: 100% !important;
        gap: 24px !important;
        padding: 0 !important;
        margin: 0 auto !important;
      }
      .left-container {
        width: calc(100% - 374px) !important;
        min-width: 0 !important;
        margin: 0 !important;
        flex: 1 !important;
      }
      .right-container {
        width: 350px !important;
        flex: 0 0 350px !important;
        margin: ${height + 20}px 0 0 !important;
      }
      .right-container .danmaku-box { margin-top: 0 !important; }
      #playerWrap, .player-wrap {
        width: ${width}px !important;
        height: ${height}px !important;
        max-height: none !important;
        padding: 0 !important;
        margin: 0 0 0 -${(width - contentWidth) / 2}px !important;
        background: #000 !important;
      }
      #bilibili-player {
        width: 100% !important;
        height: 100% !important;
      }
      .bpx-player-container {
        width: 100% !important;
        height: 100% !important;
        background: #000 !important;
      }
      .bpx-player-primary-area {
        width: 100% !important;
        height: 100% !important;
      }
      .bpx-player-video-area, .bpx-player-video-wrap, .bpx-player-video-area video {
        width: 100% !important;
        height: 100% !important;
      }
      .bpx-player-video-area video { object-fit: contain !important; }
      .bpx-player-sending-area, .bpx-player-sending-bar {
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .bpx-player-sending-bar {
        max-width: none !important;
        margin-inline: 0 !important;
        padding-inline: max(24px, calc((100% - 1200px) / 2)) !important;
      }
      @media (max-width: 900px) {
        .video-container-v1 { display: block !important; }
        .left-container, .right-container { width: 100% !important; }
        .right-container { margin-top: 24px !important; }
      }
    `;
    syncScreen();
    arrangeDetails();
  }

  function restoreLights() {
    if (originalLight !== null && lightControl?.isConnected && lightControl.checked !== originalLight) {
      lightControl.click();
    }
    originalLight = null;
  }

  function syncLights() {
    const nextControl = player?.querySelector('.bpx-player-ctrl-setting-lightoff input');
    if (nextControl !== lightControl) {
      restoreLights();
      lightControl = nextControl;
    }
    if (autoLights && video?.isConnected && !video.paused && !video.ended && lightControl) {
      if (originalLight === null) originalLight = lightControl.checked;
      if (!lightControl.checked) lightControl.click();
    } else {
      restoreLights();
    }
  }

  const lightsSetting = document.createElement('div');
  lightsSetting.id = 'bili-theater-auto-lights';
  lightsSetting.className = 'bpx-player-ctrl-setting-checkbox bui bui-checkbox bui-dark';
  lightsSetting.title = '播放時自動關燈，暫停或結束時恢復';
  lightsSetting.innerHTML = `<div class="bui-area">
    <input id="bili-theater-auto-lights-input" class="bui-checkbox-input" type="checkbox" aria-label="播放時自動關燈">
    <label class="bui-checkbox-label" for="bili-theater-auto-lights-input">
      <span class="bui-checkbox-icon bui-checkbox-icon-default" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M8 6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8zm0-2h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4z"/></svg></span>
      <span class="bui-checkbox-icon bui-checkbox-icon-selected" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m13 18.25-1.8-1.8c-.6-.6-1.65-.6-2.25 0s-.6 1.5 0 2.25l2.85 2.85c.318.318.762.468 1.2.448.438.02.882-.13 1.2-.448l8.85-8.85c.6-.6.6-1.65 0-2.25s-1.65-.6-2.25 0l-7.8 7.8zM8 4h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4V8c0-2.21 1.79-4 4-4z"/></svg></span>
      <span class="bui-checkbox-name">自動關燈</span>
    </label>
  </div>`;
  const lightsInput = lightsSetting.querySelector('input');
  lightsInput.checked = autoLights;
  lightsSetting.addEventListener('click', event => event.stopPropagation());
  lightsSetting.addEventListener('keydown', event => event.stopPropagation());
  lightsSetting.addEventListener('keyup', event => event.stopPropagation());
  lightsInput.addEventListener('change', () => {
    autoLights = lightsInput.checked;
    GM_setValue('autoLights', autoLights);
    syncLights();
  });
  const settingsObserver = new ResizeObserver(([{ target }]) => {
    target.closest('.bui-panel-wrap')?.style.setProperty('--bili-settings-height', `${target.offsetHeight}px`);
  });

  function mountLights() {
    const nextVideo = player?.querySelector('video');
    if (video !== nextVideo) {
      restoreLights();
      for (const type of ['play', 'pause', 'ended', 'emptied']) {
        video?.removeEventListener(type, syncLights);
        nextVideo?.addEventListener(type, syncLights);
      }
      video = nextVideo;
    }
    const menu = player?.querySelector('.bpx-player-ctrl-setting-others-content');
    if (menu && lightsSetting.parentElement !== menu) {
      settingsObserver.disconnect();
      menu.append(lightsSetting);
      settingsObserver.observe(menu.closest('.bpx-player-ctrl-setting-menu-right'));
    }
    syncLights();
  }
  window.addEventListener('pagehide', restoreLights);

  const button = document.createElement('button');
  button.id = BTN_ID;
  button.type = 'button';
  button.className = 'bpx-player-ctrl-btn';
  button.setAttribute('aria-keyshortcuts', 't');
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" stroke-width="1.8"/>
      <path d="M7 9h10v6H7z" class="bili-theater-fill" fill="currentColor"/>
      <path d="M3 9h18M3 15h18" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span class="bili-theater-tooltip" aria-hidden="true"></span>`;

  function syncButton() {
    const label = theaterOn ? '退出剧场模式 (T)' : '剧场模式 (T)';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(theaterOn));
    button.querySelector('.bili-theater-tooltip').textContent = label;
  }

  function isPageScreen() {
    return ['normal', 'wide'].includes(player?.getAttribute('data-screen'));
  }

  function syncScreen() {
    // 全屏和小窗交给原生播放器，返回页面后再恢复剧场布局。
    theaterStyle.disabled = !theaterOn || !isPageScreen();
    syncBewly();
    button.disabled = !isPageScreen();
  }

  function enterWide() {
    const wide = player?.querySelector('.bpx-player-ctrl-wide');
    if (player?.getAttribute('data-screen') === 'normal' && wide) {
      changedWide = true;
      enteringWide = true;
      try { wide.click(); } finally { enteringWide = false; }
    }
  }

  function toggleTheater(restoreWide = true) {
    if (!isPageScreen()) return;
    theaterOn = !theaterOn;
    GM_setValue('theaterOn', theaterOn);
    if (theaterOn) {
      enterWide();
      updateLayout();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      syncScreen();
      if (restoreWide && changedWide && player?.getAttribute('data-screen') === 'wide') {
        player.querySelector('.bpx-player-ctrl-wide')?.click();
      }
      changedWide = false;
    }
    syncButton();
    arrangeDetails();
  }

  document.addEventListener('click', (event) => {
    // 手动宽屏交给原生处理；脚本进入剧场时触发的宽屏点击不退出剧场。
    if (theaterOn && !enteringWide && player?.contains(event.target) &&
        event.target.closest?.('.bpx-player-ctrl-wide')) toggleTheater(false);
  }, true);

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleTheater();
  });
  button.addEventListener('keydown', (event) => {
    // 保留原生按钮的 Enter/空格操作，避免同时触发播放器的播放/暂停。
    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
  });
  button.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.repeat || event.isComposing ||
        event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || event.key.toLowerCase() !== 't') return;
    if (event.composedPath().some(el => el instanceof Element &&
        (el.matches('input, textarea, select, [role="textbox"]') || el.isContentEditable))) return;
    if (!isPageScreen()) return;
    event.preventDefault();
    toggleTheater();
  });

  window.addEventListener('resize', () => { if (theaterOn) updateLayout(); else arrangeDetails(); });

  const screenObserver = new MutationObserver(() => { syncScreen(); arrangeDetails(); });
  let detailNodes = [];
  const detailsObserver = new ResizeObserver(arrangeDetails);
  function arrangeDetails() {
    const wrap = document.getElementById('playerWrap');
    const title = document.getElementById('viewbox_report');
    const up = document.querySelector('.up-panel-container');
    const root = wrap?.closest('.video-container-v1');
    if (!root || !title || !up) return;
    // 只改变布局，不移动 Vue 管理的节点；load 事件也可能早于组件初始化。
    root.classList.add('bili-details-layout');
    const nodes = [root, wrap, title, up];
    if (nodes.some((node, index) => node !== detailNodes[index])) {
      detailsObserver.disconnect();
      nodes.forEach(node => detailsObserver.observe(node));
      detailNodes = nodes;
    }
    const bounds = root.getBoundingClientRect();
    const info = title.getBoundingClientRect();
    root.style.setProperty('--bili-up-width', `${info.width}px`);
    const values = {
      '--bili-up-top': info.bottom - bounds.top + 16,
      '--bili-up-left': info.left - bounds.left,
      '--bili-up-height': up.getBoundingClientRect().height,
    };
    for (const [name, value] of Object.entries(values)) {
      const px = `${value}px`;
      if (root.style.getPropertyValue(name) !== px) root.style.setProperty(name, px);
    }
  }

  function mountButton() {
    const nextPlayer = document.querySelector('.bpx-player-container');
    if (nextPlayer !== player) {
      screenObserver.disconnect();
      player = nextPlayer;
      changedWide = false;
      if (player) screenObserver.observe(player, { attributes: true, attributeFilter: ['data-screen'] });
    }
    const controls = player?.querySelector('.bpx-player-control-bottom-right');
    if (controls) {
      const anchor = controls.querySelector('.bpx-player-ctrl-wide, .bpx-player-ctrl-web, .bpx-player-ctrl-full');
      if (button.parentElement !== controls || button.nextElementSibling !== anchor) {
        controls.insertBefore(button, anchor?.parentElement === controls ? anchor : null);
        if (theaterOn) enterWide();
      }
    }
    mountLights();
    syncScreen();
  }

  // 弹幕也会频繁改变 DOM；按钮仍在播放器中时不扫描页面。
  let mountPending = false;
  new MutationObserver((records) => {
    if (mountPending) return;
    const detailsChanged = records.some(({ target }) => !target.closest?.('.bpx-player-container'));
    if (!detailsChanged && player?.isConnected && player.contains(button) &&
        player.contains(lightsSetting) && player.querySelector('video') === video &&
        player.querySelector('.bpx-player-ctrl-setting-lightoff input') === lightControl) {
      const anchor = button.parentElement.querySelector('.bpx-player-ctrl-wide, .bpx-player-ctrl-web, .bpx-player-ctrl-full');
      if (!anchor || button.nextElementSibling === anchor) return;
    }
    mountPending = true;
    requestAnimationFrame(() => { mountPending = false; mountButton(); arrangeDetails(); });
  }).observe(document.body, { childList: true, subtree: true });

  window.addEventListener('load', arrangeDetails, { once: true });
  syncButton();
  if (theaterOn) updateLayout();
  mountButton();
  arrangeDetails();
})();
