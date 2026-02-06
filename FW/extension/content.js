let currentGroup = "默认";
let isDragging = false;
let startX, startY;
let lastKey = ""; // 用于记录上一次按键

// 1. 创建隔离层 (Shadow DOM)
const host = document.createElement('div');
host.id = 'fw-host';
host.style.cssText = 'all: initial; position: absolute; z-index: 2147483647;';
document.body.appendChild(host);
const shadow = host.attachShadow({mode: 'open'});

// 2. 注入样式
const style = document.createElement('style');
style.textContent = `
  #fw-root { position: fixed; top: 100px; right: 20px; display: none; opacity: 0; transform: translateY(10px); transition: opacity 0.2s, transform 0.2s; font-family: "Segoe UI", Arial, sans-serif; will-change: top, left; }
  #fw-root.show { display: block; opacity: 1; transform: translateY(0); }
  #fw-container { width: 280px; height: 420px; min-width: 220px; min-height: 300px; background: #fff; border: 1px solid #d1d5db; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); display: flex; flex-direction: column; resize: both; overflow: hidden; }
  
  /* 头部样式：包含标题、署名和标签 */
  #fw-header { padding: 12px 16px; cursor: grab; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; user-select: none; }
  .fw-header-left { display: flex; flex-direction: column; }
  .fw-title { font-weight: 800; font-size: 11px; color: #111827; pointer-events: none; }
  .fw-by { font-size: 9px; color: #9ca3af; margin-top: -2px; font-weight: 400; }
  .fw-header-right { display: flex; align-items: center; gap: 8px; }
  .fw-tag { font-size: 9px; background: #e5e7eb; color: #6b7280; padding: 2px 5px; border-radius: 4px; font-weight: 700; }
  
  .fw-close-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; font-size: 20px; color: #6b7280; }
  .fw-close-btn:hover { background: #e5e7eb; color: #ef4444; }
  
  .fw-tabs { display: flex; padding: 8px; gap: 6px; overflow-x: auto; background: #fff; border-bottom: 1px solid #eee; flex-shrink: 0; }
  .fw-tab { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 12px; font-size: 11px; cursor: pointer; transition: 0.2s; white-space: nowrap; font-weight: 600; }
  .fw-group-del { width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.1); font-size: 9px; margin-left: 4px; }
  
  .fw-body { flex: 1; overflow-y: auto; padding: 12px; background: #fff; }
  .fw-card { padding: 10px; margin-bottom: 8px; border-radius: 10px; background: #f9fafb; border: 1px solid #f3f4f6; display: flex; align-items: center; cursor: pointer; position: relative; }
  .fw-card:hover { background: #eff6ff; border-color: #bfdbfe; }
  .fw-dot { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-right: 12px; }
  .fw-dot.web { background: #10b981; } 
  .fw-name { font-size: 13px; font-weight: 600; color: #111827 !important; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fw-del-item { color: #d1d5db; font-size: 18px; padding: 0 4px; cursor: pointer; z-index: 5; }
  .fw-edit-input { position: absolute; left: 5px; right: 5px; top: 5px; bottom: 5px; border: 2px solid #3b82f6 !important; border-radius: 6px; padding: 0 10px; font-size: 12px; outline: none; z-index: 20; background: #fff; color: #000; box-sizing: border-box; }
  
  .fw-footer { padding: 12px; background: #f9fafb; border-top: 1px solid #e5e7eb; flex-shrink: 0; }
  .fw-input-row { display: flex; gap: 6px; margin-bottom: 6px; }
  .fw-input { flex: 1 !important; width: 100% !important; height: 32px !important; border: 1px solid #d1d5db !important; border-radius: 6px !important; padding: 0 10px !important; font-size: 12px !important; color: #000 !important; background: #fff !important; outline: none !important; box-sizing: border-box; }
  .fw-btn { background: #111827; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 11px; font-weight: 600; }
  .fw-btn.pulse { animation: pulse 0.3s; }
  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(0.9); } 100% { transform: scale(1); } }
`;
shadow.appendChild(style);

