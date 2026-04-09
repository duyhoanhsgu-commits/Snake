# 📁 Cấu trúc dự án sau khi tách nhỏ

## 🎯 Tổng quan

Dự án đã được tái cấu trúc từ 1 file `game.js` lớn (1550 dòng) thành nhiều module nhỏ, dễ quản lý và bảo trì hơn.

## 📂 Cấu trúc thư mục

```
ran-san-moi/
├── index.html                  # File HTML chính
├── css/
│   └── style.css              # Styling
├── js/
│   ├── config.js              # Cấu hình game (grid size, speed, etc.)
│   ├── constants.js           # Hằng số (topics, items)
│   ├── utils.js               # Các hàm tiện ích
│   │
│   ├── audio-manager.js       # ✨ Quản lý âm thanh
│   ├── snake-manager.js       # 🐍 Quản lý logic rắn
│   ├── food-manager.js        # 🍎 Quản lý thức ăn
│   ├── question-manager.js    # 📚 Quản lý câu hỏi
│   ├── ui-manager.js          # 🎨 Quản lý UI
│   ├── collision-manager.js   # 💥 Quản lý va chạm
│   ├── input-controller.js    # ⌨️ Quản lý input (keyboard, touch)
│   ├── ai-controller.js       # 🤖 Quản lý AI
│   ├── renderer.js            # 🖼️ Quản lý vẽ đồ họa
│   │
│   ├── game-new.js            # 🎮 Game chính (đã tối ưu)
│   └── game.js                # 📦 File cũ (backup)
│
├── assets/                     # Tài nguyên (hình ảnh, âm thanh, dữ liệu)
├── README.md                   # Hướng dẫn chơi game
└── STRUCTURE.md               # File này - giải thích cấu trúc

```

## 🔧 Chi tiết các module

### 1. **config.js** - Cấu hình
- Kích thước grid
- Tốc độ game
- Cấu hình theo độ khó (easy, medium, hard)

### 2. **constants.js** - Hằng số
- Danh sách topics (chủ đề game)
- Danh sách items (trái cây, bom)

### 3. **utils.js** - Tiện ích
- Hàm điều chỉnh độ sáng màu
- Hàm phát âm thanh

### 4. **audio-manager.js** ✨ - Quản lý âm thanh
**Chức năng:**
- Load và quản lý file âm thanh
- Phát âm thanh khi ăn đúng/sai

**Class:** `AudioManager`
- `play(type)` - Phát âm thanh

### 5. **snake-manager.js** 🐍 - Quản lý rắn
**Chức năng:**
- Tạo rắn mới
- Di chuyển rắn
- Kiểm tra va chạm
- Tăng/giảm độ dài rắn

**Class:** `SnakeManager` (static methods)
- `createSnake()` - Tạo rắn
- `moveSnake()` - Di chuyển
- `growSnake()` - Tăng độ dài
- `shrinkSnake()` - Giảm độ dài
- `checkCollision()` - Kiểm tra va chạm

### 6. **food-manager.js** 🍎 - Quản lý thức ăn
**Chức năng:**
- Spawn thức ăn (trái cây, bom)
- Spawn sách (câu hỏi)
- Kiểm tra rắn ăn thức ăn

**Class:** `FoodManager` (static methods)
- `spawnFood()` - Tạo thức ăn
- `spawnBook()` - Tạo sách
- `checkFoodCollision()` - Kiểm tra ăn thức ăn

### 7. **question-manager.js** 📚 - Quản lý câu hỏi
**Chức năng:**
- Load câu hỏi từ JSON
- Hiển thị modal câu hỏi
- Xử lý trả lời

**Class:** `QuestionManager` (static methods)
- `loadQuestions()` - Load câu hỏi
- `showQuestion()` - Hiển thị câu hỏi
- `hideQuestion()` - Ẩn modal

### 8. **ui-manager.js** 🎨 - Quản lý UI
**Chức năng:**
- Cập nhật độ dài rắn
- Cập nhật trạng thái (choáng, hồi sinh)
- Cập nhật timer
- Hiển thị game over
- Xử lý touch controls

**Class:** `UIManager` (static methods)
- `updateUI()` - Cập nhật UI
- `updateStatus()` - Cập nhật trạng thái
- `updateTimer()` - Cập nhật đồng hồ
- `showGameOver()` - Hiển thị kết thúc
- `setupTouchControls()` - Thiết lập touch
- `turnSnakeRelative()` - Rẽ trái/phải

