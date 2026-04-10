// Quản lý input từ người chơi

class InputController {
    constructor(canvas) {
        this.canvas = canvas;
        this.lastTouchTime = 0;
        this.touchCooldown = 100;
    }
    
    setupKeyboard(onKeyPress) {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) || 
                ['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
            onKeyPress(e.key, key);
        });
    }
    
    setupTouchControls(onDirectionChange) {
        // Touch control
        this.canvas.addEventListener('touchstart', (e) => {
            const now = Date.now();
            if (now - this.lastTouchTime < this.touchCooldown) return;
            this.lastTouchTime = now;
            
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            onDirectionChange(touchX, touchY);
        });
        
        // Mouse click control
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            onDirectionChange(clickX, clickY);
        });
    }
    
    static setSnakeDirectionToPoint(snake, targetX, targetY, cellSize) {
        // Lấy vị trí đầu rắn (pixel)
        const head = snake.body[0];
        const headPixelX = head.x * cellSize + cellSize / 2;
        const headPixelY = head.y * cellSize + cellSize / 2;
        
        // Tính vector từ đầu rắn đến điểm click
        const dx = targetX - headPixelX;
        const dy = targetY - headPixelY;
        
        const currentDir = snake.direction;
        
        // Ưu tiên hướng có khoảng cách lớn hơn
        if (Math.abs(dx) > Math.abs(dy)) {
            // Ưu tiên đi ngang (trái/phải)
            if (dx > 0 && currentDir.x !== -1) {
                // Click bên phải → đi sang phải
                snake.nextDirection = {x: 1, y: 0};
            } else if (dx < 0 && currentDir.x !== 1) {
                // Click bên trái → đi sang trái
                snake.nextDirection = {x: -1, y: 0};
            } else {
                // Không thể đi ngang, thử đi dọc
                if (dy > 0 && currentDir.y !== -1) {
                    snake.nextDirection = {x: 0, y: 1};
                } else if (dy < 0 && currentDir.y !== 1) {
                    snake.nextDirection = {x: 0, y: -1};
                }
            }
        } else {
            // Ưu tiên đi dọc (lên/xuống)
            if (dy > 0 && currentDir.y !== -1) {
                // Click bên dưới → đi xuống
                snake.nextDirection = {x: 0, y: 1};
            } else if (dy < 0 && currentDir.y !== 1) {
                // Click bên trên → đi lên
                snake.nextDirection = {x: 0, y: -1};
            } else {
                // Không thể đi dọc, thử đi ngang
                if (dx > 0 && currentDir.x !== -1) {
                    snake.nextDirection = {x: 1, y: 0};
                } else if (dx < 0 && currentDir.x !== 1) {
                    snake.nextDirection = {x: -1, y: 0};
                }
            }
        }
    }
}
