// Quản lý logic thức ăn

class FoodManager {
    static spawnFood(foods, isCorrect, isSuper, currentTopic, gridSizeX, gridSizeY, isOccupiedFn) {
        // Giới hạn số lượng mồi trên màn hình
        if (!isSuper) {
            const correctCount = foods.filter(f => f.isCorrect && !f.isSuper).length;
            const wrongCount = foods.filter(f => !f.isCorrect).length;
            
            if (isCorrect && correctCount >= 20) return;
            if (!isCorrect && wrongCount >= 10) return;
        }
        
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * gridSizeX);
            y = Math.floor(Math.random() * gridSizeY);
            attempts++;
        } while (isOccupiedFn(x, y) && attempts < 100);
        
        if (attempts >= 100) return;
        
        let label;
        if (isCorrect) {
            label = currentTopic.correct[Math.floor(Math.random() * currentTopic.correct.length)];
        } else {
            label = "💣";
        }
        
        foods.push({x, y, isCorrect, label, isSuper});
    }
    
    static spawnBook(foods, gridSizeX, gridSizeY, isOccupiedFn) {
        // Spawn sách như trái cây, không giới hạn số lượng
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * gridSizeX);
            y = Math.floor(Math.random() * gridSizeY);
            attempts++;
        } while (isOccupiedFn(x, y) && attempts < 100);
        
        if (attempts >= 100) return;
        
        foods.push({x, y, isBook: true, label: '📚'});
    }
    
    static checkFoodCollision(snake, foods) {
        const head = snake.body[0];
        
        for (let i = foods.length - 1; i >= 0; i--) {
            const food = foods[i];
            if (head.x === food.x && head.y === food.y) {
                foods.splice(i, 1);
                return food;
            }
        }
        
        return null;
    }
}
