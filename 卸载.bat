@echo off
CHCP 65001
title FloatWaunch Elite 卸载程序
cls

echo ==================================================
echo         FloatWaunch Elite v2.3 自动卸载
echo ==================================================
echo.

:: 1. 检查管理员权限
echo [*] 正在检查系统权限...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 错误：请右键点击此文件，选择 "以管理员身份运行"
    pause
    exit
)

:: 2. 确认卸载
set /p choice=确定要卸载 FloatWaunch 并清理系统注册表吗？(Y/N): 
if /i "%choice%" neq "Y" exit

echo.
echo [*] 正在停止相关进程...
taskkill /F /IM bridge.exe /T >nul 2>&1

:: 3. 清理注册表协议
echo [*] 正在清理注册表协议 (runapp://)...
reg delete "HKEY_CURRENT_USER\SOFTWARE\Classes\runapp" /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ 注册表清理成功！
) else (
    echo [!] 注册表项不存在或已清理。
)

:: 4. 引导清理插件
echo.
echo --------------------------------------------------
echo 📥 后续步骤：
echo 1. 请在 Chrome 扩展管理页面手动移除 FloatWaunch 插件。
echo 2. 您现在可以安全地删除整个 FloatWaunch 文件夹了。
echo --------------------------------------------------
echo.
echo ✅ 卸载任务已完成。
pause