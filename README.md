# 🐍 Rắn Tri Thức - Game Rắn Săn Mồi Thông Minh

Game rắn săn mồi với AI thông minh, đồ họa đẹp mắt và gameplay hấp dẫn!

## 🎮 Tính năng

### 🎯 Chế độ chơi
- **1 Người vs AI**: Đối đầu với AI thông minh
- **2 Người vs AI**: Hai người chơi cùng đối đầu với AI

### 🤖 3 Cấp độ AI
- **😊🌱🐢 Rắn AI Mới Vào Nghề**: Dễ dàng, phù hợp người mới
- **😐⚡🎯 Rắn AI Chuyên Nghiệp**: Trung bình, thử thách hơn
- **😈🔥💀 Rắn AI Huyền Thoại**: Khó, AI cực kỳ thông minh

### 🍎 Gameplay
- **Trái cây thường** (🍎🍊🍌🍇🍓🍑🍉🥝): +1 đốt
- **Trái cây bự** ⭐ (spawn mỗi 5 giây): +3 đốt
- **Bom** 💣: -2 đốt + choáng 2 giây

### ⚙️ Tùy chỉnh
- **Tốc độ game**: 5 mức từ chậm đến rất nhanh
- **Thời gian chơi**: 30-300 giây (có thể điều chỉnh)

### 🎨 Đặc điểm nổi bật
- ✨ Hiệu ứng đồ họa mượt mà
- 🎯 AI thông minh với 3 cấp độ khác nhau
- 💫 Hiệu ứng to lên khi ăn mồi
- 🛡️ Bất tử 1 giây sau khi hồi sinh
- 🌈 Màu sắc rực rỡ, dễ phân biệt
- 📱 Responsive, chơi được trên mọi thiết bị

## 🎮 Cách chơi

### Bước 1: Chọn đối thủ
Chọn cấp độ AI bạn muốn đối đầu

### Bước 2: Chọn chế độ
- 1 Người vs AI
- 2 Người vs AI

### Bước 3: Cài đặt
- Chọn tốc độ game
- Chọn thời gian chơi

### Điều khiển
- **Người chơi 1**: Phím mũi tên ← ↑ → ↓
- **Người chơi 2**: Phím W A S D

## 🏆 Cách thắng

Khi hết thời gian, rắn nào dài nhất sẽ thắng!

## 🚀 Cài đặt & Chạy

### Cách 1: Mở trực tiếp
```bash
# Mở file index.html bằng trình duyệt
```

### Cách 2: Dùng HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Sau đó mở: http://localhost:8000
```

### Cách 3: Live Server (VS Code)
```bash
# Cài extension Live Server
# Click chuột phải vào index.html > Open with Live Server
```

## 📁 Cấu trúc thư mục

```
ran-san-moi/
├── index.html          # File HTML chính
├── css/
│   └── style.css      # File CSS styling
├── js/
│   └── game.js        # Logic game
└── README.md          # File này
```

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và animation
- **JavaScript**: Logic game và AI
- **Canvas API**: Vẽ đồ họa game

## 🎯 Tính năng AI

AI được lập trình với các đặc điểm:
- Tìm đường đến thức ăn gần nhất
- Tránh va chạm tường và thân rắn
- Tránh bom và thức ăn sai
- Có tỷ lệ sai sót khác nhau theo cấp độ:
  - Dễ: 45% sai sót
  - Trung bình: 20% sai sót
  - Khó: 5% sai sót

## 🎨 Màu sắc

- **Người chơi 1**: Xanh dương (#2196F3)
- **Người chơi 2**: Xanh lá (#4CAF50)
- **AI**: Đỏ (#f44336)
- **Trái cây**: Xanh lá (#4CAF50)
- **Bom**: Đỏ (#f44336)

## 📝 Ghi chú

- Game tự động spawn thức ăn mỗi giây
- Trái cây bự xuất hiện mỗi 5 giây
- Rắn hồi sinh sau 3 giây khi chết
- Có hiệu ứng bất tử 1 giây sau khi hồi sinh

## 🐛 Báo lỗi

Nếu gặp lỗi, vui lòng kiểm tra:
1. Trình duyệt hỗ trợ HTML5 Canvas
2. JavaScript đã được bật
3. File đã được load đầy đủ

## 📜 License

Free to use - Học tập và giải trí

## 👨‍💻 Tác giả

Game được phát triển với ❤️ bởi AI Assistant

---

**Chúc bạn chơi game vui vẻ! 🎮🐍**
