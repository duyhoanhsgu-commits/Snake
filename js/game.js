console.log('=== FILE GAME.JS BẮT ĐẦU LOAD ===');

// Cấu hình game
const CONFIG = {
    GRID_SIZE_X: 88, // Chiều rộng - tăng gấp đôi (44 x 2)
    GRID_SIZE_Y: 44, // Chiều cao - tăng gấp đôi (22 x 2)
    CELL_SIZE: 20,
    GAME_SPEED: 150,
    GAME_DURATION: 60,
    FOOD_SPAWN_INTERVAL: 2000,
    CORRECT_POINTS: 1,
    WRONG_PENALTY: -2,
    STUN_DURATION: 2000,
    BOT_ERROR_RATE: 0.25
};

// Cấu hình theo cấp độ
const DIFFICULTY_LEVELS = {
    easy: {
        name: "Dễ",
        aiName: "🐍 Rắn AI Mới Vào Nghề",
        gameSpeed: 200,
        aiErrorRate: 0.45,
        gameDuration: 60,
        correctFoodInterval: 2000,
        wrongFoodInterval: 4000
    },
    medium: {
        name: "Trung bình",
        aiName: "🐍 Rắn AI Chuyên Nghiệp",
        gameSpeed: 140,
        aiErrorRate: 0.20,
        gameDuration: 60,
        correctFoodInterval: 2000,
        wrongFoodInterval: 4000
    },
    hard: {
        name: "Khó",
        aiName: "🐍 Rắn AI Huyền Thoại",
        gameSpeed: 100,
        aiErrorRate: 0.05,
        gameDuration: 60,
        correctFoodInterval: 1500,
        wrongFoodInterval: 1500
    }
};

// Chủ đề và dữ liệu mẫu - CHỈ TRÁI CÂY VÀ BOM
const TOPICS = [
    {
        name: "Ăn TRÁI CÂY, tránh BOM",
        correct: ["🍎", "🍊", "🍌", "🍇", "🍓", "🍑", "🍉", "🥝"],
        wrong: ["💣"]
    }
];

