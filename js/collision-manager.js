// Quản lý va chạm

class CollisionManager {
    constructor(gridSizeX, gridSizeY) {
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
    }
    
    checkCollisions(allSnakes, onKillSnake) {
        allSnakes.forEach((snake, index) => {
            if (!snake || !snake.alive) return;
            
            // Kiểm tra bất tử
            const now = Date.now();
            if (snake.invincible && now < snake.invincibleUntil) {
                return;
            }
            
            const head = snake.body[0];
            const snakeName = this.getSnakeName(snake, index);
            
            // Đụng tường
            if (head.x < 0 || head.x >= this.gridSizeX || 
                head.y < 0 || head.y >= this.gridSizeY) {
                onKillSnake(snake, `${snakeName} đụng tường!`);
                return;
            }
            
            // Đụng thân mình
            for (let i = 1; i < snake.body.length; i++) {
                if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
                    onKillSnake(snake, `${snakeName} đụng thân mình!`);
                    return;
                }
            }
            
            // Đụng các rắn khác
            const otherSnakes = allSnakes.filter(s => s && s !== snake && s.alive);
            for (const other of otherSnakes) {
                for (let i = 0; i < other.body.length; i++) {
                    if (head.x === other.body[i].x && head.y === other.body[i].y) {
                        const otherName = this.getSnakeName(other, allSnakes.indexOf(other));
                        onKillSnake(snake, `${snakeName} đụng vào ${otherName}!`);
                        return;
                    }
                }
            }
        });
    }
    
    getSnakeName(snake, index) {
        if (snake.isBot) return 'AI';
        if (index === 0) return 'Người chơi 1';
        if (index === 2) return 'Người chơi 2';
        return 'Người chơi';
    }
}
