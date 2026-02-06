import os
import sys
import subprocess
import winreg
import ctypes
import urllib.request
import zipfile
import shutil
import time
import tkinter as tk
from tkinter import filedialog, messagebox

# --- 配置区 (请在打包前修改为你自己的 Gitee 链接) ---
GITEE_ZIP_URL = "https://gitee.com/你的用户名/仓库名/repository/archive/master.zip"
REPO_NAME_IN_ZIP = "FloatWaunch-master"

class FWInstaller:
    def __init__(self):
        self.install_dir = ""
        self.exe_final_path = ""

    def is_admin(self):
        try: return ctypes.windll.shell32.IsUserAnAdmin()
        except: return False

    def select_path(self):
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        path = filedialog.askdirectory(title="选择 FloatWaunch Elite 安装目录")
        root.destroy()
        return path

    def log(self, text):
        print(f"[*] {text}")

    def run_command(self, cmd):
        return subprocess.run(cmd, shell=True, capture_output=True, text=True)

    def start(self):
        print("="*50)
        print("   FloatWaunch Elite v2.3 专业版安装程序")
        print("   Status: Professional Deployment Mode")
        print("="*50 + "\n")

        # 1. 路径选择
        self.install_dir = self.select_path()
        if not self.install_dir:
            print("[-] 安装已取消"); return
        
        full_path = os.path.join(self.install_dir, "FloatWaunch")
        if not os.path.exists(full_path): os.makedirs(full_path)
        os.chdir(full_path)
        self.log(f"锁定安装目录: {full_path}")

        # 2. 拉取源码
        self.log("正在同步远程仓库源码...")
        try:
            urllib.request.urlretrieve(GITEE_ZIP_URL, "source.zip")
            with zipfile.ZipFile("source.zip", 'r') as zip_ref:
                zip_ref.extractall("temp")
            
            src_path = os.path.join("temp", REPO_NAME_IN_ZIP)
            if not os.path.exists(src_path):
                src_path = os.path.join("temp", os.listdir("temp")[0])
            
            for item in os.listdir(src_path):
                target = os.path.join(".", item)
                if os.path.exists(target):
                    if os.path.isdir(target): shutil.rmtree(target)
                    else: os.remove(target)
                shutil.move(os.path.join(src_path, item), ".")
            
            os.remove("source.zip")
            shutil.rmtree("temp")
            self.log("源码同步完成")
        except Exception as e:
            print(f"❌ 同步失败: {e}"); return

        # 3. 构建后端 (本地编译以确保对当前系统的完美兼容)
        self.log("正在构建本地后端引擎 (PyInstaller)...")
        self.run_command("pip install pyinstaller -i https://pypi.tuna.tsinghua.edu.cn/simple")
        
        build_res = self.run_command("pyinstaller --onefile --noconsole bridge.py")
        if build_res.returncode == 0:
            self.exe_final_path = os.path.abspath(os.path.join("dist", "bridge.exe")).replace("\\", "\\\\")
            self.log("后端引擎构建成功")
        else:
            print("❌ 构建引擎失败，请检查环境"); return

        # 4. 注入注册表协议
        self.log("注入 runapp:// 协议到系统注册表...")
        try:
            key_path = "SOFTWARE\\Classes\\runapp"
            with winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path) as key:
                winreg.SetValue(key, "", winreg.REG_SZ, "URL:FloatWaunch Protocol")
                winreg.SetValueEx(key, "URL Protocol", 0, winreg.REG_SZ, "")
            
            cmd_path = f"{key_path}\\shell\\open\\command"
            with winreg.CreateKey(winreg.HKEY_CURRENT_USER, cmd_path) as key:
                winreg.SetValue(key, "", winreg.REG_SZ, f'"{self.exe_final_path}" "%1"')
            self.log("注册表协议激活成功")
        except Exception as e:
            print(f"❌ 注册表操作失败: {e}"); return

        # 5. 完成提示
        self.log("清理临时构建缓存...")
        if os.path.exists("build"): shutil.rmtree("build")
        
        print("\n" + "★"*40)
        print("✅ FloatWaunch Elite 部署完成！")
        print("★"*40)
        
        messagebox.showinfo("安装成功", f"FloatWaunch Elite 已就绪！\n\n请在 Chrome 中加载扩展目录:\n{os.path.join(full_path, 'extension')}")

        if messagebox.askyesno("最后一步", "是否立即重启 Chrome 以激活插件？"):
            os.system("taskkill /F /IM chrome.exe /T")
            time.sleep(1)
            os.system("start chrome")

if __name__ == "__main__":
    installer = FWInstaller()
    if not installer.is_admin():
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, __file__, None, 1)
    else:
        installer.start()