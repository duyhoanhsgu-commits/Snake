# 🔄 Hướng dẫn sử dụng cấu trúc mới

## ✅ Đã hoàn thành

Dự án đã được tái cấu trúc thành công! File `game.js` cũ (1550 dòng) đã được tách thành 13 module nhỏ.

## 📦 Các file mới được tạo

1. **js/audio-manager.js** - Quản lý âm thanh
2. **js/ai-controller.js** - Quản lý AI
3. **js/input-controller.js** - Quản lý input
4. **js/collision-manager.js** - Quản lý va chạm
5. **js/renderer.js** - Quản lý vẽ đồ họa

## 🔧 File đã cập nhật

- **js/game.js** - Game chính (đã được tái cấu trúc, sử dụng các module)
- **index.html** - Đã cập nhật để load các file mới theo đúng thứ tự

## 🚀 Cách sử dụng

Chỉ cần mở `index.html` như bình thường:

```bash
# Mở index.html trực tiếp
# Hoặc dùng Live Server / HTTP Server
python3 -m http.server 8000
```

## 🎯 So sánh

### Trước (1 file):
```
js/game.js (1550 dòng)
- Khó đọc
- Khó bảo trì
- Khó mở rộng
```

### Sau (13 module):
```
js/
├── config.js (50 dòng)
├── constants.js (30 dòng)
├── utils.js (20 dòng)
├── audio-manager.js (20 dòng)
├── snake-manager.js (60 dòng)
├── food-manager.js (70 dòng)
├── question-manager.js (60 dòng)
├── ui-manager.js (100 dòng)
├── collision-manager.js (60 dòng)
├── input-controller.js (80 dòng)
├── ai-controller.js (150 dòng)
├── renderer.js (150 dòng)
└── game.js (400 dòng)

Tổng: ~1250 dòng (giảm 300 dòng code trùng lặp)
```

## ✨ Lợi ích

1. **Dễ đọc**: Mỗi file có mục đích rõ ràng
2. **Dễ sửa lỗi**: Biết chính xác file nào cần sửa
3. **Dễ mở rộng**: Thêm tính năng mới không ảnh hưởng code cũ
4. **Tái sử dụng**: Các module có thể dùng cho dự án khác
5. **Làm việc nhóm**: Nhiều người có thể làm việc song song

## 🐛 Nếu gặp lỗi

1. Kiểm tra console (F12) để xem lỗi
2. Đảm bảo tất cả file được load đúng thứ tự trong `index.html`
3. Xóa cache trình duyệt (Ctrl + Shift + R hoặc Cmd + Shift + R)

## 📚 Tài liệu

- Xem **STRUCTURE.md** để hiểu chi tiết cấu trúc
- Xem **README.md** để biết cách chơi game

## 🎉 Kết luận

Dự án đã được tái cấu trúc thành công! Bạn có thể tiếp tục phát triển với cấu trúc mới, dễ quản lý hơn rất nhiều.
