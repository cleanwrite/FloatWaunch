// 监听插件图标点击
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggle" }).catch(() => {});
});

// 【新增】监听系统快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" }).catch(() => {});
    });
  }
});

// 【核心：自动刷新逻辑】
// 当你点击 Chrome 插件管理页面的“刷新”按钮时，让所有打开了 FloatWaunch 的页面自动 F5
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "update" || details.reason === "install") {
    chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => { location.reload(); }
        }).catch(() => {}); // 忽略无法刷新的系统页面
      });
    });
  }
});