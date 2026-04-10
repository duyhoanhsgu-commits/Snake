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
        // Vẽ nền gạch chân thật
        this.drawBrickBackground();
    }
    
    drawBrickBackground() {
        const gridX = CONFIG.GRID_SIZE_X;
        const gridY = CONFIG.GRID_SIZE_Y;
        
        for (let y = 0; y < gridY; y++) {
            for (let x = 0; x < gridX; x++) {
                const px = x * this.cellSize;
                const py = y * this.cellSize;
                
                // Màu gạch xen kẽ tạo hiệu ứng caro nhẹ
                const isEven = (x + y) % 2 === 0;
                const baseColor = isEven ? '#f5e6d3' : '#f0dcc4';
                
                // Vẽ viên gạch
                this.ctx.fillStyle = baseColor;
                this.ctx.fillRect(px, py, this.cellSize, this.cellSize);
                
                // Vẽ đường viền gạch (grout lines)
                this.ctx.strokeStyle = '#d4c4b0';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(px, py, this.cellSize, this.cellSize);
                
                // Thêm hiệu ứng bóng nhẹ cho gạch (3D effect)
                // Bóng trên
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(px + 1, py + 1, this.cellSize - 2, 2);
                
                // Bóng trái
                this.ctx.fillRect(px + 1, py + 1, 2, this.cellSize - 2);
                
                // Bóng dưới
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.fillRect(px + 1, py + this.cellSize - 3, this.cellSize - 2, 2);
                
                // Bóng phải
                this.ctx.fillRect(px + this.cellSize - 3, py + 1, 2, this.cellSize - 2);
                
                // Thêm texture nhẹ cho gạch (random dots)
                if (Math.random() > 0.7) {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
                    const dotX = px + Math.random() * this.cellSize;
                    const dotY = py + Math.random() * this.cellSize;
                    this.ctx.fillRect(dotX, dotY, 1, 1);
                }
            }
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
            // Scale font size theo cell size (tỷ lệ với 40px base)
            const baseFontSize = isSuper ? 76 : 64;
            const fontSize = baseFontSize * (this.cellSize / 40);
            
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
            
            // Scale emoji theo cell size
            const emojiFontSize = 80 * (this.cellSize / 40);
            this.ctx.font = `${emojiFontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🤖', x + this.cellSize / 2, y + this.cellSize / 2);
        } else {
            const icon = snake.isPlayer2 ? this.playerIcons.player2 : this.playerIcons.player1;
            
            if (icon && icon.complete) {
                // Tăng kích thước icon lên gấp đôi để bằng với AI emoji
                const iconSize = this.cellSize * 2;
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