// Tạo danh sách tất cả items
const ALL_ITEMS = ["🍎", "🍊", "🍌", "🍇", "🍓", "🍑", "🍉", "🥝", "💣"];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Load SVG icons
        this.playerIcons = {
            player1: new Image(),
            player2: new Image(),
            ai: new Image()
        };
        
        this.playerIcons.player1.src = 'assets/iconfinder-snake-4591880_122131.svg';
        this.playerIcons.player2.src = 'assets/iconfinder-snake-4591880_122131.svg'; // Dùng chung icon
        this.playerIcons.ai.src = 'assets/artboard-18_89038.svg';
        
        // Tính toán kích thước canvas dựa trên màn hình
        this.calculateCanvasSize();
        
        this.difficulty = 'medium';
        this.gameMode = 'single'; // 'single' hoặc 'multi'
        this.currentTopic = TOPICS[0]; // Khởi tạo topic mặc định
        this.reset();
        this.setupControls();
        
        // Điều chỉnh kích thước khi thay đổi màn hình
        window.addEventListener('resize', () => {
            this.calculateCanvasSize();
        });
        
        // Thêm điều khiển cảm ứng cho mobile
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            // Tính vị trí chạm trên canvas
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Chuyển đổi sang tọa độ grid
            const gridX = Math.floor(touchX / CONFIG.CELL_SIZE);
            const gridY = Math.floor(touchY / CONFIG.CELL_SIZE);
            
            // Xác định hướng di chuyển cho người chơi 1
            if (this.player.alive) {
                this.setDirectionToTarget(this.player, gridX, gridY);
            }
            
            // Xác định hướng di chuyển cho người chơi 2 (nếu có)
            if (this.gameMode === 'multi' && this.player2 && this.player2.alive) {
                this.setDirectionToTarget(this.player2, gridX, gridY);
            }
        });
        
        // Thêm click chuột cho desktop
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            const gridX = Math.floor(clickX / CONFIG.CELL_SIZE);
            const gridY = Math.floor(clickY / CONFIG.CELL_SIZE);
            
            if (this.player.alive) {
                this.setDirectionToTarget(this.player, gridX, gridY);
            }
        });
    }
    
    setDirectionToTarget(snake, targetX, targetY) {
        const head = snake.body[0];
        const dx = targetX - head.x;
        const dy = targetY - head.y;
        
        // Xác định hướng chính (ngang hoặc dọc)
        if (Math.abs(dx) > Math.abs(dy)) {
            // Di chuyển ngang
            if (dx > 0 && snake.direction.x === 0) {
                snake.nextDirection = {x: 1, y: 0}; // Phải
            } else if (dx < 0 && snake.direction.x === 0) {
                snake.nextDirection = {x: -1, y: 0}; // Trái
            }
        } else {
            // Di chuyển dọc
            if (dy > 0 && snake.direction.y === 0) {
                snake.nextDirection = {x: 0, y: 1}; // Xuống
            } else if (dy < 0 && snake.direction.y === 0) {
                snake.nextDirection = {x: 0, y: -1}; // Lên
            }
        }
    }
    
    calculateCanvasSize() {
        // Cố định cell size 40px
        CONFIG.CELL_SIZE = 40;
        
        // Cập nhật kích thước canvas
        this.canvas.width = CONFIG.GRID_SIZE_X * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_SIZE_Y * CONFIG.CELL_SIZE;
    }
    
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Lấy thời gian từ input hoặc dùng mặc định
        const customTime = parseInt(document.getElementById('gameTime')?.value) || 60;
        this.timeLeft = customTime;
        
        this.respawnMarkers = []; // Mảng lưu vị trí hồi sinh
        
        // Khởi tạo rắn người chơi 1 (màu xanh)
        this.player = {
            body: [{x: 5, y: 10}, {x: 4, y: 10}, {x: 3, y: 10}],
            foodData: [null, null, null], // Lưu thông tin thức ăn cho mỗi đốt
            direction: {x: 1, y: 0},
            nextDirection: {x: 1, y: 0},
            score: 0,
            stunned: false,
            stunnedUntil: 0,
            color: '#2196F3',
            alive: true,
            respawnTime: 0,
            invincible: false,
            invincibleUntil: 0,
            growing: false,
            growUntil: 0
        };
        
        // Khởi tạo rắn ai (màu đỏ) - luôn có
        this.ai = {
            body: [{x: 15, y: 10}, {x: 16, y: 10}, {x: 17, y: 10}],
            foodData: [null, null, null], // Lưu thông tin thức ăn cho mỗi đốt
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
            invincibleUntil: 0,
            growing: false,
            growUntil: 0
        };
        
        // Khởi tạo rắn người chơi 2 (màu xanh lá) - chỉ khi chế độ 2 người
        if (this.gameMode === 'multi') {
            this.player2 = {
                body: [{x: 10, y: 5}, {x: 10, y: 6}, {x: 10, y: 7}],
                foodData: [null, null, null], // Lưu thông tin thức ăn cho mỗi đốt
                direction: {x: 0, y: -1},
                nextDirection: {x: 0, y: -1},
                score: 0,
                stunned: false,
                stunnedUntil: 0,
                color: '#4CAF50',
                alive: true,
                respawnTime: 0,
                invincible: false,
                invincibleUntil: 0,
                growing: false,
                growUntil: 0
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
        // Xử lý chuyển bước
        const nextBtn1 = document.getElementById('nextBtn1');
        const nextBtn2 = document.getElementById('nextBtn2');
        const backBtn1 = document.getElementById('backBtn1');
        const backBtn2 = document.getElementById('backBtn2');
        
        console.log('nextBtn1:', nextBtn1);
        console.log('nextBtn2:', nextBtn2);
        console.log('backBtn1:', backBtn1);
        console.log('backBtn2:', backBtn2);
        
        if (nextBtn1) {
            nextBtn1.addEventListener('click', () => {
                console.log('Next button 1 clicked!');
                document.getElementById('step1').classList.remove('active');
                document.getElementById('step2').classList.add('active');
            });
        }
        
        if (nextBtn2) {
            nextBtn2.addEventListener('click', () => {
                console.log('Next button 2 clicked!');
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step3').classList.add('active');
            });
        }
        
        if (backBtn1) {
            backBtn1.addEventListener('click', () => {
                console.log('Back button 1 clicked!');
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step1').classList.add('active');
            });
        }
        
        if (backBtn2) {
            backBtn2.addEventListener('click', () => {
                console.log('Back button 2 clicked!');
                document.getElementById('step3').classList.remove('active');
                document.getElementById('step2').classList.add('active');
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            const key = e.key.toLowerCase();
            
            // Ngăn scroll trang khi nhấn phím mũi tên hoặc WASD
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) || 
                ['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
            }
            
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
            
            // Cập nhật tên AI theo cấp độ
            const level = DIFFICULTY_LEVELS[this.difficulty];
            document.getElementById('player2-name').textContent = level.aiName;
            
            // Cập nhật UI theo chế độ
            if (this.gameMode === 'multi') {
                document.getElementById('player3-section').style.display = 'block';
                document.getElementById('control-text').textContent = '⌨️ P1: ← ↑ → ↓ | P2: A W D S';
            } else {
                document.getElementById('player3-section').style.display = 'none';
                document.getElementById('control-text').textContent = '⌨️ Điều khiển: Phím mũi tên ← ↑ → ↓';
            }
            
            document.getElementById('menuScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            this.start(); // Bắt đầu game ngay lập tức
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
            document.getElementById('menuScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            this.start(); // Bắt đầu game ngay lập tức
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
        document.body.classList.remove('game-active');
        
        // Reset về bước 1
        document.getElementById('step1').classList.add('active');
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step3').classList.remove('active');
        
        this.reset();
    }
    
    stopGame() {
        this.gameRunning = false;
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.foodSpawner) clearInterval(this.foodSpawner);
        if (this.superFruitSpawner) clearInterval(this.superFruitSpawner);
        if (this.timer) clearInterval(this.timer);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        
        // Bỏ cố định màn hình
        document.body.classList.remove('game-active');
    }
    
    start() {
        this.gameRunning = true;
        const level = DIFFICULTY_LEVELS[this.difficulty];
        
        // Cố định màn hình khi chơi
        document.body.classList.add('game-active');
        
        // Spawn thức ăn ban đầu
        for (let i = 0; i < 3; i++) {
            this.spawnFood(true);  // 3 trái cây
        }
        this.spawnFood(false); // 1 bom
        
        this.gameLoop = setInterval(() => this.update(), level.gameSpeed);
        
        // Mỗi 1 giây spawn 3 trái cây và 1 bom
        this.foodSpawner = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                this.spawnFood(true);
            }
            this.spawnFood(false);
        }, 1000);
        
        // Mỗi 5 giây spawn 1 trái cây bự (super fruit)
        this.superFruitSpawner = setInterval(() => {
            this.spawnFood(true, true); // true = correct, true = super
        }, 5000);
        
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
        
        // Cập nhật rắn ai (nếu còn sống) - luôn là AI
        if (this.ai.alive) {
            if (!this.ai.stunned || now >= this.ai.stunnedUntil) {
                if (this.ai.stunned) {
                    this.ai.stunned = false;
                    document.getElementById('ai-status').textContent = '';
                }
                this.updateAI();
                this.moveSnake(this.ai);
            }
        } else if (this.ai.respawnTime > 0 && now >= this.ai.respawnTime) {
            // Hồi sinh sau 3 giây
            this.respawnSnake(this.ai, 'ai');
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
    
    updateAI() {
        const head = this.ai.body[0];
        const level = DIFFICULTY_LEVELS[this.difficulty];
        
        // Luôn kiểm tra hướng hiện tại có an toàn không
        const currentNextHead = {
            x: head.x + this.ai.direction.x,
            y: head.y + this.ai.direction.y
        };
        
        // Nếu hướng hiện tại nguy hiểm, tìm hướng an toàn ngay
        if (this.wouldCollide(currentNextHead, this.ai)) {
            this.findSafeDirection(this.ai);
            return;
        }
        
        // Tìm thức ăn tốt nhất (ưu tiên correct, tránh wrong)
        let bestTarget = null;
        let bestScore = -Infinity;
        
        for (const food of this.foods) {
            const dist = Math.abs(food.x - head.x) + Math.abs(food.y - head.y);
            
            // AI có thể nhận diện sai (ảo giác)
            const shouldMistake = Math.random() < level.aiErrorRate;
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
            this.findSafeDirectionAvoidWrong(this.ai);
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
            if ((dir.x !== 0 && this.ai.direction.x !== 0 && dir.x !== this.ai.direction.x) || 
                (dir.y !== 0 && this.ai.direction.y !== 0 && dir.y !== this.ai.direction.y)) {
                continue;
            }
            
            const nextHead = {
                x: head.x + dir.x,
                y: head.y + dir.y
            };
            
            // Kiểm tra an toàn và không đi vào wrong food
            if (!this.wouldCollide(nextHead, this.ai) && !this.isWrongFood(nextHead)) {
                this.ai.direction = dir;
                return;
            }
        }
        
        // Nếu không tìm được hướng tốt, tìm bất kỳ hướng an toàn nào
        this.findSafeDirection(this.ai);
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
        if (pos.x < 0 || pos.x >= CONFIG.GRID_SIZE_X || 
            pos.y < 0 || pos.y >= CONFIG.GRID_SIZE_Y) {
            return true;
        }
        
        // Kiểm tra va chạm thân rắn mình
        for (let i = 1; i < snake.body.length; i++) {
            if (pos.x === snake.body[i].x && pos.y === snake.body[i].y) {
                return true;
            }
        }
        
        // Kiểm tra va chạm với tất cả rắn khác
        const otherSnakes = [this.player, this.ai, this.player2].filter(s => s && s !== snake && s.alive);
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
    
    checkCollisions() {
        if (!this.player.alive && !this.ai.alive && (!this.player2 || !this.player2.alive)) return;
        
        const playerHead = this.player.alive ? this.player.body[0] : null;
        const aiHead = this.ai.alive ? this.ai.body[0] : null;
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
            if (head1.x < 0 || head1.x >= CONFIG.GRID_SIZE_X || 
                head1.y < 0 || head1.y >= CONFIG.GRID_SIZE_Y) {
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
                {snake: this.ai, name: 'AI'},
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
        checkSnakeCollision(this.ai, 'AI', 'ai');
        if (this.player2) {
            checkSnakeCollision(this.player2, 'Người chơi 2', 'player3');
        }
        
        // Kiểm tra ăn thức ăn
        if (this.player.alive) this.checkFoodCollision(this.player, 'player');
        if (this.ai.alive) this.checkFoodCollision(this.ai, 'ai');
        if (this.player2 && this.player2.alive) this.checkFoodCollision(this.player2, 'player3');
    }
    
    killSnake(snake, reason) {
        snake.alive = false;
        
        // Biến thân rắn thành thức ăn - dùng đúng thức ăn đã ăn
        snake.body.forEach((segment, index) => {
            let foodInfo = snake.foodData[index];
            
            // Nếu đốt này không có thông tin thức ăn (đốt ban đầu), tạo random
            if (!foodInfo) {
                const isCorrect = Math.random() > 0.5;
                let label;
                
                if (isCorrect) {
                    label = this.currentTopic.correct[Math.floor(Math.random() * this.currentTopic.correct.length)];
                } else {
                    const wrongItems = ALL_ITEMS.filter(item => !this.currentTopic.correct.includes(item));
                    label = wrongItems[Math.floor(Math.random() * wrongItems.length)];
                }
                
                foodInfo = { isCorrect, label };
            }
            
            this.foods.push({
                x: segment.x,
                y: segment.y,
                isCorrect: foodInfo.isCorrect,
                label: foodInfo.label
            });
        });
        
        // Tìm vị trí hồi sinh ngay
        let x, y;
        let attempts = 0;
        let safePosition = false;
        
        do {
            x = Math.floor(Math.random() * (CONFIG.GRID_SIZE_X - 4)) + 2;
            y = Math.floor(Math.random() * CONFIG.GRID_SIZE_Y);
            attempts++;
            
            safePosition = !this.isOccupied(x, y) && 
                          !this.isOccupied(x - 1, y) && 
                          !this.isOccupied(x - 2, y);
            
        } while (!safePosition && attempts < 100);
        
        if (attempts < 100) {
            // Lưu vị trí hồi sinh
            snake.respawnX = x;
            snake.respawnY = y;
            
            // Thêm marker vệt sáng
            this.respawnMarkers.push({
                x: x,
                y: y,
                color: snake.color,
                createdAt: Date.now(),
                snake: snake
            });
        }
        
        // Đặt thời gian hồi sinh sau 3 giây
        snake.respawnTime = Date.now() + 3000;
        
        // Cập nhật UI
        const type = snake === this.player ? 'player' : (snake === this.player2 ? 'player3' : 'ai');
        document.getElementById(`${type}-status`).textContent = '💀 Hồi sinh sau 3s...';
        
        // Cập nhật độ dài ngay lập tức
        this.updateUI();
        
        console.log(reason);
    }
    
    respawnSnake(snake, type) {
        // Dùng vị trí đã lưu hoặc tìm vị trí mới
        let x = snake.respawnX;
        let y = snake.respawnY;
        
        if (x === undefined || y === undefined) {
            // Tìm vị trí hồi sinh an toàn
            let attempts = 0;
            let safePosition = false;
            
            do {
                x = Math.floor(Math.random() * (CONFIG.GRID_SIZE_X - 4)) + 2;
                y = Math.floor(Math.random() * CONFIG.GRID_SIZE_Y);
                attempts++;
                
                safePosition = !this.isOccupied(x, y) && 
                              !this.isOccupied(x - 1, y) && 
                              !this.isOccupied(x - 2, y);
                
            } while (!safePosition && attempts < 100);
            
            if (attempts >= 100) {
                snake.respawnTime = Date.now() + 1000;
                return;
            }
        }
        
        // Xóa marker
        this.respawnMarkers = this.respawnMarkers.filter(m => m.snake !== snake);
        
        // Hồi sinh với 3 đốt
        snake.body = [
            {x: x, y: y},
            {x: x - 1, y: y},
            {x: x - 2, y: y}
        ];
        snake.foodData = [null, null, null]; // Reset thông tin thức ăn
        snake.direction = {x: 1, y: 0};
        snake.nextDirection = {x: 1, y: 0};
        snake.alive = true;
        snake.respawnTime = 0;
        snake.stunned = false;
        snake.growing = false;
        snake.growUntil = 0;
        snake.respawnX = undefined;
        snake.respawnY = undefined;
        
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
                    // Ăn trái cây
                    const growCount = food.isSuper ? 3 : 1; // Super fruit cho 3 đốt
                    
                    for (let j = 0; j < growCount; j++) {
                        snake.body.push({...snake.body[snake.body.length - 1]});
                        // Lưu thông tin thức ăn vào đốt mới
                        snake.foodData.push({
                            isCorrect: food.isCorrect,
                            label: food.label
                        });
                    }
                    
                    snake.growing = true;
                    snake.growUntil = Date.now() + 200; // Hiệu ứng 0.2s
                    
                    if (food.isSuper) {
                        document.getElementById(`${type}-status`).textContent = '⭐ +3 đốt!';
                        setTimeout(() => {
                            if (!snake.stunned) {
                                document.getElementById(`${type}-status`).textContent = '';
                            }
                        }, 1000);
                    }
                } else {
                    // Ăn bom - giảm 2 đốt
                    
                    // Giảm 2 đốt (nếu đủ dài)
                    if (snake.body.length > 3) {
                        snake.body.pop();
                        snake.foodData.pop();
                        if (snake.body.length > 3) {
                            snake.body.pop();
                            snake.foodData.pop();
                        }
                    }
                    
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
    
    spawnFood(isCorrect, isSuper = false) {
        // Giới hạn số lượng mồi trên màn hình (không giới hạn super fruit)
        if (!isSuper) {
            const correctCount = this.foods.filter(f => f.isCorrect && !f.isSuper).length;
            const wrongCount = this.foods.filter(f => !f.isCorrect).length;
            
            if (isCorrect && correctCount >= 20) return; // Tối đa 20 trái cây thường
            if (!isCorrect && wrongCount >= 10) return;  // Tối đa 10 bom
        }
        
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * CONFIG.GRID_SIZE_X);
            y = Math.floor(Math.random() * CONFIG.GRID_SIZE_Y);
            attempts++;
        } while (this.isOccupied(x, y) && attempts < 100);
        
        if (attempts >= 100) return;
        
        let label;
        
        if (isCorrect) {
            // Chọn trái cây
            label = this.currentTopic.correct[Math.floor(Math.random() * this.currentTopic.correct.length)];
        } else {
            // Chọn bom
            label = "💣";
        }
        
        this.foods.push({x, y, isCorrect, label, isSuper});
    }
    
    isOccupied(x, y) {
        // Kiểm tra vị trí có bị chiếm không
        for (const segment of this.player.body) {
            if (segment.x === x && segment.y === y) return true;
        }
        for (const segment of this.ai.body) {
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
            // Hết giờ - so sánh độ dài
            const playerLength = this.player.body.length;
            const aiLength = this.ai.body.length;
            
            if (this.gameMode === 'multi' && this.player2) {
                const player2Length = this.player2.body.length;
                const maxLength = Math.max(playerLength, aiLength, player2Length);
                
                if (playerLength === maxLength && aiLength !== maxLength && player2Length !== maxLength) {
                    this.gameOver('player', 'Hết giờ! Người chơi 1 dài nhất!');
                } else if (player2Length === maxLength && playerLength !== maxLength && aiLength !== maxLength) {
                    this.gameOver('player3', 'Hết giờ! Người chơi 2 dài nhất!');
                } else if (aiLength === maxLength && playerLength !== maxLength && player2Length !== maxLength) {
                    this.gameOver('ai', 'Hết giờ! AI dài nhất!');
                } else {
                    this.gameOver('draw', 'Hết giờ! Hòa nhau!');
                }
            } else {
                if (playerLength > aiLength) {
                    this.gameOver('player', 'Hết giờ! Người chơi dài hơn!');
                } else if (aiLength > playerLength) {
                    this.gameOver('ai', 'Hết giờ! AI dài hơn!');
                } else {
                    this.gameOver('draw', 'Hết giờ! Hai bên bằng nhau!');
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('player-length').textContent = this.player.body.length;
        document.getElementById('ai-length').textContent = this.ai.body.length;
        
        if (this.player2) {
            document.getElementById('player3-length').textContent = this.player2.body.length;
        }
    }
    
    draw() {
        // Xóa canvas - nền trắng
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Vẽ marker hồi sinh (vệt sáng)
        const now = Date.now();
        this.respawnMarkers.forEach(marker => {
            const elapsed = now - marker.createdAt;
            const progress = elapsed / 3000; // 3 giây
            
            if (progress < 1) {
                // Hiệu ứng nhấp nháy
                const alpha = Math.abs(Math.sin(elapsed / 200)) * 0.7 + 0.3;
                this.ctx.globalAlpha = alpha;
                
                // Vẽ vệt sáng (3 ô)
                for (let i = 0; i < 3; i++) {
                    const x = (marker.x - i) * CONFIG.CELL_SIZE;
                    const y = marker.y * CONFIG.CELL_SIZE;
                    
                    // Viền sáng
                    this.ctx.strokeStyle = marker.color;
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
                    
                    // Nền mờ
                    this.ctx.fillStyle = marker.color + '40'; // 40 = 25% opacity
                    this.ctx.fillRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
                }
                
                this.ctx.globalAlpha = 1;
            }
        });
        
        // Vẽ thức ăn
        this.foods.forEach(food => {
            // Kích thước và font size tùy theo loại
            const isSuper = food.isSuper;
            const fontSize = isSuper ? 76 : 64; // Gấp đôi kích thước emoji (38*2=76, 32*2=64)
            
            this.ctx.fillStyle = food.isCorrect ? '#4CAF50' : '#f44336';
            this.ctx.fillRect(
                food.x * CONFIG.CELL_SIZE + 2,
                food.y * CONFIG.CELL_SIZE + 2,
                CONFIG.CELL_SIZE - 4,
                CONFIG.CELL_SIZE - 4
            );
            
            // Vẽ emoji với kích thước lớn hơn
            this.ctx.font = `${fontSize}px Arial`;
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
        if (this.ai.alive) this.drawSnake(this.ai);
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
            
            // Hiệu ứng to lên khi ăn mồi
            let scale = 1;
            if (snake.growing && Date.now() < snake.growUntil) {
                const progress = (snake.growUntil - Date.now()) / 200;
                scale = 1 + (progress * 0.3); // To lên 30%
            }
            
            const cellSize = CONFIG.CELL_SIZE * scale;
            const offset = (CONFIG.CELL_SIZE - cellSize) / 2;
            
            if (index === 0) {
                // Đầu rắn
                
                // Kiểm tra nếu là bot thì vẽ emoji, còn lại vẽ icon
                if (snake.isBot) {
                    // Bot - vẽ emoji
                    this.ctx.fillStyle = snake.color;
                    this.ctx.beginPath();
                    this.ctx.roundRect(x + offset + 2, y + offset + 2, cellSize - 4, cellSize - 4, 6);
                    this.ctx.fill();
                    
                    this.ctx.font = `${80 * scale}px Arial`; // Tăng lên 80px
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        '🤖',
                        x + CONFIG.CELL_SIZE / 2,
                        y + CONFIG.CELL_SIZE / 2
                    );
                } else {
                    // Người chơi - vẽ icon SVG
                    let icon;
                    if (snake === this.player2) {
                        icon = this.playerIcons.player2;
                    } else {
                        icon = this.playerIcons.player1;
                    }
                    
                    // Vẽ icon nếu đã load xong
                    if (icon && icon.complete) {
                        const iconSize = cellSize * 1.8; // Tăng lên 1.8x
                        const centerX = x + CONFIG.CELL_SIZE / 2;
                        const centerY = y + CONFIG.CELL_SIZE / 2;
                        
                        // Tính góc xoay dựa trên hướng di chuyển (thêm 180°)
                        let angle = 0;
                        if (snake.direction.x === 1) angle = Math.PI / 2 + Math.PI;        // Phải -> 270°
                        else if (snake.direction.x === -1) angle = -Math.PI / 2 + Math.PI;  // Trái -> 90°
                        else if (snake.direction.y === 1) angle = Math.PI + Math.PI;  // Xuống -> 360° (0°)
                        else if (snake.direction.y === -1) angle = 0 + Math.PI; // Lên -> 180°
                        
                        // Lưu trạng thái canvas
                        this.ctx.save();
                        
                        // Di chuyển đến tâm ô
                        this.ctx.translate(centerX, centerY);
                        
                        // Xoay theo hướng
                        this.ctx.rotate(angle);
                        
                        // Vẽ icon (tâm tại gốc tọa độ)
                        this.ctx.drawImage(
                            icon,
                            -iconSize / 2,
                            -iconSize / 2,
                            iconSize,
                            iconSize
                        );
                        
                        // Khôi phục trạng thái canvas
                        this.ctx.restore();
                    }
                }
            } else {
                // Thân rắn - gradient và bo tròn
                const gradient = this.ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
                gradient.addColorStop(0, snake.color);
                gradient.addColorStop(1, this.adjustBrightness(snake.color, -20));
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                // Tăng kích thước thân rắn vừa phải
                const bodySize = cellSize * 1.1; // Tăng 10% thay vì 50%
                const bodyOffset = (CONFIG.CELL_SIZE - bodySize) / 2;
                this.ctx.roundRect(x + bodyOffset + 3, y + bodyOffset + 3, bodySize - 6, bodySize - 6, 4);
                this.ctx.fill();
                
                // Viền sáng
                this.ctx.strokeStyle = this.adjustBrightness(snake.color, 30);
                this.ctx.lineWidth = 2;
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
        } else if (winner === 'ai') {
            resultText = '🤖 AI thắng!';
        } else {
            resultText = '🤝 Hòa!';
        }
        
        // Tạo bảng xếp hạng - chỉ hiển thị độ dài
        let statsHTML = `<div><strong>Lý do kết thúc:</strong> ${reason}</div><div style="margin-top: 15px;">`;
        
        statsHTML += `<div>👨 Người chơi 1: ${this.player.body.length} đốt</div>`;
        
        if (this.player2) {
            statsHTML += `<div>👩 Người chơi 2: ${this.player2.body.length} đốt</div>`;
        }
        
        statsHTML += `<div>🤖 AI: ${this.ai.body.length} đốt</div>`;
        statsHTML += `</div>`;
        
        title.textContent = resultText;
        stats.innerHTML = statsHTML;
        
        modal.classList.add('show');
    }
}

// Khởi động game
const game = new Game();

// Xử lý slider tốc độ - chạy ngay vì script ở cuối body
console.log('Bắt đầu khởi tạo slider...');

const speedSlider = document.getElementById('gameSpeed');
const speedDisplay = document.getElementById('speedDisplay');

console.log('speedSlider:', speedSlider);
console.log('speedDisplay:', speedDisplay);

if (!speedSlider || !speedDisplay) {
    console.error('Không tìm thấy slider hoặc display!');
} else {
    const speedLabels = {
        1: 'Rất chậm',
        2: 'Chậm',
        3: 'Trung bình',
        4: 'Nhanh',
        5: 'Rất nhanh'
    };

    const speedValues = {
        1: 250,
        2: 180,
        3: 140,
        4: 100,
        5: 70
    };

    // Cập nhật hiển thị khi kéo slider
    speedSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        speedDisplay.textContent = speedLabels[value];
        
        // Cập nhật tốc độ ngay lập tức cho tất cả cấp độ
        const customSpeed = speedValues[value];
        console.log('Cập nhật tốc độ:', customSpeed, 'ms');
        Object.keys(DIFFICULTY_LEVELS).forEach(key => {
            DIFFICULTY_LEVELS[key].gameSpeed = customSpeed;
            console.log(`${key}: gameSpeed =`, DIFFICULTY_LEVELS[key].gameSpeed);
        });
    });

    // Khởi tạo tốc độ ban đầu
    const initialSpeed = speedValues[speedSlider.value];
    console.log('Tốc độ khởi tạo:', initialSpeed, 'ms');
    Object.keys(DIFFICULTY_LEVELS).forEach(key => {
        DIFFICULTY_LEVELS[key].gameSpeed = initialSpeed;
    });
    
    console.log('Slider đã được khởi tạo thành công!');
}
