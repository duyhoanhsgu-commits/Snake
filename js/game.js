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
        gameSpeed: 200,
        botErrorRate: 0.45,
        gameDuration: 60,
        correctFoodInterval: 2000,  // 2s spawn 1 mồi đúng
        wrongFoodInterval: 4000     // 4s spawn 1 mồi sai
    },
    medium: {
        name: "Trung bình",
        gameSpeed: 140,
        botErrorRate: 0.20,
        gameDuration: 60,
        correctFoodInterval: 2000,  // 2s spawn 1 mồi đúng
        wrongFoodInterval: 4000     // 4s spawn 1 mồi sai
    },
    hard: {
        name: "Khó",
        gameSpeed: 100,
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
        this.gameMode = 'single'; // 'single' hoặc 'multi'
        this.currentTopic = TOPICS[0]; // Khởi tạo topic mặc định
        this.reset();
        this.setupControls();
    }
    
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Lấy thời gian từ input hoặc dùng mặc định
        const customTime = parseInt(document.getElementById('gameTime')?.value) || 60;
        this.timeLeft = customTime;
        
        // Khởi tạo rắn người chơi 1 (màu xanh)
        this.player = {
            body: [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}],
            direction: {x: 1, y: 0},
            nextDirection: {x: 1, y: 0},
            score: 0,
            stunned: false,
            stunnedUntil: 0,
            color: '#2196F3',
            alive: true,
            respawnTime: 0,
            invincible: false,
            invincibleUntil: 0
        };
        
        // Khởi tạo rắn bot (màu đỏ) - luôn có
        this.bot = {
            body: [{x: 15, y: 10}, {x: 16, y: 10}, {x: 17, y: 10}],
            direction: {x: -1, y: 0},
            nextDirection: {x: -1, y: 0},
            score: 0,
            stunned: false,
            stunnedUntil: 0,
            color: '#f44336',
            alive: true,
            isBot: true,
            respawnTime: 0,
            invincible: false,
            invincibleUntil: 0
        };
        
        // Khởi tạo rắn người chơi 2 (màu xanh lá) - chỉ khi chế độ 2 người
        if (this.gameMode === 'multi') {
            this.player2 = {
                body: [{x: 10, y: 5}, {x: 10, y: 6}, {x: 10, y: 7}],
                direction: {x: 0, y: -1},
                nextDirection: {x: 0, y: -1},
                score: 0,
                stunned: false,
                stunnedUntil: 0,
                color: '#4CAF50',
                alive: true,
                respawnTime: 0,
                invincible: false,
                invincibleUntil: 0
            };
        } else {
            this.player2 = null;
        }
        
        this.foods = [];
        this.updateUI();
    }
    
    selectNewTopic() {
        this.currentTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            const key = e.key.toLowerCase();
            
            // Điều khiển người chơi 1 (Arrow keys)
            if (this.player.alive) {
                const dir = this.player.direction;
                if (e.key === 'ArrowUp' && dir.y === 0) {
                    this.player.nextDirection = {x: 0, y: -1};
                } else if (e.key === 'ArrowDown' && dir.y === 0) {
                    this.player.nextDirection = {x: 0, y: 1};
                } else if (e.key === 'ArrowLeft' && dir.x === 0) {
                    this.player.nextDirection = {x: -1, y: 0};
                } else if (e.key === 'ArrowRight' && dir.x === 0) {
                    this.player.nextDirection = {x: 1, y: 0};
                }
            }
            
            // Điều khiển người chơi 2 (WASD) - chỉ khi chế độ 2 người
            if (this.gameMode === 'multi' && this.player2 && this.player2.alive) {
                const dir2 = this.player2.direction;
                if (key === 'w' && dir2.y === 0) {
                    this.player2.nextDirection = {x: 0, y: -1};
                } else if (key === 's' && dir2.y === 0) {
                    this.player2.nextDirection = {x: 0, y: 1};
                } else if (key === 'a' && dir2.x === 0) {
                    this.player2.nextDirection = {x: -1, y: 0};
                } else if (key === 'd' && dir2.x === 0) {
                    this.player2.nextDirection = {x: 1, y: 0};
                }
            }
        });
        
        // Chọn chế độ chơi
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.gameMode = e.currentTarget.dataset.mode;
            });
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
            
            // Cập nhật UI theo chế độ
            if (this.gameMode === 'multi') {
                document.getElementById('player3-info').style.display = 'block';
                document.getElementById('control-text').textContent = '⌨️ P1: ← ↑ → ↓ | P2: A W D S';
            } else {
                document.getElementById('player3-info').style.display = 'none';
                document.getElementById('control-text').textContent = '⌨️ Điều khiển: Phím mũi tên ← ↑ → ↓';
            }
            
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
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
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
        
        // Vẽ liên tục với requestAnimationFrame để mượt hơn
        this.animationFrame = requestAnimationFrame(() => this.render());
    }
    
    render() {
        if (this.gameRunning) {
            this.draw();
            this.animationFrame = requestAnimationFrame(() => this.render());
        }
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Tiếp tục' : 'Tạm dừng';
    }
    
    update() {
        if (this.gamePaused) return;
        
        const now = Date.now();
        
        // Cập nhật rắn người chơi (nếu còn sống)
        if (this.player.alive) {
            if (!this.player.stunned || now >= this.player.stunnedUntil) {
                if (this.player.stunned) {
                    this.player.stunned = false;
                    document.getElementById('player-status').textContent = '';
                }
                this.player.direction = this.player.nextDirection;
                this.moveSnake(this.player);
            }
        } else if (this.player.respawnTime > 0 && now >= this.player.respawnTime) {
            // Hồi sinh sau 3 giây
            this.respawnSnake(this.player, 'player');
        }
        
        // Cập nhật rắn bot (nếu còn sống) - luôn là AI
        if (this.bot.alive) {
            if (!this.bot.stunned || now >= this.bot.stunnedUntil) {
                if (this.bot.stunned) {
                    this.bot.stunned = false;
                    document.getElementById('bot-status').textContent = '';
                }
                this.updateBotAI();
                this.moveSnake(this.bot);
            }
        } else if (this.bot.respawnTime > 0 && now >= this.bot.respawnTime) {
            // Hồi sinh sau 3 giây
            this.respawnSnake(this.bot, 'bot');
        }
        
        // Cập nhật rắn người chơi 2 (nếu có và còn sống)
        if (this.player2) {
            if (this.player2.alive) {
                if (!this.player2.stunned || now >= this.player2.stunnedUntil) {
                    if (this.player2.stunned) {
                        this.player2.stunned = false;
                        document.getElementById('player3-status').textContent = '';
                    }
                    this.player2.direction = this.player2.nextDirection;
                    this.moveSnake(this.player2);
                }
            } else if (this.player2.respawnTime > 0 && now >= this.player2.respawnTime) {
                // Hồi sinh sau 3 giây
                this.respawnSnake(this.player2, 'player3');
            }
        }
        
        this.checkCollisions();
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
        
        // Kiểm tra va chạm với tất cả rắn khác
        const otherSnakes = [this.player, this.bot, this.player2].filter(s => s && s !== snake && s.alive);
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
        if (!this.player.alive && !this.bot.alive && (!this.player2 || !this.player2.alive)) return;
        
        const playerHead = this.player.alive ? this.player.body[0] : null;
        const botHead = this.bot.alive ? this.bot.body[0] : null;
        const player2Head = (this.player2 && this.player2.alive) ? this.player2.body[0] : null;
        
        // Hàm helper để kiểm tra va chạm giữa 2 rắn
        const checkSnakeCollision = (snake1, snake1Name, snake1Type) => {
            if (!snake1.alive) return;
            
            // Kiểm tra bất tử
            const now = Date.now();
            if (snake1.invincible && now < snake1.invincibleUntil) {
                return; // Bỏ qua va chạm khi bất tử
            }
            
            const head1 = snake1.body[0];
            
            // Đụng tường
            if (head1.x < 0 || head1.x >= CONFIG.GRID_SIZE || 
                head1.y < 0 || head1.y >= CONFIG.GRID_SIZE) {
                this.killSnake(snake1, `${snake1Name} đụng tường!`);
                return;
            }
            
            // Đụng thân mình
            for (let i = 1; i < snake1.body.length; i++) {
                if (head1.x === snake1.body[i].x && head1.y === snake1.body[i].y) {
                    this.killSnake(snake1, `${snake1Name} đụng thân mình!`);
                    return;
                }
            }
            
            // Đụng các rắn khác
            const otherSnakes = [
                {snake: this.player, name: 'Người chơi 1'},
                {snake: this.bot, name: 'Bot'},
                {snake: this.player2, name: 'Người chơi 2'}
            ].filter(s => s.snake && s.snake !== snake1 && s.snake.alive);
            
            for (const other of otherSnakes) {
                for (let i = 0; i < other.snake.body.length; i++) {
                    if (head1.x === other.snake.body[i].x && head1.y === other.snake.body[i].y) {
                        this.killSnake(snake1, `${snake1Name} đụng vào ${other.name}!`);
                        return;
                    }
                }
            }
        };
        
        // Kiểm tra từng rắn
        checkSnakeCollision(this.player, 'Người chơi 1', 'player');
        checkSnakeCollision(this.bot, 'Bot', 'bot');
        if (this.player2) {
            checkSnakeCollision(this.player2, 'Người chơi 2', 'player3');
        }
        
        // Kiểm tra ăn thức ăn
        if (this.player.alive) this.checkFoodCollision(this.player, 'player');
        if (this.bot.alive) this.checkFoodCollision(this.bot, 'bot');
        if (this.player2 && this.player2.alive) this.checkFoodCollision(this.player2, 'player3');
    }
    
    killSnake(snake, reason) {
        snake.alive = false;
        
        // Biến thân rắn thành thức ăn
        snake.body.forEach(segment => {
            // Random xem có phải correct food không
            const isCorrect = Math.random() > 0.5;
            let label;
            
            if (isCorrect) {
                label = this.currentTopic.correct[Math.floor(Math.random() * this.currentTopic.correct.length)];
            } else {
                const wrongItems = ALL_ITEMS.filter(item => !this.currentTopic.correct.includes(item));
                label = wrongItems[Math.floor(Math.random() * wrongItems.length)];
            }
            
            this.foods.push({
                x: segment.x,
                y: segment.y,
                isCorrect,
                label
            });
        });
        
        // Đặt thời gian hồi sinh sau 3 giây
        snake.respawnTime = Date.now() + 3000;
        
        // Cập nhật UI
        const type = snake === this.player ? 'player' : 'bot';
        document.getElementById(`${type}-status`).textContent = '💀 Hồi sinh sau 3s...';
        
        console.log(reason);
    }
    
    respawnSnake(snake, type) {
        // Tìm vị trí hồi sinh an toàn
        let x, y;
        let attempts = 0;
        let safePosition = false;
        
        do {
            x = Math.floor(Math.random() * (CONFIG.GRID_SIZE - 4)) + 2; // Đảm bảo có chỗ cho 3 đốt
            y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            attempts++;
            
            // Kiểm tra cả 3 đốt đều an toàn
            safePosition = !this.isOccupied(x, y) && 
                          !this.isOccupied(x - 1, y) && 
                          !this.isOccupied(x - 2, y);
            
        } while (!safePosition && attempts < 100);
        
        if (attempts >= 100) {
            // Không tìm được vị trí, thử lại sau
            snake.respawnTime = Date.now() + 1000;
            return;
        }
        
        // Hồi sinh với 3 đốt
        snake.body = [
            {x: x, y: y},
            {x: x - 1, y: y},
            {x: x - 2, y: y}
        ];
        snake.direction = {x: 1, y: 0};
        snake.nextDirection = {x: 1, y: 0};
        snake.alive = true;
        snake.respawnTime = 0;
        snake.stunned = false;
        
        // Thêm bảo vệ 1 giây sau khi hồi sinh
        snake.invincible = true;
        snake.invincibleUntil = Date.now() + 1000;
        
        document.getElementById(`${type}-status`).textContent = '✨ Hồi sinh! (Bất tử 1s)';
        setTimeout(() => {
            snake.invincible = false;
            document.getElementById(`${type}-status`).textContent = '';
        }, 1000);
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
        
        if (this.player2) {
            document.getElementById('player3-score').textContent = this.player2.score;
            document.getElementById('player3-length').textContent = this.player2.body.length;
        }
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
        
        // Vẽ rắn (chỉ vẽ nếu còn sống)
        if (this.player.alive) this.drawSnake(this.player);
        if (this.bot.alive) this.drawSnake(this.bot);
        if (this.player2 && this.player2.alive) this.drawSnake(this.player2);
    }
    
    drawSnake(snake) {
        snake.body.forEach((segment, index) => {
            // Hiệu ứng bất tử: nhấp nháy
            let alpha = 1;
            if (snake.stunned) {
                alpha = 0.5;
            } else if (snake.invincible && Date.now() < snake.invincibleUntil) {
                alpha = Math.abs(Math.sin(Date.now() / 100)) * 0.5 + 0.5; // Nhấp nháy
            }
            
            this.ctx.globalAlpha = alpha;
            
            const x = segment.x * CONFIG.CELL_SIZE;
            const y = segment.y * CONFIG.CELL_SIZE;
            
            if (index === 0) {
                // Đầu rắn - vẽ tròn
                this.ctx.fillStyle = snake.color;
                this.ctx.beginPath();
                this.ctx.roundRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4, 6);
                this.ctx.fill();
                
                // Vẽ emoji trên đầu rắn
                let emoji = '👨'; // Mặc định nam
                if (snake === this.bot) {
                    emoji = '🤖'; // Bot
                } else if (snake === this.player2) {
                    emoji = '👩'; // Nữ
                }
                
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    emoji,
                    x + CONFIG.CELL_SIZE / 2,
                    y + CONFIG.CELL_SIZE / 2
                );
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
            resultText = '🎉 👨 Người chơi 1 thắng!';
        } else if (winner === 'player3') {
            resultText = '🎉 👩 Người chơi 2 thắng!';
        } else if (winner === 'bot') {
            resultText = '🤖 Bot AI thắng!';
        } else {
            resultText = '🤝 Hòa!';
        }
        
        // Tạo bảng xếp hạng
        let statsHTML = `<div><strong>Lý do kết thúc:</strong> ${reason}</div><div style="margin-top: 15px;">`;
        
        statsHTML += `<div>👨 Người chơi 1: ${this.player.score} điểm (${this.player.body.length} đốt)</div>`;
        
        if (this.player2) {
            statsHTML += `<div>👩 Người chơi 2: ${this.player2.score} điểm (${this.player2.body.length} đốt)</div>`;
        }
        
        statsHTML += `<div>🤖 Bot AI: ${this.bot.score} điểm (${this.bot.body.length} đốt)</div>`;
        statsHTML += `</div>`;
        
        title.textContent = resultText;
        stats.innerHTML = statsHTML;
        
        modal.classList.add('show');
    }
}

// Khởi động game
const game = new Game();
