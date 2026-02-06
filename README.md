# 🚀 FloatWaunch Elite v2.3
> **网页级悬浮启动器 · 打破浏览器边界** > *Created By fw*（注：使用gemini3.0一同完成

![Version](https://img.shields.io/badge/Version-2.3_Elite-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge)

---

## ✨ 项目简介

**FloatWaunch Elite** 是一款为极致效率而生的浏览器扩展。它不仅是一个网页侧边栏，更是一个连接网页与本地系统的“任意门”。通过 Shadow DOM 物理隔离技术，它能在不破坏任何网页原有样式的环境下，为你提供极速的路径跳转与程序启动体验。

### 💎 核心特性
* **⌨️ Q + E 极速唤起**：非输入框状态下，快速顺序按下 `Q` 和 `E`，面板瞬间闪现。
* **🔗 跨界启动**：自动识别本地文件路径 (C:\...) 与 Web 链接 (https://...)。
* **🛡️ Shadow DOM 隔离**：完美兼容 LimeStart、各类动态壁纸页，样式绝不冲突。
* **🖱️ 右键即编辑**：无需进入设置页，直接在卡片上点击右键即可实时修改路径。

---

## 📥 快速下载

> **重要：** 如果你是普通用户，请直接下载封装好的安装包。


---

## 🛠️ 安装指南 (极速 3 步)

### 1. 运行环境配置
运行下载好的 `FloatWaunch_Installer.exe`。它会自动完成以下工作：
* 拉取最新远程源码。
* 在本地构建 `bridge.exe` 核心引擎。
* 注册 Windows 系统级 `runapp://` 协议。

### 2. 加载浏览器扩展
1.  在 Chrome / Edge 地址栏输入 `chrome://extensions/`。
2.  开启右上角的 **[开发者模式]**。
3.  点击 **[加载已解压的扩展程序]**，选择安装目录下的 `extension` 文件夹。

### 3. 开始使用
在任意网页，依次按下 `Q` 和 `E` 键即可开启你的效率之旅。

---

## 📂 仓库目录说明

```text
FloatWaunch/
├── extension/             # 浏览器扩展源码
│   ├── manifest.json      # 配置文件 (v2.3)
│   ├── content.js         # 注入逻辑 (Q+E 监听 & UI 渲染)
│   ├── background.js      # 后台通信
│   └── icon.png           # 精致黑底白字 FW 图标
├── bridge.py              # Python 后端源码
├── setup_fw_pro.py        # 专业版安装器源码

└── README.md              # 项目说明书
