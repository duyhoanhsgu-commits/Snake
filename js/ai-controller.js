// Quản lý logic AI

class AIController {
    constructor(difficulty, foods, allSnakes, gridSizeX, gridSizeY) {
        this.difficulty = difficulty;
        this.foods = foods;
        this.allSnakes = allSnakes;
        this.gridSizeX = gridSizeX;
        this.gridSizeY = gridSizeY;
    }
    
    updateAI(aiSnake) {
        const head = aiSnake.body[0];
        const level = DIFFICULTY_LEVELS[this.difficulty];
        
        // Luôn kiểm tra hướng hiện tại có an toàn không
        const currentNextHead = {
            x: head.x + aiSnake.direction.x,
            y: head.y + aiSnake.direction.y
        };
        
        // Nếu hướng hiện tại nguy hiểm, tìm hướng an toàn ngay
        if (this.wouldCollide(currentNextHead, aiSnake)) {
            this.findSafeDirection(aiSnake);
            return;
        }
        
        // Tìm thức ăn tốt nhất (ưu tiên correct và sách, tránh wrong)
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const food of this.foods) {
            const dist = Math.abs(food.x - head.x) + Math.abs(food.y - head.y);
            
            // Tính điểm cho mỗi thức ăn
            let score = 0;
            
            if (food.isBook) {
                // Sách rất có giá trị - ưu tiên cao
                score = 150 - dist; // Ưu tiên sách hơn cả trái cây
            } else {
                // AI có thể nhận diện sai (ảo giác)
                const shouldMistake = Math.random() < level.aiErrorRate;
                const perceivedCorrect = shouldMistake ? !food.isCorrect : food.isCorrect;
                
                if (perceivedCorrect) {
                    score = 100 - dist; // Ưu tiên thức ăn đúng gần
                } else {
                    score = -50 - dist; // Tránh thức ăn sai
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = food;
            }
        }
        
        // Nếu không có target tốt hoặc target là wrong, chỉ di chuyển an toàn
        if (!bestTarget || bestScore < 0) {
            this.findSafeDirectionAvoidWrong(aiSnake);
            return;
        }
        
        // Nếu có target tốt, thử di chuyển về phía target
        const dx = bestTarget.x - head.x;
        const dy = bestTarget.y - head.y;
        
        // Tạo danh sách hướng ưu tiên
        const preferredDirs = [];
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) preferredDirs.push({x: 1, y: 0});
            if (dx < 0) preferredDirs.push({x: -1, y: 0});
            if (dy > 0) preferredDirs.push({x: 0, y: 1});
            if (dy < 0) preferredDirs.push({x: 0, y: -1});
        } else {
            if (dy > 0) preferredDirs.push({x: 0, y: 1});
            if (dy < 0) preferredDirs.push({x: 0, y: -1});
            if (dx > 0) preferredDirs.push({x: 1, y: 0});
            if (dx < 0) preferredDirs.push({x: -1, y: 0});
        }
        
        // Thử từng hướng ưu tiên
        for (const dir of preferredDirs) {
            // Không được quay đầu 180 độ
            if ((dir.x !== 0 && aiSnake.direction.x !== 0 && dir.x !== aiSnake.direction.x) || 
                (dir.y !== 0 && aiSnake.direction.y !== 0 && dir.y !== aiSnake.direction.y)) {
                continue;
            }
            
            const nextHead = {
                x: head.x + dir.x,
                y: head.y + dir.y
            };
            
            // Kiểm tra an toàn và không đi vào wrong food
            if (!this.wouldCollide(nextHead, aiSnake) && !this.isWrongFood(nextHead)) {
                aiSnake.direction = dir;
                return;
            }
        }
        
        // Nếu không tìm được hướng tốt, tìm bất kỳ hướng an toàn nào
        this.findSafeDirection(aiSnake);
    }
    
    isWrongFood(pos) {
        for (const food of this.foods) {
            if (food.x === pos.x && food.y === pos.y && !food.isCorrect) {
                return true;
            }
        }
        return false;
    }
    
    findSafeDirectionAvoidWrong(snake) {
        const directions = [
            {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
        ];
        
        // Sắp xếp ngẫu nhiên
        directions.sort(() => Math.random() - 0.5);
        
        // Ưu tiên tìm hướng không có wrong food
        for (const dir of directions) {
            if ((dir.x !== 0 && snake.direction.x !== 0 && dir.x !== snake.direction.x) || 
                (dir.y !== 0 && snake.direction.y !== 0 && dir.y !== snake.direction.y)) {
                continue;
            }
            
            const nextHead = {
                x: snake.body[0].x + dir.x,
                y: snake.body[0].y + dir.y
            };
            
            if (!this.wouldCollide(nextHead, snake) && !this.isWrongFood(nextHead)) {
                snake.direction = dir;
                return true;
            }
        }
        
        // Nếu không tìm được, chấp nhận hướng có wrong food nhưng an toàn
        return this.findSafeDirection(snake);
    }
    
    wouldCollide(pos, snake) {
        // Kiểm tra va chạm tường
        if (pos.x < 0 || pos.x >= this.gridSizeX || 
            pos.y < 0 || pos.y >= this.gridSizeY) {
            return true;
        }
        
        // Kiểm tra va chạm thân rắn mình
        for (let i = 1; i < snake.body.length; i++) {
            if (pos.x === snake.body[i].x && pos.y === snake.body[i].y) {
                return true;
            }
        }
        
        // Kiểm tra va chạm với tất cả rắn khác
        const otherSnakes = this.allSnakes.filter(s => s && s !== snake && s.alive);
        for (const other of otherSnakes) {
            for (let i = 0; i < other.body.length; i++) {
                if (pos.x === other.body[i].x && pos.y === other.body[i].y) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    findSafeDirection(snake) {
        const directions = [
            {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
        ];
        
        // Sắp xếp ngẫu nhiên để ai không đi theo pattern cố định
        directions.sort(() => Math.random() - 0.5);
        
        for (const dir of directions) { 
            // Không được quay đầu 180 độ
            if ((dir.x !== 0 && snake.direction.x !== 0) || 
                (dir.y !== 0 && snake.direction.y !== 0)) {
                continue;
            }
            
            const nextHead = {
                x: snake.body[0].x + dir.x,
                y: snake.body[0].y + dir.y
            };
            
            if (!this.wouldCollide(nextHead, snake)) {
                snake.direction = dir;
                return true;
            }
        }
        
        // Không tìm được hướng an toàn - giữ nguyên hướng hiện tại
        return false;
    }
}
