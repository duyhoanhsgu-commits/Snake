// Quản lý logic rắn

class SnakeManager {
    static createSnake(x, y, direction, color, isBot = false) {
        return {
            body: [{x, y}, {x: x - direction.x, y: y - direction.y}, {x: x - direction.x * 2, y: y - direction.y * 2}],
            foodData: [null, null, null],
            direction: {...direction},
            nextDirection: {...direction},
            score: 0,
            stunned: false,
            stunnedUntil: 0,
            color,
            alive: true,
            isBot,
            respawnTime: 0,
            invincible: false,
            invincibleUntil: 0,
            growing: false,
            growUntil: 0
        };
    }
    
    static moveSnake(snake) {
        const head = {
            x: snake.body[0].x + snake.direction.x,
            y: snake.body[0].y + snake.direction.y
        };
        
        snake.body.unshift(head);
        snake.body.pop();
    }
    
    static checkCollision(pos, snake, allSnakes, gridSizeX, gridSizeY) {
        // Kiểm tra va chạm tường
        if (pos.x < 0 || pos.x >= gridSizeX || pos.y < 0 || pos.y >= gridSizeY) {
            return true;
        }
        
        // Kiểm tra va chạm thân rắn mình
        for (let i = 1; i < snake.body.length; i++) {
            if (pos.x === snake.body[i].x && pos.y === snake.body[i].y) {
                return true;
            }
        }
        
        // Kiểm tra va chạm với tất cả rắn khác
        const otherSnakes = allSnakes.filter(s => s && s !== snake && s.alive);
        for (const other of otherSnakes) {
            for (let i = 0; i < other.body.length; i++) {
                if (pos.x === other.body[i].x && pos.y === other.body[i].y) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    static growSnake(snake, count, foodInfo) {
        for (let i = 0; i < count; i++) {
            snake.body.push({...snake.body[snake.body.length - 1]});
            snake.foodData.push(foodInfo);
        }
        snake.growing = true;
        snake.growUntil = Date.now() + 200;
    }
    
    static shrinkSnake(snake, count) {
        for (let i = 0; i < count; i++) {
            if (snake.body.length > 3) {
                snake.body.pop();
                snake.foodData.pop();
            }
        }
    }
}
