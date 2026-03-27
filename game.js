// Cấu hình game
const CONFIG = {
    GRID_SIZE: 20,
    CELL_SIZE: 25,
    GAME_SPEED: 150,
    GAME_DURATION: 60,
    FOOD_SPAWN_INTERVAL: 2000,
    CORRECT_POINTS: 10,
    WRONG_PENALTY: -5,
    STUN_DURATION: 2000,
    BOT_ERROR_RATE: 0.25
};

// Cấu hình theo cấp độ
const DIFFICULTY_LEVELS = {
    easy: {
        name: "Dễ",
        gameSpeed: 280,
        botErrorRate: 0.45,
        gameDuration: 60,
        correctFoodInterval: 2000,  // 2s spawn 1 mồi đúng
        wrongFoodInterval: 4000     // 4s spawn 1 mồi sai
    },
    medium: {
        name: "Trung bình",
        gameSpeed: 200,
        botErrorRate: 0.20,
        gameDuration: 60,
        correctFoodInterval: 2000,  // 2s spawn 1 mồi đúng
        wrongFoodInterval: 4000     // 4s spawn 1 mồi sai
    },
    hard: {
        name: "Khó",
        gameSpeed: 140,
        botErrorRate: 0.05,
        gameDuration: 60,
        correctFoodInterval: 1500,  // 1.5s spawn 1 mồi đúng
        wrongFoodInterval: 1500     // 1.5s spawn 1 mồi sai (nhiều bẫy)
    }
};

// Chủ đề và dữ liệu mẫu
const TOPICS = [
    {
        name: "Chỉ ăn CÔNG THỨC VẬT LÝ",
        correct: ["E=mc²", "F=ma", "P=VI", "v=s/t", "W=Fs", "a=Δv/t", "P=F/S"]
    },
    {
        name: "Chỉ ăn CÔNG THỨC HÓA HỌC",
        correct: ["H₂O", "CO₂", "NaCl", "H₂SO₄", "CaCO₃", "O₂", "CH₄"]
    },
    {
        name: "Chỉ ăn ĐỘNG VẬT CÓ VÚ",
        correct: ["🐕", "🐈", "🐘", "🦁", "🐯", "🐻", "🐼", "🦊"]
    },
    {
        name: "Chỉ ăn NGÔN NGỮ LẬP TRÌNH",
        correct: ["Python", "Java", "C++", "JS", "Ruby", "Go", "Rust", "PHP"]
    },
    {
        name: "Chỉ ăn SỐ CHẴN",
        correct: ["2", "4", "6", "8", "10", "12", "14", "16"]
    },
    {
        name: "Chỉ ăn SỐ LẺ",
        correct: ["1", "3", "5", "7", "9", "11", "13", "15"]
    },
    {
        name: "Chỉ ăn TRÁI CÂY",
        correct: ["🍎", "🍊", "🍌", "🍇", "🍓", "🍑", "🍉", "🥝"]
    },
    {
        name: "Chỉ ăn RAU CỦ",
        correct: ["🥕", "🥔", "🥬", "🥦", "🌽", "🍅", "🥒", "🧅"]
    },
    {
        name: "Chỉ ăn HÌNH TRÒN",
        correct: ["⚪", "🔵", "🟢", "🟡", "🟠", "🔴", "🟣", "🟤"]
    },
    {
        name: "Chỉ ăn HÌNH VUÔNG",
        correct: ["⬜", "🟦", "🟩", "🟨", "🟧", "🟥", "🟪", "🟫"]
    }
];

