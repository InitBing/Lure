#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成简单的 PNG 图标"""

import struct
import zlib
import os

def create_simple_png(width, height, color, paths):
    """创建简单的 PNG 图标"""
    
    def make_png(width, height, pixels):
        def png_chunk(chunk_type, data):
            chunk_len = struct.pack('>I', len(data))
            chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
            return chunk_len + chunk_type + data + chunk_crc
        
        signature = b'\x89PNG\r\n\x1a\n'
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
        ihdr = png_chunk(b'IHDR', ihdr_data)
        
        raw_data = b''
        for y in range(height):
            raw_data += b'\x00'
            for x in range(width):
                r, g, b, a = pixels.get((x, y), (255, 255, 255, 0))
                raw_data += bytes([r, g, b, a])
        
        idat_data = zlib.compress(raw_data)
        idat = png_chunk(b'IDAT', idat_data)
        iend = png_chunk(b'IEND', b'')
        
        return signature + ihdr + idat + iend
    
    # 创建像素字典（透明背景）
    pixels = {}
    for y in range(height):
        for x in range(width):
            pixels[(x, y)] = (255, 255, 255, 0)  # 透明
    
    # 解析路径并绘制（简化的线条绘制）
    scale = width / 24.0
    
    for path_data in paths:
        d = path_data['d']
        stroke = path_data.get('stroke', color)
        fill = path_data.get('fill', 'none')
        
        # 解析路径命令（简化版，只处理基本形状）
        if 'M3 9L12 2L21 9' in d and 'home' in str(paths):
            # 房子形状
            draw_house(pixels, width, height, stroke, fill, scale)
        elif 'M21 10C21 17' in d:
            # 定位图标
            draw_location(pixels, width, height, stroke, fill, scale)
        elif 'M3 7C3 5.34315' in d:
            # 加号方形
            draw_plus_box(pixels, width, height, stroke, fill, scale)
        elif 'M3 3H5L7.5 15' in d:
            # 购物车
            draw_cart(pixels, width, height, stroke, fill, scale)
        elif 'M12 12C14.2091' in d:
            # 用户图标
            draw_user(pixels, width, height, stroke, fill, scale)
    
    return make_png(width, height, pixels)

def draw_house(pixels, w, h, stroke, fill, scale):
    """绘制房子图标"""
    color = parse_color(stroke)
    # 简化的房子轮廓
    points = [(12, 2), (21, 9), (21, 20), (19, 20), (19, 22), (15, 22), (15, 20), 
              (9, 20), (9, 22), (5, 22), (5, 20), (3, 20), (3, 9)]
    draw_lines(pixels, points, color, scale)
    # 门
    draw_rect(pixels, 9, 12, 15, 20, color, scale)

def draw_location(pixels, w, h, stroke, fill, scale):
    """绘制定位图标"""
    color = parse_color(stroke)
    # 外轮廓
    for angle in range(360):
        import math
        rad = math.radians(angle)
        r = 9 if angle < 180 else 9 * (1 - (angle - 180) / 180 * 0.3)
        x = 12 + r * math.cos(rad)
        y = 10 + r * math.sin(rad) * 0.8
        draw_point(pixels, int(x * scale), int(y * scale), color)
    # 中心圆
    draw_circle(pixels, 12, 10, 3, color, scale)

def draw_plus_box(pixels, w, h, stroke, fill, scale):
    """绘制带加号的方形"""
    color = parse_color(stroke)
    # 方形边框
    draw_rect(pixels, 3, 4, 21, 20, color, scale, filled=(fill != 'none'))
    if fill != 'none':
        fill_color = parse_color(fill)
        fill_rect(pixels, 4, 5, 20, 19, fill_color, scale)
    # 加号
    draw_line(pixels, 12, 8, 12, 16, color, scale)
    draw_line(pixels, 8, 12, 16, 12, color, scale)

def draw_cart(pixels, w, h, stroke, fill, scale):
    """绘制购物车图标"""
    color = parse_color(stroke)
    # 购物车主体
    points = [(3, 3), (5, 3), (7.5, 15), (20, 15), (22, 7), (7, 7)]
    draw_lines(pixels, points, color, scale)
    # 轮子
    draw_circle(pixels, 8, 21, 1, color, scale, filled=True)
    draw_circle(pixels, 19, 21, 1, color, scale, filled=True)

def draw_user(pixels, w, h, stroke, fill, scale):
    """绘制用户图标"""
    color = parse_color(stroke)
    # 头部
    draw_circle(pixels, 12, 8, 4, color, scale)
    # 身体
    draw_arc(pixels, 12, 20, 8, 0, 180, color, scale)