const root = document.createElement('div');
root.id = 'fw-root';
root.innerHTML = `
  <div id="fw-container">
    <div id="fw-header">
      <div class="fw-header-left">
        <span class="fw-title">FLOATWAUNCH ELITE</span>
        <span class="fw-by">By fw</span>
      </div>
      <div class="fw-header-right">
        <span class="fw-tag">Q + E</span>
        <div class="fw-close-btn" id="fw-x">×</div>
      </div>
    </div>
    <div class="fw-tabs" id="fw-tabs"></div>
    <div class="fw-body" id="fw-body"></div>
    <div class="fw-footer">
      <div class="fw-input-row"><input type="text" class="fw-input" id="in-g" placeholder="新组名"><button class="fw-btn" id="add-g">＋组</button></div>
      <div class="fw-input-row"><input type="text" class="fw-input" id="in-p" placeholder="粘贴路径或网址"><button class="fw-btn" id="add-p">添加</button></div>
    </div>
  </div>
`;
shadow.appendChild(root);

// --- 核心工具函数 ---

function isURL(str) {
  return /^(https?:\/\/|www\.)/i.test(str);
}

function launch(path) {
  const clean = path.replace(/^"(.*)"$/, '$1').trim();
  if (isURL(clean)) {
    let url = clean.toLowerCase().startsWith('www.') ? 'https://' + clean : clean;
    window.open(url, '_blank');
  } else {
    const b64 = btoa(encodeURIComponent(clean).replace(/%([0-9A-F]{2})/g, (m, p) => String.fromCharCode('0x' + p)));
    window.location.href = `runapp://open?path=${encodeURIComponent(b64)}`;
  }
}

function addNewPath(value) {
  const v = value.trim();
  if(!v) return;
  chrome.storage.local.get(['config'], (res) => {
    let config = res.config || { groups: { "默认": [] } };
    config.groups[currentGroup].push(v);
    chrome.storage.local.set({ config }, () => {
      shadow.querySelector('#in-p').value = '';
      renderUI();
      const btn = shadow.querySelector('#add-p');
      btn.classList.add('pulse');
      setTimeout(() => btn.classList.remove('pulse'), 300);
    });
  });
}

// 粘贴自动添加
const pathInput = shadow.querySelector('#in-p');
pathInput.addEventListener('paste', () => setTimeout(() => addNewPath(pathInput.value), 50));

function preventHijack(el) {
  el.addEventListener('keydown', e => e.stopPropagation());
  el.addEventListener('keyup', e => e.stopPropagation());
  el.addEventListener('mousedown', e => e.stopPropagation());
  el.addEventListener('click', e => e.stopPropagation());
  el.addEventListener('contextmenu', e => e.stopPropagation());
}
shadow.querySelectorAll('.fw-input').forEach(preventHijack);