### 9. **collision-manager.js** 💥 - Quản lý va chạm
**Chức năng:**
- Kiểm tra va chạm tường
- Kiểm tra va chạm thân rắn
- Kiểm tra va chạm giữa các rắn

**Class:** `CollisionManager`
- `checkCollisions()` - Kiểm tra tất cả va chạm
- `getSnakeName()` - Lấy tên rắn

### 10. **input-controller.js** ⌨️ - Quản lý input
**Chức năng:**
- Xử lý keyboard (Arrow keys, WASD)
- Xử lý touch/click (mobile)
- Cooldown để tránh spam

**Class:** `InputController`
- `setupKeyboard()` - Thiết lập phím
- `setupTouchControls()` - Thiết lập touch
- `turnSnakeRelative()` - Rẽ trái/phải

### 11. **ai-controller.js** 🤖 - Quản lý AI
**Chức năng:**
- Tìm đường đến thức ăn
- Tránh va chạm
- Tránh bom
- Có tỷ lệ sai sót theo độ khó

**Class:** `AIController`
- `updateAI()` - Cập nhật hướng đi AI
- `findSafeDirection()` - Tìm hướng an toàn
- `wouldCollide()` - Kiểm tra va chạm
- `isWrongFood()` - Kiểm tra bom

### 12. **renderer.js** 🖼️ - Quản lý vẽ
**Chức năng:**
- Vẽ canvas
- Vẽ rắn (đầu + thân)
- Vẽ thức ăn
- Vẽ marker hồi sinh
- Hiệu ứng (nhấp nháy, to lên)

**Class:** `Renderer`
- `clear()` - Xóa canvas
- `drawSnake()` - Vẽ rắn
- `drawFoods()` - Vẽ thức ăn
- `drawRespawnMarkers()` - Vẽ marker hồi sinh
- `adjustBrightness()` - Điều chỉnh màu

### 13. **game-new.js** 🎮 - Game chính
**Chức năng:**
- Khởi tạo game
- Quản lý game loop
- Điều phối các module
- Xử lý menu
- Xử lý game over

**Class:** `Game`
- `constructor()` - Khởi tạo
- `start()` - Bắt đầu game
- `update()` - Cập nhật game
- `render()` - Vẽ game
- `reset()` - Reset game
- `gameOver()` - Kết thúc game

## 🔄 Luồng hoạt động

```
1. Load trang
   ↓
2. Khởi tạo Game
   ↓
3. Hiển thị Menu
   ↓
4. Người chơi chọn:
   - Độ khó (easy/medium/hard)
   - Chế độ (1 người / 2 người)
   - Tốc độ & thời gian
   ↓
5. Bắt đầu game
   ↓
6. Game Loop:
   - InputController: Nhận input
   - AIController: Tính toán AI
   - SnakeManager: Di chuyển rắn
   - CollisionManager: Kiểm tra va chạm
   - FoodManager: Quản lý thức ăn
   - Renderer: Vẽ đồ họa
   ↓
7. Kết thúc game
   ↓
8. Hiển thị kết quả
```

## ✅ Lợi ích của việc tách nhỏ

### 1. **Dễ đọc và hiểu**
- Mỗi file có trách nhiệm rõ ràng
- Code ngắn gọn, dễ theo dõi

### 2. **Dễ bảo trì**
- Sửa lỗi ở 1 module không ảnh hưởng module khác
- Dễ tìm bug

### 3. **Dễ mở rộng**
- Thêm tính năng mới dễ dàng
- Có thể thay thế module mà không ảnh hưởng toàn bộ

### 4. **Tái sử dụng**
- Các module có thể dùng cho dự án khác
- Ví dụ: AudioManager, InputController

### 5. **Làm việc nhóm**
- Nhiều người có thể làm việc trên các module khác nhau
- Giảm conflict khi merge code

## 🚀 Cách sử dụng

### Chạy game với cấu trúc mới:
```bash
# Mở index.html (đã cập nhật để load các file mới)
```

### Quay lại phiên bản cũ:
```bash
# Sửa index.html, thay:
# <script src="js/game-new.js"></script>
# thành:
# <script src="js/game.js"></script>
```

## 📝 Ghi chú

- File `game.js` cũ vẫn được giữ lại để backup
- File `game-new.js` là phiên bản tối ưu, sử dụng các module
- Tất cả tính năng đều giữ nguyên, chỉ tái cấu trúc code

## 🎯 Kết luận

Dự án đã được tách từ **1 file 1550 dòng** thành **13 module nhỏ**, mỗi module có trách nhiệm rõ ràng, dễ quản lý và bảo trì hơn rất nhiều!
