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
    checkDetails('退出劇場後');
    check(testPrefs.get('theaterOn') === false, '手動關閉後保存關閉偏好');
    check(player().querySelector('.bpx-player-sending-bar').getBoundingClientRect().width === originalBarWidth, '退出後彈幕列還原原生寬度');
    key(); await settle();
    const beforeWideClick = wideClicks;
    player().querySelector('.bpx-player-ctrl-wide path').dispatchEvent(new MouseEvent('click', {bubbles:true}));
    check(!active() && style().disabled && testPrefs.get('theaterOn') === false, '點擊原生寬屏圖示立即退出劇場並儲存關閉偏好');
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
    }
    player().dataset.screen = 'wide'; await settle();
    check(!style().disabled && !button().disabled, '離開全屏與小窗後恢復劇場');
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