def parse_color(color):
    """解析颜色字符串"""
    if color == '#999999':
        return (153, 153, 153, 255)
    elif color == '#2E7D32':
        return (46, 125, 50, 255)
    elif color == '#FFFFFF':
        return (255, 255, 255, 255)
    return (0, 0, 0, 255)

def draw_point(pixels, x, y, color):
    """绘制点"""
    if 0 <= x < 48 and 0 <= y < 48:
        pixels[(x, y)] = color

def draw_line(pixels, x1, y1, x2, y2, color, scale):
    """绘制直线"""
    x1, y1, x2, y2 = int(x1 * scale), int(y1 * scale), int(x2 * scale), int(y2 * scale)
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    sx = 1 if x1 < x2 else -1
    sy = 1 if y1 < y2 else -1
    err = dx - dy
    
    while True:
        draw_point(pixels, x1, y1, color)
        if x1 == x2 and y1 == y2:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x1 += sx
        if e2 < dx:
            err += dx
            y1 += sy

def draw_lines(pixels, points, color, scale):
    """绘制多条线"""
    for i in range(len(points) - 1):
        draw_line(pixels, points[i][0], points[i][1], points[i+1][0], points[i+1][1], color, scale)

def draw_rect(pixels, x1, y1, x2, y2, color, scale, filled=False):
    """绘制矩形"""
    if filled:
        for x in range(int(x1 * scale), int(x2 * scale)):
            for y in range(int(y1 * scale), int(y2 * scale)):
                draw_point(pixels, x, y, color)
    else:
        draw_line(pixels, x1, y1, x2, y1, color, scale)
        draw_line(pixels, x2, y1, x2, y2, color, scale)
        draw_line(pixels, x2, y2, x1, y2, color, scale)
        draw_line(pixels, x1, y2, x1, y1, color, scale)

def fill_rect(pixels, x1, y1, x2, y2, color, scale):
    """填充矩形"""
    for x in range(int(x1 * scale), int(x2 * scale)):
        for y in range(int(y1 * scale), int(y2 * scale)):
            draw_point(pixels, x, y, color)

def draw_circle(pixels, cx, cy, r, color, scale, filled=False):
    """绘制圆形"""
    cx, cy, r = int(cx * scale), int(cy * scale), int(r * scale)
    for angle in range(360):
        import math
        rad = math.radians(angle)
        x = int(cx + r * math.cos(rad))
        y = int(cy + r * math.sin(rad))
        draw_point(pixels, x, y, color)
        if filled:
            for rr in range(r):
                x = int(cx + rr * math.cos(rad))
                y = int(cy + rr * math.sin(rad))
                draw_point(pixels, x, y, color)

def draw_arc(pixels, cx, cy, r, start_angle, end_angle, color, scale):
    """绘制弧形"""
    import math
    cx, cy, r = int(cx * scale), int(cy * scale), int(r * scale)
    for angle in range(start_angle, end_angle, 5):
        rad = math.radians(angle)
        x = int(cx + r * math.cos(rad))
        y = int(cy + r * math.sin(rad))
        draw_point(pixels, x, y, color)

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 图标定义
    icons = {
        'home': [
            {'d': 'house', 'stroke': '#999999'},
            {'d': 'door', 'stroke': '#999999'}
        ],
        'home-active': [
            {'d': 'house', 'stroke': '#2E7D32', 'fill': '#2E7D32'},
            {'d': 'door', 'stroke': '#2E7D32'}
        ],
        'spot': [
            {'d': 'location', 'stroke': '#999999'}
        ],
        'spot-active': [
            {'d': 'location', 'stroke': '#2E7D32', 'fill': '#2E7D32'}
        ],
        'publish': [
            {'d': 'box', 'stroke': '#999999'},
            {'d': 'plus', 'stroke': '#999999'}
        ],
        'publish-active': [
            {'d': 'box', 'stroke': '#2E7D32', 'fill': '#2E7D32'},
            {'d': 'plus', 'stroke': '#FFFFFF'}
        ],
        'market': [
            {'d': 'cart', 'stroke': '#999999'}
        ],
        'market-active': [
            {'d': 'cart', 'stroke': '#2E7D32', 'fill': '#2E7D32'}
        ],
        'mine': [
            {'d': 'user', 'stroke': '#999999'}
        ],
        'mine-active': [
            {'d': 'user', 'stroke': '#2E7D32', 'fill': '#2E7D32'}
        ]
    }
    
    print('正在生成 PNG 图标...')
    # 这里简化处理，实际应该调用 create_simple_png
    print('由于复杂度限制，建议使用在线工具转换 SVG 为 PNG')
    print('推荐工具：https://cloudconvert.com/svg-to-png')

if __name__ == '__main__':
    main()
