#!/usr/bin/env python3
"""创建简单的 PNG 图标 - 使用纯 Python"""

import struct
import zlib
import math

def create_png(width, height, pixels_dict):
    """从像素字典创建 PNG"""
    def chunk(chunk_type, data):
        return (struct.pack('>I', len(data)) + chunk_type + data + 
                struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff))
    
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    
    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            raw += bytes(pixels_dict.get((x, y), (255, 255, 255, 0)))
    
    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')
    return signature + ihdr + idat + iend

def draw_line(pixels, x0, y0, x1, y1, color):
    """Bresenham 画线算法"""
    dx, dy = abs(x1 - x0), abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    err = dx - dy
    while True:
        if 0 <= x0 < 48 and 0 <= y0 < 48:
            pixels[(x0, y0)] = color
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy

def draw_circle(pixels, cx, cy, r, color, fill=False):
    """中点画圆算法"""
    x, y = 0, r
    d = 3 - 2 * r
    while x <= y:
        for dx in [-x, x]:
            for dy in [-y, y]:
                if fill:
                    for fy in range(cy + dy, cy + y + 1):
                        if 0 <= cx + dx < 48 and 0 <= fy < 48:
                            pixels[(cx + dx, fy)] = color
                if 0 <= cx + dx < 48 and 0 <= cy + dy < 48:
                    pixels[(cx + dx, cy + dy)] = color
                if 0 <= cx + dy < 48 and 0 <= cy + dx < 48:
                    pixels[(cx + dy, cy + dx)] = color
        x += 1
        if d > 0:
            y -= 1
            d += 4 * (x - y) + 10
        else:
            d += 4 * x + 6

def create_icon(icon_type, color_name):
    """创建图标"""
    colors = {
        'gray': (153, 153, 153, 255),
        'green': (46, 125, 50, 255),
        'white': (255, 255, 255, 255)
    }
    color = colors.get(color_name, colors['gray'])
    pixels = {}
    
    # 48x48 画布，透明背景
    scale = 2.0  # 24 -> 48
    
    if icon_type in ['home', 'home-active']:
        # 房子图标
        # 屋顶
        draw_line(pixels, 24, 4, 44, 20, color)
        draw_line(pixels, 44, 20, 44, 44, color)
        draw_line(pixels, 44, 44, 40, 44, color)
        draw_line(pixels, 40, 44, 40, 36, color)
        draw_line(pixels, 40, 36, 8, 36, color)
        draw_line(pixels, 8, 36, 8, 44, color)
        draw_line(pixels, 8, 44, 4, 44, color)
        draw_line(pixels, 4, 44, 4, 20, color)
        draw_line(pixels, 4, 20, 24, 4, color)
        # 门
        draw_line(pixels, 18, 28, 18, 44, color)
        draw_line(pixels, 18, 44, 30, 44, color)
        draw_line(pixels, 30, 44, 30, 28, color)
        if color_name == 'green':
            # 填充
            for x in range(19, 30):
                for y in range(29, 44):
                    pixels[(x, y)] = color
    
    elif icon_type in ['spot', 'spot-active']:
        # 定位图标
        draw_circle(pixels, 24, 20, 18, color)
        draw_circle(pixels, 24, 20, 6, color, fill=(color_name == 'green'))
        if color_name == 'green':
            for y in range(10, 30):
                for x in range(14, 34):
                    if (x-24)**2 + (y-20)**2 < 36:
                        pixels[(x, y)] = color
    
    elif icon_type in ['publish', 'publish-active']:
        # 方形边框
        draw_line(pixels, 6, 8, 6, 40, color)
        draw_line(pixels, 6, 40, 42, 40, color)
        draw_line(pixels, 42, 40, 42, 8, color)
        draw_line(pixels, 42, 8, 6, 8, color)
        # 加号
        draw_line(pixels, 24, 14, 24, 34, color)
        draw_line(pixels, 14, 24, 34, 24, color)
        if color_name == 'green':
            for x in range(7, 42):
                for y in range(9, 40):
                    pixels[(x, y)] = color
            # 白色加号
            white = colors['white']
            draw_line(pixels, 24, 14, 24, 34, white)
            draw_line(pixels, 14, 24, 34, 24, white)
    
    elif icon_type in ['market', 'market-active']:
        # 购物车
        draw_line(pixels, 6, 6, 10, 6, color)
        draw_line(pixels, 10, 6, 15, 32, color)
        draw_line(pixels, 15, 32, 40, 32, color)
        draw_line(pixels, 40, 32, 44, 14, color)
        draw_line(pixels, 44, 14, 14, 14, color)
        # 轮子
        draw_circle(pixels, 16, 42, 3, color, fill=(color_name == 'green'))
        draw_circle(pixels, 38, 42, 3, color, fill=(color_name == 'green'))
    
    elif icon_type in ['mine', 'mine-active']:
        # 头部
        draw_circle(pixels, 24, 16, 8, color, fill=(color_name == 'green'))
        # 身体
        for angle in range(0, 180, 3):
            rad = math.radians(angle)
            x = int(24 + 16 * math.cos(rad))
            y = int(36 + 16 * math.sin(rad))
            pixels[(x, y)] = color
            if color_name == 'green':
                for r in range(16):
                    xx = int(24 + r * math.cos(rad))
                    yy = int(36 + r * math.sin(rad))
                    if 0 <= xx < 48 and 0 <= yy < 48:
                        pixels[(xx, yy)] = color
    
    return create_png(48, 48, pixels)

def main():
    icons = [
        ('home', 'gray'), ('home-active', 'green'),
        ('spot', 'gray'), ('spot-active', 'green'),
        ('publish', 'gray'), ('publish-active', 'green'),
        ('market', 'gray'), ('market-active', 'green'),
        ('mine', 'gray'), ('mine-active', 'green'),
    ]
    
    for icon_name, color in icons:
        png_data = create_icon(icon_name, color)
        filename = f'{icon_name}.png'
        with open(filename, 'wb') as f:
            f.write(png_data)
        print(f'✓ 生成 {filename}')

if __name__ == '__main__':
    main()