// Tạo danh sách tất cả items để làm wrong answers
const ALL_ITEMS = TOPICS.flatMap(topic => topic.correct);

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
        
        this.difficulty = 'medium';
        this.reset();
        this.setupControls();
    }
    
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        const level = DIFFICULTY_LEVELS[this.difficulty];
        this.timeLeft = level.gameDuration;
        
        // Khởi tạo rắn người chơi (màu xanh)
        this.player = {
            body: [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}],
            direction: {x: 1, y: 0},
            nextDirection: {x: 1, y: 0},
            score: 0,
            stunned: false,
            stunnedUntil: 0,
            color: '#2196F3'
        };
        
        // Khởi tạo rắn bot (màu đỏ)
        this.bot = {
            body: [{x: 15, y: 10}, {x: 16, y: 10}, {x: 17, y: 10}],
            direction: {x: -1, y: 0},
            score: 0,
            stunned: false,
            stunnedUntil: 0,
            color: '#f44336'
        };
        
        this.foods = [];
        this.updateUI();
    }
    
    selectNewTopic() {
        this.currentTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            const key = e.key;
            const dir = this.player.direction;
            
            if (key === 'ArrowUp' && dir.y === 0) {
                this.player.nextDirection = {x: 0, y: -1};
            } else if (key === 'ArrowDown' && dir.y === 0) {
                this.player.nextDirection = {x: 0, y: 1};
            } else if (key === 'ArrowLeft' && dir.x === 0) {
                this.player.nextDirection = {x: -1, y: 0};
            } else if (key === 'ArrowRight' && dir.x === 0) {
                this.player.nextDirection = {x: 1, y: 0};
            }
        });
        
        // Chọn cấp độ trong menu
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.difficulty = e.currentTarget.dataset.level;
            });
        });
        
        // Nút bắt đầu chơi
        document.getElementById('playBtn').addEventListener('click', () => {
            this.selectNewTopic();
            this.reset();
            document.getElementById('menuScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            this.showTopicModal();
        });
        
        // Nút bắt đầu game từ modal topic
        document.getElementById('startGameBtn').addEventListener('click', () => {
            document.getElementById('topicModal').classList.remove('show');
            this.start();
        });
        
        // Nút tạm dừng
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Nút về menu từ game
        document.getElementById('backBtn').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ bị mất.')) {
                this.stopGame();
                this.showMenu();
            }
        });
        
        // Nút chơi lại
        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('show');
            this.selectNewTopic();
            this.reset();
            this.showTopicModal();
        });
        
        // Nút về menu từ modal
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('show');
            this.showMenu();
        });
    }
    
    showMenu() {
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('menuScreen').style.display = 'flex';
        this.reset();
    }
    
    showTopicModal() {
        document.getElementById('topicDisplay').textContent = this.currentTopic.name;
        document.getElementById('topicModal').classList.add('show');
    }
    
    stopGame() {
        this.gameRunning = false;
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.correctFoodSpawner) clearInterval(this.correctFoodSpawner);
        if (this.wrongFoodSpawner) clearInterval(this.wrongFoodSpawner);
        if (this.timer) clearInterval(this.timer);
    }
    
    start() {
        this.gameRunning = true;
        const level = DIFFICULTY_LEVELS[this.difficulty];
        
        document.getElementById('objective').textContent = this.currentTopic.name;
        
        // Spawn thức ăn ban đầu
        this.spawnFood(true);  // 1 mồi đúng
        this.spawnFood(false); // 1 mồi sai
        
        this.gameLoop = setInterval(() => this.update(), level.gameSpeed);
        
        // Spawn riêng cho mồi đúng và mồi sai
        this.correctFoodSpawner = setInterval(() => this.spawnFood(true), level.correctFoodInterval);
        this.wrongFoodSpawner = setInterval(() => this.spawnFood(false), level.wrongFoodInterval);
        
        this.timer = setInterval(() => this.updateTimer(), 1000);
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Tiếp tục' : 'Tạm dừng';
    }
    
    update() {
        if (this.gamePaused) return;
        
        const now = Date.now();
        
        // Cập nhật rắn người chơi
        if (!this.player.stunned || now >= this.player.stunnedUntil) {
            if (this.player.stunned) {
                this.player.stunned = false;
                document.getElementById('player-status').textContent = '';
            }
            this.player.direction = this.player.nextDirection;
            this.moveSnake(this.player);
        }
        
        // Cập nhật rắn bot
        if (!this.bot.stunned || now >= this.bot.stunnedUntil) {
            if (this.bot.stunned) {
                this.bot.stunned = false;
                document.getElementById('bot-status').textContent = '';
            }
            this.updateBotAI();
            this.moveSnake(this.bot);
        }
        
        this.checkCollisions();
        this.draw();
    }
    
    moveSnake(snake) {
        const head = {
            x: snake.body[0].x + snake.direction.x,
            y: snake.body[0].y + snake.direction.y
        };
        
        snake.body.unshift(head);
        snake.body.pop();
    }
    
    updateBotAI() {
        const head = this.bot.body[0];
        const level = DIFFICULTY_LEVELS[this.difficulty];
        
        // Luôn kiểm tra hướng hiện tại có an toàn không
        const currentNextHead = {
            x: head.x + this.bot.direction.x,
            y: head.y + this.bot.direction.y
        };
        
        // Nếu hướng hiện tại nguy hiểm, tìm hướng an toàn ngay
        if (this.wouldCollide(currentNextHead, this.bot)) {
            this.findSafeDirection(this.bot);
            return;
        }
        
        // Tìm thức ăn tốt nhất (ưu tiên correct, tránh wrong)
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const food of this.foods) {
            const dist = Math.abs(food.x - head.x) + Math.abs(food.y - head.y);
            
            // Bot có thể nhận diện sai (ảo giác)
            const shouldMistake = Math.random() < level.botErrorRate;
            const perceivedCorrect = shouldMistake ? !food.isCorrect : food.isCorrect;
            
            // Tính điểm cho mỗi thức ăn
            let score = 0;
            if (perceivedCorrect) {
                score = 100 - dist; // Ưu tiên thức ăn đúng gần
            } else {
                score = -50 - dist; // Tránh thức ăn sai
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestTarget = food;
            }
        }
        
        // Nếu không có target tốt hoặc target là wrong, chỉ di chuyển an toàn
        if (!bestTarget || bestScore < 0) {
            // Tìm hướng an toàn và tránh xa wrong food
            this.findSafeDirectionAvoidWrong(this.bot);
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
            if ((dir.x !== 0 && this.bot.direction.x !== 0 && dir.x !== this.bot.direction.x) || 
                (dir.y !== 0 && this.bot.direction.y !== 0 && dir.y !== this.bot.direction.y)) {
                continue;
            }
            
            const nextHead = {
                x: head.x + dir.x,
                y: head.y + dir.y
            };
            
            // Kiểm tra an toàn và không đi vào wrong food
            if (!this.wouldCollide(nextHead, this.bot) && !this.isWrongFood(nextHead)) {
                this.bot.direction = dir;
                return;
            }
        }
        
        // Nếu không tìm được hướng tốt, tìm bất kỳ hướng an toàn nào
        this.findSafeDirection(this.bot);
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
        if (pos.x < 0 || pos.x >= CONFIG.GRID_SIZE || 
            pos.y < 0 || pos.y >= CONFIG.GRID_SIZE) {
            return true;
        }
        
        // Kiểm tra va chạm thân rắn mình
        for (let i = 1; i < snake.body.length; i++) {
            if (pos.x === snake.body[i].x && pos.y === snake.body[i].y) {
                return true;
            }
        }
        
        // Kiểm tra va chạm với rắn đối phương
        const opponent = snake === this.bot ? this.player : this.bot;
        for (let i = 0; i < opponent.body.length; i++) {
            if (pos.x === opponent.body[i].x && pos.y === opponent.body[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    findSafeDirection(snake) {
        const directions = [
            {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
        ];
        
        // Sắp xếp ngẫu nhiên để bot không đi theo pattern cố định
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
    
    checkCollisions() {
        const playerHead = this.player.body[0];
        const botHead = this.bot.body[0];
        
        // Kiểm tra va chạm đầu với đầu trước (HÒA)
        if (playerHead.x === botHead.x && playerHead.y === botHead.y) {
            this.gameOver('draw', 'Hai đầu rắn chạm nhau!');
            return;
        }
        
        // Kiểm tra người chơi đụng tường
        if (playerHead.x < 0 || playerHead.x >= CONFIG.GRID_SIZE || 
            playerHead.y < 0 || playerHead.y >= CONFIG.GRID_SIZE) {
            this.gameOver('bot', 'Người chơi đụng tường!');
            return;
        }
        
        // Kiểm tra bot đụng tường
        if (botHead.x < 0 || botHead.x >= CONFIG.GRID_SIZE || 
            botHead.y < 0 || botHead.y >= CONFIG.GRID_SIZE) {
            this.gameOver('player', 'Bot đụng tường!');
            return;
        }
        
        // Kiểm tra người chơi đụng thân mình
        for (let i = 1; i < this.player.body.length; i++) {
            if (playerHead.x === this.player.body[i].x && 
                playerHead.y === this.player.body[i].y) {
                this.gameOver('bot', 'Người chơi đụng thân mình!');
                return;
            }
        }
        
        // Kiểm tra bot đụng thân mình
        for (let i = 1; i < this.bot.body.length; i++) {
            if (botHead.x === this.bot.body[i].x && 
                botHead.y === this.bot.body[i].y) {
                this.gameOver('player', 'Bot đụng thân mình!');
                return;
            }
        }
        
        // Kiểm tra người chơi đụng thân bot (THUA)
        for (let i = 0; i < this.bot.body.length; i++) {
            if (playerHead.x === this.bot.body[i].x && 
                playerHead.y === this.bot.body[i].y) {
                this.gameOver('bot', 'Người chơi đụng vào rắn Bot!');
                return;
            }
        }
        
        // Kiểm tra bot đụng thân người chơi (THUA)
        for (let i = 0; i < this.player.body.length; i++) {
            if (botHead.x === this.player.body[i].x && 
                botHead.y === this.player.body[i].y) {
                this.gameOver('player', 'Bot đụng vào rắn Người chơi!');
                return;
            }
        }
        
        // Kiểm tra ăn thức ăn
        this.checkFoodCollision(this.player, 'player');
        this.checkFoodCollision(this.bot, 'bot');
    }
    
    checkFoodCollision(snake, type) {
        const head = snake.body[0];
        
        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (head.x === food.x && head.y === food.y) {
                if (food.isCorrect) {
                    // Ăn đúng
                    snake.score += CONFIG.CORRECT_POINTS;
                    snake.body.push({...snake.body[snake.body.length - 1]});
                } else {
                    // Ăn sai - bị phạt
                    snake.score += CONFIG.WRONG_PENALTY;
                    snake.stunned = true;
                    snake.stunnedUntil = Date.now() + CONFIG.STUN_DURATION;
                    document.getElementById(`${type}-status`).textContent = '😵 Choáng!';
                }
                
                this.foods.splice(i, 1);
                this.updateUI();
                break;
            }
        }
    }
    
    checkSnakeVsSnake() {
        const playerHead = this.player.body[0];
        const botHead = this.bot.body[0];
        
        // Va chạm đầu với đầu
        if (playerHead.x === botHead.x && playerHead.y === botHead.y) {
            this.gameOver('Hai rắn đụng đầu!');
            return;
        }
        
        // Người chơi đụng thân bot
        for (let i = 1; i < this.bot.body.length; i++) {
            if (playerHead.x === this.bot.body[i].x && 
                playerHead.y === this.bot.body[i].y) {
                this.gameOver('Người chơi đụng thân Bot!');
                return;
            }
        }
        
        // Bot đụng thân người chơi
        for (let i = 1; i < this.player.body.length; i++) {
            if (botHead.x === this.player.body[i].x && 
                botHead.y === this.player.body[i].y) {
                this.gameOver('Bot đụng thân Người chơi!');
                return;
            }
        }
    }
    
    spawnFood(isCorrect) {
        // Giới hạn số lượng mồi trên màn hình
        const correctCount = this.foods.filter(f => f.isCorrect).length;
        const wrongCount = this.foods.filter(f => !f.isCorrect).length;
        
        if (isCorrect && correctCount >= 4) return; // Tối đa 4 mồi đúng
        if (!isCorrect && wrongCount >= 3) return;  // Tối đa 3 mồi sai
        
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            attempts++;
        } while (this.isOccupied(x, y) && attempts < 100);
        
        if (attempts >= 100) return;
        
        let label;
        
        if (isCorrect) {
            // Chọn từ danh sách correct của topic hiện tại
            label = this.currentTopic.correct[Math.floor(Math.random() * this.currentTopic.correct.length)];
        } else {
            // Chọn từ các items không thuộc topic hiện tại
            const wrongItems = ALL_ITEMS.filter(item => !this.currentTopic.correct.includes(item));
            label = wrongItems[Math.floor(Math.random() * wrongItems.length)];
        }
        
        this.foods.push({x, y, isCorrect, label});
    }
    
    isOccupied(x, y) {
        // Kiểm tra vị trí có bị chiếm không
        for (const segment of this.player.body) {
            if (segment.x === x && segment.y === y) return true;
        }
        for (const segment of this.bot.body) {
            if (segment.x === x && segment.y === y) return true;
        }
        for (const food of this.foods) {
            if (food.x === x && food.y === y) return true;
        }
        return false;
    }
    
    updateTimer() {
        if (this.gamePaused) return;
        
        this.timeLeft--;
        document.getElementById('timer').textContent = this.timeLeft;
        
        if (this.timeLeft <= 0) {
            // Hết giờ - so sánh điểm
            if (this.player.score > this.bot.score) {
                this.gameOver('player', 'Hết giờ! Người chơi có điểm cao hơn!');
            } else if (this.bot.score > this.player.score) {
                this.gameOver('bot', 'Hết giờ! Bot có điểm cao hơn!');
            } else {
                this.gameOver('draw', 'Hết giờ! Hai bên hòa điểm!');
            }
        }
    }
    
    updateUI() {
        document.getElementById('player-score').textContent = this.player.score;
        document.getElementById('player-length').textContent = this.player.body.length;
        document.getElementById('bot-score').textContent = this.bot.score;
        document.getElementById('bot-length').textContent = this.bot.body.length;
    }
    
    draw() {
        // Xóa canvas
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Vẽ lưới
        this.ctx.strokeStyle = '#1a1a2e';
        for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * CONFIG.CELL_SIZE, 0);
            this.ctx.lineTo(i * CONFIG.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CONFIG.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, i * CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
        
        // Vẽ thức ăn
        this.foods.forEach(food => {
            this.ctx.fillStyle = food.isCorrect ? '#4CAF50' : '#f44336';
            this.ctx.fillRect(
                food.x * CONFIG.CELL_SIZE + 2,
                food.y * CONFIG.CELL_SIZE + 2,
                CONFIG.CELL_SIZE - 4,
                CONFIG.CELL_SIZE - 4
            );
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                food.label,
                food.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                food.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2
            );
        });
        
        // Vẽ rắn
        this.drawSnake(this.player);
        this.drawSnake(this.bot);
    }
    
    drawSnake(snake) {
        snake.body.forEach((segment, index) => {
            const alpha = snake.stunned ? 0.5 : 1;
            this.ctx.globalAlpha = alpha;
            
            const x = segment.x * CONFIG.CELL_SIZE;
            const y = segment.y * CONFIG.CELL_SIZE;
            
            if (index === 0) {
                // Đầu rắn - vẽ tròn và có mắt
                this.ctx.fillStyle = snake.color;
                this.ctx.beginPath();
                this.ctx.roundRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4, 6);
                this.ctx.fill();
                
                // Vẽ mắt
                const eyeSize = 3;
                const eyeOffset = 6;
                this.ctx.fillStyle = 'white';
                
                // Xác định vị trí mắt dựa vào hướng di chuyển
                if (snake.direction.x === 1) { // Sang phải
                    this.ctx.fillRect(x + CONFIG.CELL_SIZE - eyeOffset - eyeSize, y + 6, eyeSize, eyeSize);
                    this.ctx.fillRect(x + CONFIG.CELL_SIZE - eyeOffset - eyeSize, y + CONFIG.CELL_SIZE - 9, eyeSize, eyeSize);
                } else if (snake.direction.x === -1) { // Sang trái
                    this.ctx.fillRect(x + eyeOffset, y + 6, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset, y + CONFIG.CELL_SIZE - 9, eyeSize, eyeSize);
                } else if (snake.direction.y === -1) { // Lên trên
                    this.ctx.fillRect(x + 6, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + CONFIG.CELL_SIZE - 9, y + eyeOffset, eyeSize, eyeSize);
                } else { // Xuống dưới
                    this.ctx.fillRect(x + 6, y + CONFIG.CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                    this.ctx.fillRect(x + CONFIG.CELL_SIZE - 9, y + CONFIG.CELL_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                }
            } else {
                // Thân rắn - gradient và bo tròn
                const gradient = this.ctx.createLinearGradient(x, y, x + CONFIG.CELL_SIZE, y + CONFIG.CELL_SIZE);
                gradient.addColorStop(0, snake.color);
                gradient.addColorStop(1, this.adjustBrightness(snake.color, -20));
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.roundRect(x + 3, y + 3, CONFIG.CELL_SIZE - 6, CONFIG.CELL_SIZE - 6, 4);
                this.ctx.fill();
                
                // Viền sáng
                this.ctx.strokeStyle = this.adjustBrightness(snake.color, 30);
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
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
    
    gameOver(winner, reason) {
        this.stopGame();
        
        // Hiển thị kết quả
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const stats = document.getElementById('gameOverStats');
        
        let resultText = '';
        if (winner === 'player') {
            resultText = '🎉 Người chơi thắng!';
        } else if (winner === 'bot') {
            resultText = '🤖 Bot thắng!';
        } else {
            resultText = '🤝 Hòa!';
        }
        
        title.textContent = resultText;
        stats.innerHTML = `
            <div><strong>Lý do kết thúc:</strong> ${reason}</div>
            <div style="margin-top: 15px;">
                <div>👤 Người chơi: ${this.player.score} điểm (${this.player.body.length} đốt)</div>
                <div>🤖 Bot: ${this.bot.score} điểm (${this.bot.body.length} đốt)</div>
            </div>
        `;
        
        modal.classList.add('show');
    }
}

// Khởi động game
const game = new Game();
