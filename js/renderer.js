// Quản lý vẽ đồ họa

class Renderer {
    constructor(canvas, ctx, cellSize, playerIcons) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.cellSize = cellSize;
        this.playerIcons = playerIcons;
        
        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'assets/background_move.png';
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
        };
    }
    
    clear() {
        if (this.backgroundLoaded) {
            // Vẽ background image scale để vừa với canvas
            this.ctx.drawImage(
                this.backgroundImage, 
                0, 0, 
                this.canvas.width, 
                this.canvas.height
            );
        } else {
            // Fallback nếu ảnh chưa load
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawRespawnMarkers(markers) {
        const now = Date.now();
        markers.forEach(marker => {
            const elapsed = now - marker.createdAt;
            const progress = elapsed / 3000;
            
            if (progress < 1) {
                const alpha = Math.abs(Math.sin(elapsed / 200)) * 0.7 + 0.3;
                this.ctx.globalAlpha = alpha;
                
                for (let i = 0; i < 3; i++) {
                    const x = (marker.x - i) * this.cellSize;
                    const y = marker.y * this.cellSize;
                    
                    this.ctx.strokeStyle = marker.color;
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                    
                    this.ctx.fillStyle = marker.color + '40';
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
                
                this.ctx.globalAlpha = 1;
            }
        });
    }
    
    drawFoods(foods) {
        foods.forEach(food => {
            const isSuper = food.isSuper;
            const fontSize = isSuper ? 76 : 64;
            
            this.ctx.fillStyle = food.isCorrect ? '#4CAF50' : '#f44336';
            this.ctx.fillRect(
                food.x * this.cellSize + 2,
                food.y * this.cellSize + 2,
                this.cellSize - 4,
                this.cellSize - 4
            );
            
            this.ctx.font = `${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                food.label,
                food.x * this.cellSize + this.cellSize / 2,
                food.y * this.cellSize + this.cellSize / 2
            );
        });
    }
    
    drawSnake(snake) {
        snake.body.forEach((segment, index) => {
            let alpha = 1;
            if (snake.stunned) {
                alpha = 0.5;
            } else if (snake.invincible && Date.now() < snake.invincibleUntil) {
                alpha = Math.abs(Math.sin(Date.now() / 100)) * 0.5 + 0.5;
            }
            
            this.ctx.globalAlpha = alpha;
            
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            
            let scale = 1;
            if (snake.growing && Date.now() < snake.growUntil) {
                const progress = (snake.growUntil - Date.now()) / 200;
                scale = 1 + (progress * 0.3);
            }
            
            const cellSize = this.cellSize * scale;
            const offset = (this.cellSize - cellSize) / 2;
            
            if (index === 0) {
                this.drawSnakeHead(snake, x, y, cellSize, offset);
            } else {
                this.drawSnakeBody(snake, x, y, cellSize, offset);
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawSnakeHead(snake, x, y, cellSize, offset) {
        if (snake.isBot) {
            this.ctx.fillStyle = snake.color;
            this.ctx.beginPath();
            this.ctx.roundRect(x + offset + 2, y + offset + 2, cellSize - 4, cellSize - 4, 6);
            this.ctx.fill();
            
            this.ctx.font = `${80 * (cellSize / this.cellSize)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🤖', x + this.cellSize / 2, y + this.cellSize / 2);
        } else {
            const icon = snake.isPlayer2 ? this.playerIcons.player2 : this.playerIcons.player1;
            
            if (icon && icon.complete) {
                const iconSize = cellSize * 1.8;
                const centerX = x + this.cellSize / 2;
                const centerY = y + this.cellSize / 2;
                
                let angle = 0;
                if (snake.direction.x === 1) angle = Math.PI / 2 + Math.PI;
                else if (snake.direction.x === -1) angle = -Math.PI / 2 + Math.PI;
                else if (snake.direction.y === 1) angle = Math.PI + Math.PI;
                else if (snake.direction.y === -1) angle = 0 + Math.PI;
                
                this.ctx.save();
                this.ctx.translate(centerX, centerY);
                this.ctx.rotate(angle);
                this.ctx.drawImage(icon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
                this.ctx.restore();
            }
        }
    }
    
    drawSnakeBody(snake, x, y, cellSize, offset) {
        const gradient = this.ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
        gradient.addColorStop(0, snake.color);
        gradient.addColorStop(1, this.adjustBrightness(snake.color, -20));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        const bodySize = cellSize * 1.1;
        const bodyOffset = (this.cellSize - bodySize) / 2;
        this.ctx.roundRect(x + bodyOffset + 3, y + bodyOffset + 3, bodySize - 6, bodySize - 6, 4);
        this.ctx.fill();
        
        this.ctx.strokeStyle = this.adjustBrightness(snake.color, 30);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    adjustBrightness(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
            (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
            .toString(16).slice(1);
    }
}
