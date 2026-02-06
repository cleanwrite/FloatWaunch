import sys
import os
import base64
import ctypes
from urllib.parse import urlparse, parse_qs, unquote

def msg_box(title, text):
    """Windows 原生弹窗，用于报错提示"""
    ctypes.windll.user32.MessageBoxW(0, str(text), str(title), 0x30)

def main():
    # 调试用：如果没收到参数，直接弹窗
    if len(sys.argv) < 2:
        msg_box("FloatWaunch 错误", "未接收到协议参数！请检查注册表配置是否包含 \"%1\"")
        return

    # 接收到的原始字符串，例如 runapp://open?path=xxxx
    raw_url = sys.argv[1]

    try:
        # 1. 解析 URL 结构
        parsed_url = urlparse(raw_url)
        params = parse_qs(parsed_url.query)
        
        # 2. 获取 path 参数
        encoded_path = params.get('path', [None])[0]
        if not encoded_path:
            msg_box("错误", f"协议格式不正确，未找到 path 参数。\n接收内容: {raw_url}")
            return

        # 3. Base64 解码处理
        # 补齐 Base64 填充符号 =
        missing_padding = len(encoded_path) % 4
        if missing_padding:
            encoded_path += '=' * (4 - missing_padding)
            
        decoded_bytes = base64.b64decode(encoded_path)
        
        # 4. URL 解码并清理路径
        # 处理中文乱码并去掉可能存在的引号
        path = unquote(decoded_bytes.decode('utf-8')).strip('"')

        # 5. 执行启动
        if os.path.exists(path):
            os.startfile(path)
        else:
            msg_box("找不到文件", f"解码后的路径不存在:\n{path}")

    except Exception as e:
        msg_box("脚本执行异常", f"错误详情: {str(e)}\n原始数据: {raw_url}")

if __name__ == "__main__":
    main()