(async () => {
  const fixture = document.querySelector('#fixture');
  const summary = document.querySelector('#summary');
  const results = document.querySelector('#results');
  const settle = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const button = () => document.querySelector('#bili-theater-btn');
  const autoLight = () => document.querySelector('#bili-theater-auto-lights input');
  const nativeLight = () => player().querySelector('.bpx-player-ctrl-setting-lightoff input');
  const playback = (playing, event = playing ? 'play' : 'pause') => {
    const video = player().querySelector('video');
    video.testPaused = !playing;
    video.testEnded = event === 'ended';
    video.dispatchEvent(new Event(event));
  };
  const player = () => document.querySelector('.bpx-player-container');
  const active = () => button()?.getAttribute('aria-pressed') === 'true';
  const style = () => document.querySelector('#bili-theater-style');
  const headerColors = () => ['.bili-header__bar', '#nav-searchform', '.nav-search-input'].map(sel => {
    const css = getComputedStyle(document.querySelector(sel));
    return [css.backgroundColor, css.color];
  });
  const originalHeaderColors = JSON.stringify(headerColors());
  const originalBodyColor = getComputedStyle(document.body).backgroundColor;
  const isBewlyCat = new URLSearchParams(location.search).get('bewly') === 'cat';
  function makeBewly() {
    document.querySelector('#bewly')?.remove();
    const host = document.createElement('div'); host.id = 'bewly';
    host.attachShadow({mode: 'open'}).append(document.querySelector('#bewly-fixture').content.cloneNode(true));
    if (isBewlyCat) {
      const root = host.shadowRoot;
      const theme = root.querySelector('style');
      theme.textContent = theme.textContent.replaceAll(':host(#bewly.', ':host(.').replace('.dark input', ':host(.dark) input')
        + ':host(.settings-open) { position: relative; z-index: 10003; }';
      const main = root.querySelector('header > main');
      main.className = 'top-bar-header';
      const mask = document.createElement('div'); mask.className = 'top-bar-header__legacy-mask';
      mask.style.opacity = '0';
      const fog = document.createElement('div'); fog.className = 'top-bar-header__fog';
      fog.style.cssText = 'background: linear-gradient(to bottom, var(--bew-bg), transparent); opacity: 0.8; height: var(--bew-top-bar-height);';
      main.prepend(mask, fog);
    }
    document.querySelector('.bili-header').after(host);
    document.documentElement.classList.add('test-bewly');
  }
  const bewlyColors = () => {
    const root = document.querySelector('#bewly').shadowRoot;
    return ['header:has(> main)', 'input', '.bew-popover', '.other-panel', '.logo'].map(sel => {
      const css = getComputedStyle(root.querySelector(sel));
      return [css.backgroundColor, css.color];
    });
  };
  makeBewly();
  const originalBewlyColors = JSON.stringify(bewlyColors());
  document.querySelector('#bewly').remove();
  document.documentElement.classList.remove('test-bewly');
  const key = (target = document.body, options = {}) => target.dispatchEvent(new KeyboardEvent('keydown', {
    key: 't', bubbles: true, composed: true, cancelable: true, ...options,
  }));
  let passed = 0;
  let follows = 0;
  let wideClicks = 0;
  function check(condition, name) {
    if (!condition) throw new Error(name);
    const item = document.createElement('li'); item.textContent = `通過：${name}`; results.append(item); passed++;
  }
  function makePlayer(screen = 'normal') {
    fixture.innerHTML = `
      <div class="video-container-v1"><div class="left-container">
      <div id="viewbox_report"><h2>測試影片標題</h2><span>影片播放資訊</span></div>
      <div id="playerWrap"><div id="bilibili-player"><div class="bpx-player-container" data-screen="${screen}">
        <div class="bpx-player-primary-area"><video></video>
          <div class="bpx-player-ctrl-setting-box"><div class="bui-panel-wrap" style="height:140px"><div class="bui-panel-move">
            <div class="bui-panel-item bui-panel-item-active" style="height:140px"><div class="bpx-player-ctrl-setting-menu-left">
              <div>鏡像畫面</div><div>單集循環</div><div>自動開播</div><div class="bpx-player-ctrl-setting-more">更多播放設定</div>
            </div></div><div class="bui-panel-item"><div class="bpx-player-ctrl-setting-menu-right">
              <div class="bpx-player-ctrl-setting-others-title">其他設置</div><div class="bpx-player-ctrl-setting-others-content">
                <div class="bpx-player-ctrl-setting-checkbox bui bui-checkbox bui-dark"><div class="bui-area"><input class="bui-checkbox-input" type="checkbox" aria-label="隱藏黑邊"><label class="bui-checkbox-label"><span class="bui-checkbox-icon">□</span><span class="bui-checkbox-name">隱藏黑邊</span></label></div></div>
                <div class="bpx-player-ctrl-setting-lightoff bpx-player-ctrl-setting-checkbox bui bui-checkbox bui-dark"><div class="bui-area"><input class="bui-checkbox-input" type="checkbox" aria-label="原生關燈"><label class="bui-checkbox-label"><span class="bui-checkbox-icon">□</span><span class="bui-checkbox-name">關燈模式</span></label></div></div>
                <div class="bpx-player-ctrl-setting-checkbox bui bui-checkbox bui-dark"><div class="bui-area"><input class="bui-checkbox-input" type="checkbox" aria-label="高能進度條"><label class="bui-checkbox-label"><span class="bui-checkbox-icon">□</span><span class="bui-checkbox-name">高能進度條</span></label></div></div>
              </div>
            </div></div>
          </div></div></div>
          <div class="bpx-player-video-area"><div class="bpx-player-control-bottom"><div class="bpx-player-control-bottom-right">
            <button class="bpx-player-ctrl-btn bpx-player-ctrl-wide" aria-label="寬屏"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18v12H3z" stroke="currentColor" stroke-width="2"/></svg></button>
            <button class="bpx-player-ctrl-btn bpx-player-ctrl-full" aria-label="全螢幕"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5" stroke="currentColor" stroke-width="2"/></svg></button>
          </div></div></div>
          <div class="bpx-player-sending-area"><div class="bpx-player-sending-bar"><span>觀看人數</span><span>彈幕控制</span><span>發送彈幕</span></div></div>
        </div>
      </div></div></div>
      <div id="arc_toolbar_report">互動按鈕</div><div id="v_desc">測試影片簡介</div><div id="commentapp"><h2>評論</h2></div>
      </div><div class="right-container"><div class="right-container-inner">
        <div class="up-panel-container"><a class="up-avatar" href="#test-channel">測試 UP 主</a><div class="default-btn">載入中</div></div>
        <div class="video-pod-above-modules"><div class="video-pod-above-modules__inner"><div class="danmaku-box">彈幕列表</div></div></div>
        <div class="rcmd-tab"><h2>接下來播放</h2><a href="#test-recommendation">推薦影片連結</a></div>
      </div></div></div>`;
    const video = player().querySelector('video');
    video.testPaused = true; video.testEnded = false;
    Object.defineProperties(video, {
      paused: {get: () => video.testPaused},
      ended: {get: () => video.testEnded},
    });
    player().querySelector('.bpx-player-ctrl-setting-more').onclick = () => {
      player().querySelectorAll('.bui-panel-item').forEach(item => item.classList.toggle('bui-panel-item-active'));
    };
    player().querySelector('.bpx-player-ctrl-wide').onclick = () => {
      wideClicks++;
      player().dataset.screen = player().dataset.screen === 'wide' ? 'normal' : 'wide';
    };
  }
  function checkDetails(mode) {
    const wrap = document.querySelector('#playerWrap');
    const title = document.querySelector('#viewbox_report');
    const up = document.querySelector('.up-panel-container');
    const right = document.querySelector('.right-container');
    check(title.getBoundingClientRect().top >= wrap.getBoundingClientRect().bottom - 1 && up.getBoundingClientRect().top >= title.getBoundingClientRect().bottom && up.getBoundingClientRect().bottom <= document.querySelector('#arc_toolbar_report').getBoundingClientRect().top, `${mode}：標題與 UP 主都在播放器下方`);
    check(getComputedStyle(right).display !== 'none' && right.getBoundingClientRect().width > 0 && right.querySelector('.rcmd-tab a').getAttribute('href') === '#test-recommendation', `${mode}：推薦影片與連結保留`);
  }
  try {
    check(!button(), '播放器尚未載入時不掛到頁面角落');
    key();
    makePlayer(); await settle();
    const saved = testPrefs.get('theaterOn');
    check(active() === saved && style().disabled === !saved, '載入影片時套用上次保存的開關狀態');
    check(/劇場模式/.test(button().getAttribute('aria-label')) && document.querySelector('#bili-theater-auto-lights .bui-checkbox-name').textContent === '自動關燈', '繁體頁面的按鈕與設定都用繁體');
    check(saved ? player().dataset.screen === 'wide' : player().dataset.screen === 'normal', '自動套用時同步寬屏狀態');
    check(!nativeLight().checked, '暫停時不因劇場偏好關燈');
    if (saved) key();
    await settle();
    checkDetails('一般模式');
    const originalUp = document.querySelector('.up-panel-container');
    check(originalUp.parentElement.classList.contains('right-container-inner') && document.querySelector('#viewbox_report').nextElementSibling.id === 'playerWrap', '初始化前保留原生父節點及順序');
    // 模擬 load 之後才完成的元件初始化，仍從原生父節點尋找掛載點。
    const lateUp = document.querySelector('.right-container-inner > .up-panel-container');
    lateUp.querySelector('.default-btn').outerHTML = '<button type="button">關注測試</button>';
    const avatar = document.createElement('img'); avatar.alt = '測試頭像';
    avatar.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="gray"/></svg>';
    lateUp.querySelector('.up-avatar').append(avatar);
    lateUp.querySelector('button').onclick = () => follows++;
    await avatar.decode(); await settle();
    check(avatar.naturalWidth > 0 && lateUp.querySelector('button').textContent === '關注測試', '頁面載入後延遲初始化仍載入頭像與關注按鈕');
    originalUp.querySelector('button').click();
    check(follows === 1, '原生 UP 主事件仍能運作');
    originalUp.querySelector('button').textContent = '已更新關注狀態'; await settle();
    checkDetails('站點重新渲染後');
    check(document.querySelector('.up-panel-container') === originalUp && document.querySelectorAll('.up-panel-container').length === 1, '重新排版不複製 UP 主節點');
    check(button()?.nextElementSibling.classList.contains('bpx-player-ctrl-wide'), '延遲載入後掛在寬屏左側');
    const controls = button().parentElement;
    const nativeControls = [...controls.children].filter(el => el !== button());
    nativeControls.forEach(el => el.remove()); await settle();
    nativeControls.forEach(el => controls.append(el)); await settle();
    check(button().nextElementSibling.classList.contains('bpx-player-ctrl-wide'), '原生控制項分批載入後仍放在寬屏左側');
    check(getComputedStyle(button()).display !== 'none', '舊的隱藏懸浮按鈕設定不隱藏控制列按鈕');
    player().dataset.ctrlHidden = 'true'; button().focus();
    check(getComputedStyle(button().closest('.bpx-player-control-bottom')).opacity === '1', '鍵盤聚焦時控制列保持可見');
    button().blur(); delete player().dataset.ctrlHidden;
    check(testMenus.size === 0 && autoLight().closest('.bpx-player-ctrl-setting-others-content') && !player().querySelector('.bpx-player-ctrl-setting-menu-left #bili-theater-auto-lights'), '開關位於更多播放設置的其他設置');
    check(autoLight().checked === (new URLSearchParams(location.search).get('lights') !== 'off'), '沿用舊深色模式的開關偏好');
    check(document.querySelector('.bui-panel-wrap').getBoundingClientRect().height === 140, '第一層設定面板維持原來高度');
    player().querySelector('.bpx-player-ctrl-setting-more').click(); await settle();
    const setting = document.querySelector('#bili-theater-auto-lights');
    check(setting.className === 'bpx-player-ctrl-setting-checkbox bui bui-checkbox bui-dark' && autoLight().classList.contains('bui-checkbox-input') && setting.querySelector('label').control === autoLight(), '沿用原生勾選框樣式並正確連結標籤');
    check(getComputedStyle(setting.querySelector('.bui-checkbox-name')).fontSize === getComputedStyle(nativeLight().parentElement.querySelector('.bui-checkbox-name')).fontSize && setting.offsetHeight === nativeLight().closest('.bpx-player-ctrl-setting-checkbox').offsetHeight, '字體及控件高度與同層級選項一致');
    check(document.querySelector('.bui-panel-wrap').getBoundingClientRect().height >= document.querySelector('.bpx-player-ctrl-setting-menu-right').getBoundingClientRect().height, '更多播放設置面板容納新增選項');
    const beforeLabelClick = autoLight().checked;
    setting.querySelector('label').click();
    check(autoLight().checked !== beforeLabelClick && testPrefs.get('autoLights') === autoLight().checked, '點擊原生樣式標籤會切換並儲存設定');
    setting.querySelector('label').click();
    let clicks = 0;
    fixture.addEventListener('click', () => clicks++);
    const originalBarWidth = player().querySelector('.bpx-player-sending-bar').getBoundingClientRect().width;
    button().click(); await settle();
    check(active() && !style().disabled && player().dataset.screen === 'wide', '按鈕開啟劇場與寬屏');
    check(headerColors()[0][0] === 'rgb(35, 37, 40)' && headerColors()[0][1] === 'rgb(241, 242, 243)' && headerColors()[1][0] === 'rgb(47, 49, 52)' && headerColors()[2][1] === 'rgb(201, 204, 208)', '劇場導覽列與搜尋框套用深色，文字維持可讀');
    check(getComputedStyle(document.body).backgroundColor === originalBodyColor && getComputedStyle(document.querySelector('#fixture')).backgroundColor === originalBodyColor && getComputedStyle(document.documentElement).getPropertyValue('--bg1').trim() === '#fff', '劇場導覽列配色不影響淺色內容區與全站主題');
    check(!document.querySelector('#bewly') && !document.querySelector('.bili-header').classList.contains('dark'), '未安裝 Bewly 時原生頂欄仍獨立運作');
    makeBewly(); await settle();
    const darkBewlyColors = JSON.stringify(bewlyColors());
    check(bewlyColors()[0][0] === 'rgb(9, 9, 11)' && bewlyColors()[0][1] === 'rgb(249, 250, 251)' && bewlyColors()[1][1] === 'rgb(249, 250, 251)', '延遲載入的 Bewly Shadow DOM 頂欄及搜尋文字套用深色');
    check(bewlyColors()[2][0] !== 'rgb(255, 255, 255)' && bewlyColors()[3][0] === 'rgb(255, 255, 255)' && bewlyColors()[4][1] === 'rgb(177, 50, 70)' && !document.querySelector('#bewly').classList.contains('dark'), '只深色化 Bewly 頂欄與其選單，保留其他面板、主題色及全站主題');
    check(headerColors()[0][0] === 'rgb(25, 27, 32)', 'Bewly 使用原生頂欄時也套用它的深色背景變數');
    const bewlyRoot = document.querySelector('#bewly').shadowRoot;
    let bewlyHeader = bewlyRoot.querySelector('header:has(> main)');
    const gradient = () => getComputedStyle(bewlyHeader, '::after');
    if (isBewlyCat) {
      const beforeLayer = getComputedStyle(bewlyHeader).zIndex;
      bewlyRoot.host.classList.add('settings-open'); await settle();
      check(getComputedStyle(bewlyHeader).zIndex === beforeLayer, 'BewlyCat 開啟設定面板時不將宿主的定位和層級套到頂欄');
      bewlyRoot.host.classList.remove('settings-open');
    }
    check((gradient().content !== 'none') === (savedGradient === 'on'), '未打開設定面板時沿用已儲存的漸層偏好，尚未讀到設定則不強制開啟');
    const settingsPanel = document.querySelector('#bewly-settings-fixture').content.firstElementChild.cloneNode(true);
    bewlyRoot.append(settingsPanel); await settle();
    const gradientControl = settingsPanel.querySelector('input');
    check(gradient().content === 'none' && testPrefs.get('bewlyThemeGradient') === false, '面板延遲載入後讀取關閉狀態，覆蓋舊偏好並儲存');
    gradientControl.closest('label').click();
    check(gradient().content !== 'none' && testPrefs.get('bewlyThemeGradient') === true, '點擊 Bewly 原生標籤立即啟用並保存局部漸層');
    gradientControl.click();
    check(gradient().content === 'none' && testPrefs.get('bewlyThemeGradient') === false, '關閉 Bewly 漸層開關立即移除局部漸層並保存');
    for (const title of ['在頂欄顯示主題色漸變（僅在深色模式下有效）', 'Show theme color gradient in top bar (only works in dark mode)', '喺頂部欄顯示主題色漸變（淨係喺深色模式下有效）']) {
      settingsPanel.querySelector('.left-content > div').textContent = title;
      gradientControl.click();
      check(gradient().content !== 'none' && testPrefs.get('bewlyThemeGradient') === true, `${title}：讀取原生開關`);
      gradientControl.click();
    }
    gradientControl.click();
    settingsPanel.querySelectorAll('input')[1].click();
    check(gradient().content !== 'none' && testPrefs.get('bewlyThemeGradient') === true, '其他設定及說明中的相似文字不會改變漸層偏好');
    settingsPanel.remove(); await settle();
    check(gradient().content !== 'none', '關閉設定面板後保留最後讀到的漸層偏好');
    gradientControl.checked = false;
    bewlyRoot.append(settingsPanel); await settle();
    check(gradient().content === 'none' && testPrefs.get('bewlyThemeGradient') === false, '重新開啟設定面板時重新讀取實際值');
    gradientControl.click(); settingsPanel.remove(); await settle();
    const originalGradient = gradient().backgroundImage;
    check(gradient().content === '""' && originalGradient.includes('linear-gradient') && gradient().height === '64px' && gradient().pointerEvents === 'none', '劇場頂欄顯示 Bewly 主題漸層，範圍限於頂欄且不攔截操作');
    check(getComputedStyle(document.body).backgroundColor === originalBodyColor && getComputedStyle(document.body).backgroundImage === 'none' && getComputedStyle(bewlyRoot.querySelector('.other-panel'), '::after').content === 'none' && getComputedStyle(document.querySelector('.bili-header'), '::after').content === 'none', '主題漸層不影響淺色內容區、其他面板或原生頂欄');
    document.querySelector('#bewly').style.setProperty('--bew-theme-color', '#00aaff');
    check(gradient().backgroundImage !== originalGradient, '漸層即時跟隨 Bewly 主題色');
    document.querySelector('#bewly').style.removeProperty('--bew-theme-color');
    if (isBewlyCat) {
      const fog = bewlyHeader.querySelector('.top-bar-header__fog');
      fog.style.opacity = '0.9';
      check(gradient().content === 'none', 'BewlyCat 常駐雲霧離開頁首時收起漸層');
      fog.style.opacity = '0.8';
      check(gradient().backgroundImage === originalGradient, 'BewlyCat 回到頁首恢復漸層');
      const glass = document.createElement('div'); glass.className = 'top-bar-header__glass-overlay';
      glass.style.maskImage = 'linear-gradient(black, transparent)';
      bewlyHeader.querySelector('main').prepend(glass); await settle();
      check(gradient().content !== 'none' && gradient().backgroundImage !== originalGradient, 'BewlyCat 實驗毛玻璃遮罩不誤判捲動，沿用較深的 20% 主題色');
      bewlyHeader.classList.add('force-white-icon');
      check(gradient().content !== 'none', 'BewlyCat 沿用新版白圖示也允許顯示漸層的行為');
      bewlyHeader.classList.remove('force-white-icon');
      fog.style.opacity = '1';
      check(gradient().content === 'none', 'BewlyCat 實驗毛玻璃離開頁首仍收起漸層');
      fog.style.opacity = '0.8'; glass.remove(); await settle();
      check(gradient().backgroundImage === originalGradient, 'BewlyCat 返回舊版樣式恢復 10% 主題色');
    } else {
      const scrollMask = document.createElement('div'); scrollMask.style.maskImage = 'linear-gradient(black, transparent)';
      bewlyHeader.querySelector('main').prepend(scrollMask); await settle();
      check(gradient().content === 'none', '沿用 Bewly 捲動遮罩狀態，離開頁首便收起漸層');
      scrollMask.remove(); await settle();
      check(gradient().backgroundImage === originalGradient, '回到頁首恢復主題漸層');
      bewlyHeader.classList.add('force-white-icon');
      check(gradient().content === 'none', '保留 Bewly 強制白色圖示時不顯示主題漸層的行為');
      bewlyHeader.classList.remove('force-white-icon');
    }
    document.querySelector('#bewly').classList.add('dark');
    check(gradient().content === 'none', 'Bewly 自己啟用全站深色時交回原生漸層，避免疊加');
    document.querySelector('#bewly').classList.remove('dark');
    const themeStyle = bewlyRoot.querySelector('#bili-theater-bewly-style');
    let themeWrites = 0;
    const themeObserver = new MutationObserver(records => { themeWrites += records.length; });
    themeObserver.observe(themeStyle, {childList: true});
    themeStyle.dispatchEvent(new Event('load')); await settle();
    check(themeWrites === 0, '忽略自身 style 的 load 事件，避免主題重建循環');
    themeObserver.disconnect();
    const themeRule = [...bewlyRoot.querySelector('style').sheet.cssRules].find(rule => rule.selectorText?.includes(isBewlyCat ? ':host(.dark)' : ':host(#bewly.dark)'));
    const originalBg = themeRule.style.getPropertyValue('--bew-bg');
    themeRule.style.setProperty('--bew-bg', '#202226');
    const lateSheet = document.createElement('link'); lateSheet.rel = 'stylesheet'; bewlyRoot.append(lateSheet);
    lateSheet.dispatchEvent(new Event('load')); await settle();
    check(bewlyColors()[0][0] === 'rgb(32, 34, 38)', '樣式表載入後重新讀取已安裝版本的深色規則');
    themeRule.style.setProperty('--bew-bg', originalBg); lateSheet.dispatchEvent(new Event('load')); await settle();
    if (isBewlyCat) {
      themeRule.style.setProperty('--bew-dark-base-color', '#2a2d32');
      themeRule.style.setProperty('--bew-bg', 'color-mix(in oklab, var(--bew-dark-base-color), black 20%)');
      bewlyRoot.host.style.setProperty('--bew-dark-base-color', '#556677');
      lateSheet.dispatchEvent(new Event('load')); await settle();
      check(getComputedStyle(bewlyHeader).getPropertyValue('--bew-dark-base-color').trim() === '#556677', 'BewlyCat 使用者自訂深色基底不被預設值蓋掉');
      const beforeBase = getComputedStyle(bewlyHeader).backgroundColor;
      bewlyRoot.host.style.setProperty('--bew-dark-base-color', '#665544');
      check(getComputedStyle(bewlyHeader).backgroundColor !== beforeBase, 'BewlyCat 深色頂欄即時跟隨原生深色基底');
      themeRule.style.removeProperty('--bew-dark-base-color');
      themeRule.style.setProperty('--bew-bg', originalBg);
      lateSheet.dispatchEvent(new Event('load')); await settle();
    }
    check(getComputedStyle(bewlyRoot.querySelector('input')).colorScheme === 'dark' && getComputedStyle(bewlyRoot.querySelector('input')).boxShadow.includes('0px 4px 6px') && getComputedStyle(bewlyHeader).getPropertyValue('--bew-shadow-edge-glow-1').includes('#ffffff0a'), '沿用已載入的原生深色控件、陰影及磨砂邊緣規則');
    document.querySelector('#bewly').classList.add('disable-shadow', 'disable-frosted-glass');
    check(getComputedStyle(bewlyRoot.querySelector('input')).boxShadow.includes('0px 0px 0px') && getComputedStyle(bewlyHeader).getPropertyValue('--bew-shadow-edge-glow-1').includes('transparent'), '保留使用者停用陰影和磨砂效果的設定');
    document.querySelector('#bewly').classList.remove('disable-shadow', 'disable-frosted-glass');
    bewlyHeader.className = ''; await settle();
    check(bewlyHeader.classList.contains('dark'), 'Vue 更新頂欄 class 後維持局部深色');
    bewlyHeader.replaceWith(bewlyHeader.cloneNode(true)); await settle();
    check(!bewlyHeader.classList.contains('dark'), '頂欄替換後清除舊節點的腳本樣式狀態');
    bewlyHeader = bewlyRoot.querySelector('header:has(> main)');
    bewlyHeader.classList.remove('dark'); await settle();
    check(bewlyHeader.classList.contains('dark'), 'Shadow DOM 內頂欄替換後重新套用深色控件');
    makeBewly(); await settle();
    check(JSON.stringify(bewlyColors()) === darkBewlyColors, 'Bewly Shadow DOM 替換後自動恢復頂欄深色');
    check(getComputedStyle(document.querySelector('#bewly').shadowRoot.querySelector('header:has(> main)'), '::after').content !== 'none', 'Bewly 重建後沿用已讀取的漸層偏好');
    checkDetails('劇場模式');
    check(document.querySelector('.right-container').getBoundingClientRect().top >= document.querySelector('#playerWrap').getBoundingClientRect().bottom, '劇場推薦欄從播放器下方開始');
    const danmakuRect = document.querySelector('.danmaku-box').getBoundingClientRect();
    check(Math.abs(danmakuRect.top - document.querySelector('.right-container').getBoundingClientRect().top) < 1 && document.querySelector('.rcmd-tab').getBoundingClientRect().top - danmakuRect.bottom <= 40, '劇場右欄清除原生寬屏預留空白，保留彈幕列表並緊接推薦影片');
    check(testPrefs.get('theaterOn') === true, '手動開啟後保存劇場偏好');
    const areaRect = player().querySelector('.bpx-player-sending-area').getBoundingClientRect();
    const barRect = player().querySelector('.bpx-player-sending-bar').getBoundingClientRect();
    check(Math.abs(barRect.left - areaRect.left) < 1 && Math.abs(barRect.right - areaRect.right) < 1, '彈幕列背景填滿播放器寬度');
    const bar = player().querySelector('.bpx-player-sending-bar');
    const contentLeft = bar.firstElementChild.getBoundingClientRect().left;
    const contentRight = bar.lastElementChild.getBoundingClientRect().right;
    check(contentLeft - barRect.left >= 24 && Math.abs((contentLeft - barRect.left) - (barRect.right - contentRight)) < 1 && contentRight - contentLeft <= 1201, '彈幕內容維持整組置中、最大 1200px，背景延伸不改變內容對齊');
    check(clicks === 1, '劇場點擊不冒泡，只有原生寬屏點擊冒泡');
    button().click();
    const titleAfterExit = document.querySelector('#viewbox_report').getBoundingClientRect();
    const upAfterExit = document.querySelector('.up-panel-container').getBoundingClientRect();
    check(Math.abs(upAfterExit.top - titleAfterExit.bottom - 16) < 1, '切換模式立即對齊 UP 主，不等待下一個繪製影格');
    await settle();
    check(!active() && style().disabled && player().dataset.screen === 'normal', '退出還原一般模式');
    check(JSON.stringify(headerColors()) === originalHeaderColors, '退出劇場後導覽列及搜尋框還原原本配色');
    check(JSON.stringify(bewlyColors()) === originalBewlyColors, '退出劇場後 Bewly 頂欄、搜尋框與選單還原原本配色');
    check(!document.querySelector('.bili-header').classList.contains('dark') && !document.querySelector('#bewly').shadowRoot.querySelector('header:has(> main)').classList.contains('dark'), '退出後清除腳本加入的局部 dark class');
    check(getComputedStyle(document.querySelector('#bewly').shadowRoot.querySelector('header:has(> main)'), '::after').content === 'none', '退出劇場後清除主題漸層');
    checkDetails('退出劇場後');
    check(testPrefs.get('theaterOn') === false, '手動關閉後保存關閉偏好');
    check(player().querySelector('.bpx-player-sending-bar').getBoundingClientRect().width === originalBarWidth, '退出後彈幕列還原原生寬度');
    key(); await settle();
    const beforeWideClick = wideClicks;
    player().querySelector('.bpx-player-ctrl-wide path').dispatchEvent(new MouseEvent('click', {bubbles:true}));
    check(!active() && style().disabled && testPrefs.get('theaterOn') === false, '點擊原生寬屏圖示立即退出劇場並儲存關閉偏好');
    check(JSON.stringify(bewlyColors()) === originalBewlyColors, '原生寬屏立即還原 Bewly 頂欄');
    await settle();
    check(wideClicks === beforeWideClick + 1 && player().dataset.screen === 'normal', '手動寬屏只執行一次原生切換，不觸發額外還原');
    check(player().querySelector('.bpx-player-sending-bar').getBoundingClientRect().width === originalBarWidth, '手動寬屏後移除劇場尺寸覆寫');
    player().querySelector('.bpx-player-ctrl-wide').click(); await settle();
    check(!active() && style().disabled && player().dataset.screen === 'wide', '劇場關閉後原生寬屏可正常切換');
    key(); await settle();
    player().querySelector('.bpx-player-ctrl-wide').click(); await settle();
    check(!active() && style().disabled && player().dataset.screen === 'normal', '從既有寬屏進入劇場後，手動寬屏仍可退出劇場');
    player().dataset.screen = 'wide'; await settle();
    key(); key(); await settle();
    check(!active() && player().dataset.screen === 'wide', '原先已寬屏時退出仍保留寬屏');
    check(getComputedStyle(document.querySelector('.danmaku-box')).marginTop === '769px', '退出劇場後保留原生寬屏的彈幕列表間距');
    for (const options of [{repeat:true}, {isComposing:true}, {ctrlKey:true}, {altKey:true}, {metaKey:true}, {shiftKey:true}]) key(document.body, options);
    for (const editor of document.querySelectorAll('input, select, [contenteditable]')) key(editor);
    const host = document.createElement('div'); document.body.append(host);
    const shadowInput = document.createElement('input'); host.attachShadow({mode:'open'}).append(shadowInput); key(shadowInput); host.remove();
    check(!active(), '輸入、中文組字、修飾鍵與長按均不切換');
    key(document.body, {key:'T'}); await settle();
    check(active(), '大寫 T 可切換');
    for (const screen of ['web', 'full', 'mini']) {
      player().dataset.screen = screen; await settle(); key();
      check(style().disabled && active() && button().disabled && testPrefs.get('theaterOn') === true, `${screen} 暫停布局且不搶快捷鍵、不改寫偏好`);
      check(JSON.stringify(headerColors()) === originalHeaderColors, `${screen} 同時暫停劇場導覽列配色`);
      check(JSON.stringify(bewlyColors()) === originalBewlyColors, `${screen} 同時暫停 Bewly 頂欄配色`);
      check(getComputedStyle(document.querySelector('#bewly').shadowRoot.querySelector('header:has(> main)'), '::after').content === 'none', `${screen} 同時暫停主題漸層`);
    }
    player().dataset.screen = 'wide'; await settle();
    check(!style().disabled && !button().disabled, '離開全屏與小窗後恢復劇場');
    check(JSON.stringify(bewlyColors()) === darkBewlyColors, '離開全屏與小窗後恢復 Bewly 深色頂欄');
    const previous = button(); previous.remove(); await settle();
    check(button() === previous && document.querySelectorAll('#bili-theater-btn').length === 1, '控制列移除按鈕後只補回一個');
    makePlayer(); await settle();
    check(button() === previous && active() && player().dataset.screen === 'wide', '播放器替換後保留狀態並重新掛載');
    checkDetails('換片後');
    key(); await settle();
    check(player().dataset.screen === 'normal' && !active(), '替換後仍可退出並還原');
    key(); await settle();
    player().querySelector('.bpx-player-ctrl-wide').click(); await settle();
    check(!active() && style().disabled && player().dataset.screen === 'normal' && testPrefs.get('theaterOn') === false, '播放器替換後原生寬屏仍能退出劇場');
    if (!autoLight().checked) autoLight().click();
    playback(true);
    check(nativeLight().checked && !active(), '一般模式播放時關燈');
    playback(false);
    check(!nativeLight().checked, '暫停時還原原生關燈狀態');
    key(); playback(true);
    check(nativeLight().checked && active(), '劇場模式播放時關燈');
    playback(false, 'ended');
    check(!nativeLight().checked, '播放結束時恢復');
    playback(true); autoLight().click();
    check(!nativeLight().checked && testPrefs.get('autoLights') === false, '播放中關閉設定立即還原並保存');
    autoLight().click();
    check(nativeLight().checked && testPrefs.get('autoLights') === true, '播放中開啟設定立即關燈並保存');
    playback(false); nativeLight().click(); playback(true); playback(false);
    check(nativeLight().checked, '播放前已手動關燈則暫停後仍保留');
    nativeLight().click(); playback(true); playback(false, 'emptied');
    check(!nativeLight().checked, '媒體清空時恢復');
    playback(true);
    const oldVideo = player().querySelector('video');
    makePlayer(); await settle();
    check(!nativeLight().checked && document.querySelectorAll('#bili-theater-auto-lights').length === 1, '換片後重新掛載開關並依新影片狀態恢復');
    oldVideo.dispatchEvent(new Event('play'));
    check(!nativeLight().checked, '卸下舊影片的播放事件');
    autoLight().closest('#bili-theater-auto-lights').remove(); await settle();
    check(!!autoLight(), '設定選單重新渲染後補回開關');
    const originalHref = document.querySelector('#__css-map__').href;
    playback(true); playback(false);
    check(document.querySelector('#__css-map__').href === originalHref && !document.documentElement.classList.contains('night-mode'), '不修改網站主題或深色模式');
    key(); await settle();
    key(); window.dispatchEvent(new Event('resize'));
    check(!style().disabled && style().textContent.includes(`${Math.floor(innerHeight * 11 / 13)}px`), '縮放時更新劇場高度');
    key(); await settle();
    fixture.append(document.createElement('span')); await settle();
    check(document.querySelectorAll('#bili-theater-btn').length === 1, '其他 DOM 更新不重複新增按鈕');
    player().querySelector('.bpx-player-ctrl-setting-more').click(); await settle();
    summary.textContent = `${passed} 項測試全部通過`;
    document.documentElement.dataset.testResult = 'passed';
    if (new URLSearchParams(location.search).get('preview') === 'theater') key();
  } catch (error) {
    summary.textContent = `測試失敗：${error.message}`;
    document.documentElement.dataset.testResult = 'failed';
    console.error(error);
  }
})();
