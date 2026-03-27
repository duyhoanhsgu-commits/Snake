# 🐍 Rắn Tri Thức: Cuộc Đua Phân Loại

Game rắn săn mồi kết hợp giáo dục với AI thông minh.

## 🎮 Tính năng

### Chế độ chơi
- **1 Người vs Bot**: Đấu với Bot AI thông minh
- **2 Người vs Bot**: 2 người chơi cùng đấu với Bot

### Điều khiển
- **Người chơi 1**: Phím mũi tên ← ↑ → ↓
- **Người chơi 2**: W A S D

### Cấp độ
- **Dễ**: Bot chậm, sai nhiều (45% sai)
- **Trung bình**: Bot cân bằng (20% sai)
- **Khó**: Bot thông minh, nhanh (5% sai)

### Gameplay
- Ăn đúng mồi theo chủ đề: +10 điểm, dài thêm 1 đốt
- Ăn sai bẫy: -5 điểm, choáng 2 giây
- Chết → thân rắn biến thành thức ăn
- Hồi sinh sau 3 giây tại vị trí ngẫu nhiên
- Thời gian tùy chỉnh: 30-300 giây

## 🎯 Chủ đề (10 topics)
1. Công thức Vật lý
2. Công thức Hóa học
3. Động vật có vú
4. Ngôn ngữ lập trình
5. Số chẵn/lẻ
6. Trái cây/Rau củ
7. Hình tròn/vuông

## 🚀 Chạy game

```bash
python3 -m http.server 8080
```

Mở trình duyệt: http://localhost:8080

## 📁 Cấu trúc

```
ran-san-moi/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── game.js
└── assets/
```