function renderUI() {
  chrome.storage.local.get(['config'], (res) => {
    const config = res.config || { groups: { "默认": [] } };
    if (!config.groups[currentGroup]) currentGroup = Object.keys(config.groups)[0] || "默认";

    const tabBox = shadow.querySelector('#fw-tabs');
    tabBox.innerHTML = '';
    Object.keys(config.groups).forEach(g => {
      const tab = document.createElement('div');
      tab.className = 'fw-tab';
      tab.style.background = g === currentGroup ? '#111827' : '#f3f4f6';
      tab.style.color = g === currentGroup ? '#fff' : '#4b5563';
      tab.innerHTML = `<span>${g}</span>${g !== '默认' ? '<div class="fw-group-del">×</div>' : ''}`;
      tab.onclick = () => { currentGroup = g; renderUI(); };
      const del = tab.querySelector('.fw-group-del');
      if(del) del.onclick = (e) => { e.stopPropagation(); if(confirm(`删除组 [${g}]?`)) { delete config.groups[g]; currentGroup="默认"; chrome.storage.local.set({config}, renderUI); }};
      tabBox.appendChild(tab);
    });

    const body = shadow.querySelector('#fw-body');
    body.innerHTML = '';
    (config.groups[currentGroup] || []).forEach((path, idx) => {
      const card = document.createElement('div');
      card.className = 'fw-card';
      const isWeb = isURL(path);
      const fileName = isWeb ? path.replace(/https?:\/\//i, '') : (path.split(/[\\/]/).pop().replace(/"/g, "") || path);
      
      card.innerHTML = `
        <div class="fw-dot ${isWeb ? 'web' : ''}"></div>
        <div class="fw-name" title="${path}">${fileName}</div>
        <div class="fw-del-item">×</div>
      `;
      
      card.onclick = (e) => {
        if(card.querySelector('.fw-edit-input')) return;
        if(e.target.className === 'fw-del-item') {
          config.groups[currentGroup].splice(idx, 1);
          chrome.storage.local.set({config}, renderUI);
        } else { launch(path); }
      };

      card.oncontextmenu = (e) => {
        e.preventDefault(); e.stopPropagation();
        if(card.querySelector('.fw-edit-input')) return;
        const editInp = document.createElement('input');
        editInp.className = 'fw-edit-input';
        editInp.value = path;
        preventHijack(editInp);
        card.appendChild(editInp);
        editInp.focus();
        const save = () => {
          const newVal = editInp.value.trim();
          if(newVal && newVal !== path) {
            config.groups[currentGroup][idx] = newVal;
            chrome.storage.local.set({config}, renderUI);
          } else { editInp.remove(); }
        };
        editInp.onblur = save;
        editInp.onkeydown = (ke) => { if(ke.key === 'Enter') save(); if(ke.key === 'Escape') editInp.remove(); };
      };
      body.appendChild(card);
    });
  });
}

// --- 交互增强：Q + E 快捷键监听 ---
document.addEventListener('keydown', (e) => {
  // 如果当前焦点在输入框，不触发快捷键
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

  const key = e.key.toLowerCase();
  if (lastKey === 'q' && key === 'e') {
    root.classList.toggle('show');
    if(root.classList.contains('show')) renderUI();
    lastKey = ""; // 触发后清空
    e.preventDefault();
  } else {
    lastKey = key;
    // 500ms 内不按第二个键则清空序列
    setTimeout(() => { if(lastKey === key) lastKey = ""; }, 500);
  }
});

// 拖拽逻辑
const header = shadow.querySelector('#fw-header');
const onMouseMove = (e) => {
  if (!isDragging) return;
  requestAnimationFrame(() => {
    root.style.left = (e.clientX - startX) + 'px';
    root.style.top = (e.clientY - startY) + 'px';
    root.style.right = 'auto';
  });
};
const onMouseUp = () => {
  isDragging = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};
header.addEventListener('mousedown', (e) => {
  if (e.target.id === 'fw-x') return;
  isDragging = true;
  startX = e.clientX - root.offsetLeft;
  startY = e.clientY - root.offsetTop;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

shadow.querySelector('#add-g').onclick = () => {
  const v = shadow.querySelector('#in-g').value.trim();
  if(!v) return;
  chrome.storage.local.get(['config'], (res) => {
    let config = res.config || { groups: { "默认": [] } };
    config.groups[v] = [];
    chrome.storage.local.set({ config }, () => { currentGroup = v; shadow.querySelector('#in-g').value = ''; renderUI(); });
  });
};
shadow.querySelector('#add-p').onclick = () => addNewPath(shadow.querySelector('#in-p').value);
shadow.querySelector('#fw-x').onclick = () => root.classList.remove('show');

chrome.runtime.onMessage.addListener((m) => { if(m.action === "toggle") { root.classList.toggle('show'); renderUI(); }});
renderUI();