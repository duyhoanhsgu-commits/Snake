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
    
    setupTouchControls(onTurn) {
        this.canvas.addEventListener('touchstart', (e) => {
            const now = Date.now();
            if (now - this.lastTouchTime < this.touchCooldown) return;
            this.lastTouchTime = now;
            
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const screenCenter = rect.width / 2;
            const isTouchLeft = touchX < screenCenter;
            
            onTurn(isTouchLeft);
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const screenCenter = rect.width / 2;
            const isClickLeft = clickX < screenCenter;
            
            onTurn(isClickLeft);
        });
    }
    
    static turnSnakeRelative(snake, turnLeft) {
        const dir = snake.direction;
        
        if (turnLeft) {
            if (dir.x === 1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: -1};
            } else if (dir.x === -1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: 1};
            } else if (dir.x === 0 && dir.y === -1) {
                snake.nextDirection = {x: -1, y: 0};
            } else if (dir.x === 0 && dir.y === 1) {
                snake.nextDirection = {x: 1, y: 0};
            }
        } else {
            if (dir.x === 1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: 1};
            } else if (dir.x === -1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: -1};
            } else if (dir.x === 0 && dir.y === -1) {
                snake.nextDirection = {x: 1, y: 0};
            } else if (dir.x === 0 && dir.y === 1) {
                snake.nextDirection = {x: -1, y: 0};
            }
        }
    }
}
