console.log('=== FILE GAME.JS BẮT ĐẦU LOAD ===');

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
        
        this.playerIcons.player1.src = 'assets/artboard-18_89038.svg';
        this.playerIcons.player2.src = 'assets/iconfinder-snake-4591880_122131.svg';
        this.playerIcons.ai.src = 'assets/artboard-18_89038.svg';
        
        // Khởi tạo các manager
        this.audioManager = new AudioManager();
        this.inputController = new InputController(this.canvas);
        this.collisionManager = new CollisionManager(CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y);
        
        this.calculateCanvasSize();
        
        this.renderer = new Renderer(this.canvas, this.ctx, CONFIG.CELL_SIZE, this.playerIcons);
        
        this.difficulty = 'medium';
        this.gameMode = 'single';
        this.currentTopic = TOPICS[0];
        
        this.questions = [];
        this.loadQuestions();
        
        this.reset();
        this.setupControls();
        
        window.addEventListener('resize', () => this.calculateCanvasSize());
    }
    
    async loadQuestions() {
        this.questions = await QuestionManager.loadQuestions();
    }
    
    calculateCanvasSize() {
        const isSmallScreen = window.innerWidth < 800;
        
        let availableWidth, availableHeight;
        
        if (isSmallScreen) {
            // Màn hình nhỏ: tính chính xác để vừa màn hình
            availableWidth = window.innerWidth;
            availableHeight = window.innerHeight;
            
            // Tính cell size để canvas vừa khít
            const cellSizeByWidth = availableWidth / CONFIG.GRID_SIZE_X;
            const cellSizeByHeight = availableHeight / CONFIG.GRID_SIZE_Y;
            
            CONFIG.CELL_SIZE = Math.min(cellSizeByWidth, cellSizeByHeight);
        } else {
            // Màn hình lớn: chừa chỗ cho UI
            availableWidth = window.innerWidth * 0.92;
            availableHeight = window.innerHeight * 0.70;
            
            const cellSizeByWidth = availableWidth / CONFIG.GRID_SIZE_X;
            const cellSizeByHeight = availableHeight / CONFIG.GRID_SIZE_Y;
            
            CONFIG.CELL_SIZE = Math.min(cellSizeByWidth, cellSizeByHeight, 30);
            CONFIG.CELL_SIZE = Math.max(CONFIG.CELL_SIZE, 10);
        }
        
        this.canvas.width = CONFIG.GRID_SIZE_X * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_SIZE_Y * CONFIG.CELL_SIZE;
        
        if (this.renderer) {
            this.renderer.cellSize = CONFIG.CELL_SIZE;
        }
    }
    
    transitionScreen(fromId, toId) {
        const fromScreen = document.getElementById(fromId);
        const toScreen = document.getElementById(toId);
        
        // Fade out
        fromScreen.style.transition = 'opacity 0.3s ease-out';
        fromScreen.style.opacity = '0';
        
        setTimeout(() => {
            fromScreen.style.display = 'none';
            toScreen.style.display = 'flex';
            toScreen.style.opacity = '0';
            
            // Fade in
            setTimeout(() => {
                toScreen.style.transition = 'opacity 0.3s ease-in';
                toScreen.style.opacity = '1';
            }, 50);
        }, 300);
    }
    
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        const customTime = parseInt(document.getElementById('gameTime')?.value) || 60;
        this.timeLeft = customTime;
        
        this.respawnMarkers = [];
        
        // Khởi tạo rắn người chơi 1
        this.player = SnakeManager.createSnake(5, 10, {x: 1, y: 0}, '#2196F3', false);
        
        // Khởi tạo rắn AI
        this.ai = SnakeManager.createSnake(15, 10, {x: -1, y: 0}, '#f44336', true);
        
        // Khởi tạo rắn người chơi 2 (nếu chế độ 2 người)
        if (this.gameMode === 'multi') {
            this.player2 = SnakeManager.createSnake(10, 5, {x: 0, y: -1}, '#4CAF50', false);
            this.player2.isPlayer2 = true;
        } else {
            this.player2 = null;
        }
        
        this.foods = [];
        UIManager.updateUI(this.player, this.ai, this.player2);
    }
    
    selectNewTopic() {
        this.currentTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    }
    
    setupControls() {
        // Xử lý chuyển bước menu
        this.setupMenuControls();
        
        // Xử lý keyboard
        this.inputController.setupKeyboard((key, keyLower) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            // Điều khiển người chơi 1 (Arrow keys)
            if (this.player.alive) {
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
            }
            
            // Điều khiển người chơi 2 (WASD)
            if (this.gameMode === 'multi' && this.player2 && this.player2.alive) {
                const dir2 = this.player2.direction;
                if (keyLower === 'w' && dir2.y === 0) {
                    this.player2.nextDirection = {x: 0, y: -1};
                } else if (keyLower === 's' && dir2.y === 0) {
                    this.player2.nextDirection = {x: 0, y: 1};
                } else if (keyLower === 'a' && dir2.x === 0) {
                    this.player2.nextDirection = {x: -1, y: 0};
                } else if (keyLower === 'd' && dir2.x === 0) {
                    this.player2.nextDirection = {x: 1, y: 0};
                }
            }
        });
        
        // Xử lý touch controls
        this.inputController.setupTouchControls((clickX, clickY) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            if (this.player.alive) {
                InputController.setSnakeDirectionToPoint(this.player, clickX, clickY, CONFIG.CELL_SIZE);
            }
            
            if (this.gameMode === 'multi' && this.player2 && this.player2.alive) {
                InputController.setSnakeDirectionToPoint(this.player2, clickX, clickY, CONFIG.CELL_SIZE);
            }
        });
        
        // Các nút game
        this.setupGameButtons();
    }
    
    setupMenuControls() {
        // Nút Let's Go từ welcome screen -> difficulty screen
        const letsGoBtn = document.getElementById('letsGoBtn');
        if (letsGoBtn) {
            letsGoBtn.addEventListener('click', () => {
                this.transitionScreen('welcomeScreen', 'difficultyScreen');
            });
        }
        
        // Nút Hướng dẫn từ welcome screen -> guide screen
        const guideBtn = document.getElementById('guideBtn');
        if (guideBtn) {
            guideBtn.addEventListener('click', () => {
                this.transitionScreen('welcomeScreen', 'guideScreen');
            });
        }
        
        // Nút Back từ guide -> welcome
        const backToWelcomeBtn = document.getElementById('backToWelcomeBtn');
        if (backToWelcomeBtn) {
            backToWelcomeBtn.addEventListener('click', () => {
                this.transitionScreen('guideScreen', 'welcomeScreen');
            });
        }
        
        // Nút Next từ difficulty -> mode
        const nextBtn1 = document.getElementById('nextBtn1');
        if (nextBtn1) {
            nextBtn1.addEventListener('click', () => {
                this.transitionScreen('difficultyScreen', 'modeScreen');
            });
        }
        
        // Nút Next từ mode -> settings
        const nextBtn2 = document.getElementById('nextBtn2');
        if (nextBtn2) {
            nextBtn2.addEventListener('click', () => {
                this.transitionScreen('modeScreen', 'settingsScreen');
            });
        }
        
        // Nút Back từ mode -> difficulty
        const backBtn1 = document.getElementById('backBtn1');
        if (backBtn1) {
            backBtn1.addEventListener('click', () => {
                this.transitionScreen('modeScreen', 'difficultyScreen');
            });
        }
        
        // Nút Back từ settings -> mode
        const backBtn2 = document.getElementById('backBtn2');
        if (backBtn2) {
            backBtn2.addEventListener('click', () => {
                this.transitionScreen('settingsScreen', 'modeScreen');
            });
        }
        
        // Chọn chế độ chơi
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.gameMode = e.currentTarget.dataset.mode;
            });
        });
        
        // Chọn cấp độ
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.difficulty = e.currentTarget.dataset.level;
            });
        });
    }
    
    setupGameButtons() {
        // Nút bắt đầu chơi
        document.getElementById('playBtn').addEventListener('click', () => {
            this.selectNewTopic();
            this.reset();
            
            const level = DIFFICULTY_LEVELS[this.difficulty];
            document.getElementById('player2-name').textContent = level.aiName;
            
            if (this.gameMode === 'multi') {
                document.getElementById('player3-section').style.display = 'block';
            } else {
                document.getElementById('player3-section').style.display = 'none';
            }
            
            document.getElementById('settingsScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            this.start();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        document.getElementById('backBtn').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn thoát? Tiến trình sẽ bị mất.')) {
                this.stopGame();
                this.showMenu();
            }
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('show');
            this.selectNewTopic();
            this.reset();
            document.getElementById('settingsScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            this.start();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('show');
            this.showMenu();
        });
    }
    
    showMenu() {
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('welcomeScreen').style.opacity = '1';
        document.body.classList.remove('game-active');
        
        this.reset();
    }
    
    stopGame() {
        this.gameRunning = false;
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.foodSpawner) clearInterval(this.foodSpawner);
        if (this.bookSpawner) clearInterval(this.bookSpawner);
        if (this.timer) clearInterval(this.timer);
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        
        document.body.classList.remove('game-active');
    }
    
    start() {
        this.gameRunning = true;
        const level = DIFFICULTY_LEVELS[this.difficulty];
        
        document.body.classList.add('game-active');
        
        // Spawn thức ăn ban đầu
        for (let i = 0; i < 3; i++) {
            FoodManager.spawnFood(this.foods, true, false, this.currentTopic, 
                CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
        }
        FoodManager.spawnFood(this.foods, false, false, this.currentTopic, 
            CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
        
        // Khởi tạo AI controller
        this.aiController = new AIController(
            this.difficulty, 
            this.foods, 
            [this.player, this.ai, this.player2].filter(s => s),
            CONFIG.GRID_SIZE_X,
            CONFIG.GRID_SIZE_Y
        );
        
        this.gameLoop = setInterval(() => this.update(), level.gameSpeed);
        
        this.foodSpawner = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                FoodManager.spawnFood(this.foods, true, false, this.currentTopic, 
                    CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
            }
            FoodManager.spawnFood(this.foods, false, false, this.currentTopic, 
                CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
        }, 1000);
        
        this.bookSpawner = setInterval(() => {
            FoodManager.spawnBook(this.foods, CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, 
                (x, y) => this.isOccupied(x, y));
        }, 5000);
        
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
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
        
        if (this.gamePaused) {
            // Dừng tất cả interval khi pause
            if (this.timer) clearInterval(this.timer);
            if (this.foodSpawner) clearInterval(this.foodSpawner);
            if (this.bookSpawner) clearInterval(this.bookSpawner);
        } else {
            // Tiếp tục các interval khi resume
            this.timer = setInterval(() => this.updateTimer(), 1000);
            
            this.foodSpawner = setInterval(() => {
                for (let i = 0; i < 3; i++) {
                    FoodManager.spawnFood(this.foods, true, false, this.currentTopic, 
                        CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
                }
                FoodManager.spawnFood(this.foods, false, false, this.currentTopic, 
                    CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
            }, 1000);
            
            this.bookSpawner = setInterval(() => {
                FoodManager.spawnBook(this.foods, CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, 
                    (x, y) => this.isOccupied(x, y));
            }, 5000);
        }
    }
    
    update() {
        if (this.gamePaused) return;
        
        const now = Date.now();
        
        // Cập nhật rắn người chơi
        this.updateSnake(this.player, 'player', false);
        
        // Cập nhật rắn AI
        this.updateSnake(this.ai, 'ai', true);
        
        // Cập nhật rắn người chơi 2
        if (this.player2) {
            this.updateSnake(this.player2, 'player3', false);
        }
        
        // Kiểm tra va chạm
        this.collisionManager.checkCollisions(
            [this.player, this.ai, this.player2].filter(s => s),
            (snake, reason) => this.killSnake(snake, reason)
        );
        
        // Kiểm tra ăn thức ăn
        if (this.player.alive) this.checkFoodCollision(this.player, 'player');
        if (this.ai.alive) this.checkFoodCollision(this.ai, 'ai');
        if (this.player2 && this.player2.alive) this.checkFoodCollision(this.player2, 'player3');
    }
    
    updateSnake(snake, type, isAI) {
        const now = Date.now();
        
        if (snake.alive) {
            if (!snake.stunned || now >= snake.stunnedUntil) {
                if (snake.stunned) {
                    snake.stunned = false;
                    UIManager.updateStatus(type, '');
                }
                
                if (isAI) {
                    this.aiController.updateAI(snake);
                } else {
                    snake.direction = snake.nextDirection;
                }
                
                SnakeManager.moveSnake(snake);
            }
        } else if (snake.respawnTime > 0 && now >= snake.respawnTime) {
            this.respawnSnake(snake, type);
        }
    }
    
    killSnake(snake, reason) {
        snake.alive = false;
        snake.lives--;  // Giảm số mạng
        
        // Biến thân rắn thành trái cây có label (như trái cây random bình thường)
        snake.body.forEach((segment) => {
            const label = this.currentTopic.correct[Math.floor(Math.random() * this.currentTopic.correct.length)];
            
            this.foods.push({
                x: segment.x,
                y: segment.y,
                isCorrect: true,
                label: label,
                isSuper: false
            });
        });
        
        const type = snake === this.player ? 'player' : (snake === this.player2 ? 'player3' : 'ai');
        
        // Kiểm tra còn mạng không
        if (snake.lives <= 0) {
            UIManager.updateStatus(type, '💀 Hết mạng!');
            UIManager.updateUI(this.player, this.ai, this.player2);
            console.log(reason + ' - Hết mạng!');
            return;  // Không hồi sinh nữa
        }
        
        // Tìm vị trí hồi sinh
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
            snake.respawnX = x;
            snake.respawnY = y;
            
            this.respawnMarkers.push({
                x: x,
                y: y,
                color: snake.color,
                createdAt: Date.now(),
                snake: snake
            });
        }
        
        snake.respawnTime = Date.now() + 3000;
        
        UIManager.updateStatus(type, `💀 Hồi sinh sau 3s... (${snake.lives} mạng còn lại)`);
        UIManager.updateUI(this.player, this.ai, this.player2);
        
        console.log(reason);
    }
    
    respawnSnake(snake, type) {
        let x = snake.respawnX;
        let y = snake.respawnY;
        
        if (x === undefined || y === undefined) {
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
        
        this.respawnMarkers = this.respawnMarkers.filter(m => m.snake !== snake);
        
        snake.body = [
            {x: x, y: y},
            {x: x - 1, y: y},
            {x: x - 2, y: y}
        ];
        snake.foodData = [null, null, null];
        snake.direction = {x: 1, y: 0};
        snake.nextDirection = {x: 1, y: 0};
        snake.alive = true;
        snake.respawnTime = 0;
        snake.stunned = false;
        snake.growing = false;
        snake.growUntil = 0;
        snake.respawnX = undefined;
        snake.respawnY = undefined;
        
        snake.invincible = true;
        snake.invincibleUntil = Date.now() + 1000;
        
        UIManager.updateStatus(type, '✨ Hồi sinh! (Bất tử 1s)');
        UIManager.clearStatus(type, 1000);
    }
    
    checkFoodCollision(snake, type) {
        const food = FoodManager.checkFoodCollision(snake, this.foods);
        
        if (!food) return;
        
        if (food.isBook) {
            this.showQuestion(snake, type);
            return;
        }
        
        if (food.isCorrect) {
            this.audioManager.play('correct');
            
            const growCount = food.isSuper ? 3 : 1;
            SnakeManager.growSnake(snake, growCount, {
                isCorrect: food.isCorrect,
                label: food.label
            });
            
            if (food.isSuper) {
                UIManager.updateStatus(type, '⭐ +3 đốt!');
                UIManager.clearStatus(type, 1000);
            }
        } else {
            this.audioManager.play('wrong');
            
            SnakeManager.shrinkSnake(snake, 2);
            
            snake.stunned = true;
            snake.stunnedUntil = Date.now() + CONFIG.STUN_DURATION;
            UIManager.updateStatus(type, '😵 Choáng!');
        }
        
        UIManager.updateUI(this.player, this.ai, this.player2);
    }
    
    isOccupied(x, y) {
        for (const segment of this.player.body) {
            if (segment.x === x && segment.y === y) return true;
        }
        for (const segment of this.ai.body) {
            if (segment.x === x && segment.y === y) return true;
        }
        if (this.player2) {
            for (const segment of this.player2.body) {
                if (segment.x === x && segment.y === y) return true;
            }
        }
        for (const food of this.foods) {
            if (food.x === x && food.y === y) return true;
        }
        return false;
    }
    
    updateTimer() {
        if (this.gamePaused) return;
        
        this.timeLeft--;
        UIManager.updateTimer(this.timeLeft);
        
        if (this.timeLeft <= 0) {
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
    
    draw() {
        this.renderer.clear();
        this.renderer.drawRespawnMarkers(this.respawnMarkers);
        this.renderer.drawFoods(this.foods);
        
        if (this.player.alive) this.renderer.drawSnake(this.player);
        if (this.ai.alive) this.renderer.drawSnake(this.ai);
        if (this.player2 && this.player2.alive) this.renderer.drawSnake(this.player2);
    }
    
    gameOver(winner, reason) {
        this.stopGame();
        UIManager.showGameOver(winner, reason, this.player, this.ai, this.player2);
    }
    
    showCelebration(isCorrect, playerName) {
        if (!isCorrect) return;
        
        // Tạo overlay
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        overlay.innerHTML = `
            <div class="celebration-message">
                <h2>🎉 Chúc mừng! 🎉</h2>
                <p>${playerName} trả lời đúng!</p>
                <p>+10 đốt 🐍</p>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Tạo confetti
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
        
        // Xóa overlay sau 2 giây
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }, 2000);
    }
    
    showQuestion(snake, type) {
        if (this.questions.length === 0) {
            console.log('Chưa load câu hỏi');
            return;
        }
        
        this.gamePaused = true;
        clearInterval(this.timer);
        clearInterval(this.foodSpawner);
        clearInterval(this.bookSpawner);
        
        const question = this.questions[Math.floor(Math.random() * this.questions.length)];
        
        // Hiển thị modal câu hỏi cho tất cả (cả bot và người chơi)
        const modal = document.getElementById('questionModal');
        document.getElementById('questionText').textContent = question.question;
        
        const answersDiv = document.getElementById('questionAnswers');
        answersDiv.innerHTML = '';
        
        // Nếu là bot, tạo các nút nhưng disable
        const isBot = snake.isBot;
        
        ['A', 'B', 'C', 'D'].forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = `${option}. ${question[option]}`;
            
            if (isBot) {
                // Bot: disable nút, người chơi chỉ xem
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            } else {
                // Người chơi: cho phép click
                btn.onclick = () => this.answerQuestion(option, question.answer, snake, type);
            }
            
            answersDiv.appendChild(btn);
        });
        
        modal.classList.add('show');
        
        // Nếu là bot, tự động trả lời sau 2 giây
        if (isBot) {
            const level = DIFFICULTY_LEVELS[this.difficulty];
            const correctRate = level.aiQuestionCorrectRate;
            
            // Hiển thị thông báo AI đang suy nghĩ
            document.getElementById('questionTitle').textContent = '📚 AI đang trả lời...';
            
            setTimeout(() => {
                let answer;
                if (Math.random() < correctRate) {
                    // Trả lời đúng
                    answer = question.answer;
                } else {
                    // Trả lời sai - chọn ngẫu nhiên đáp án khác
                    const wrongAnswers = ['A', 'B', 'C', 'D'].filter(opt => opt !== question.answer);
                    answer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
                }
                
                // Highlight đáp án AI chọn
                const buttons = answersDiv.querySelectorAll('.answer-btn');
                buttons.forEach(btn => {
                    const btnOption = btn.textContent.charAt(0);
                    if (btnOption === answer) {
                        btn.style.background = '#667eea';
                        btn.style.color = 'white';
                        btn.style.transform = 'scale(1.05)';
                    }
                });
                
                // Đợi 1 giây để người chơi thấy AI chọn đáp án nào
                setTimeout(() => {
                    this.answerQuestion(answer, question.answer, snake, type);
                }, 1000);
            }, 2000);
            
            return;
        }
        
        // Người chơi - đếm ngược thời gian
        document.getElementById('questionTitle').textContent = '📚 Câu hỏi';
        let timeLeft = 20;
        document.getElementById('questionTimer').textContent = timeLeft;
        
        this.questionTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('questionTimer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.answerQuestion(null, question.answer, snake, type);
            }
        }, 1000);
    }
    
    answerQuestion(selected, correct, snake, type) {
        clearInterval(this.questionTimer);
        
        const modal = document.getElementById('questionModal');
        modal.classList.remove('show');
        
        const isCorrect = selected === correct;
        
        if (isCorrect) {
            SnakeManager.growSnake(snake, 10, {isCorrect: true, label: '📚'});
            UIManager.updateStatus(type, '✅ Đúng! +10 đốt');
            this.audioManager.play('correct');
            
            // Hiển thị celebration với tên người chơi
            let playerName = 'AI';
            if (type === 'player') playerName = 'Người chơi 1';
            else if (type === 'player3') playerName = 'Người chơi 2';
            
            // Game vẫn pause trong lúc celebration
            this.showCelebration(true, playerName);
            
            // Đợi 2.5 giây (thời gian celebration) rồi mới tiếp tục game
            setTimeout(() => {
                this.resumeGameAfterQuestion();
            }, 2500);
        } else {
            SnakeManager.shrinkSnake(snake, 3);
            UIManager.updateStatus(type, '❌ Sai! -3 đốt');
            this.audioManager.play('wrong');
            
            // Trả lời sai thì tiếp tục game ngay
            this.resumeGameAfterQuestion();
        }
        
        UIManager.clearStatus(type, 2000);
        UIManager.updateUI(this.player, this.ai, this.player2);
    }
    
    resumeGameAfterQuestion() {
        // Tiếp tục game sau khi trả lời câu hỏi
        this.gamePaused = false;
        this.timer = setInterval(() => this.updateTimer(), 1000);
        
        this.foodSpawner = setInterval(() => {
            for (let i = 0; i < 3; i++) {
                FoodManager.spawnFood(this.foods, true, false, this.currentTopic, 
                    CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
            }
            FoodManager.spawnFood(this.foods, false, false, this.currentTopic, 
                CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, (x, y) => this.isOccupied(x, y));
        }, 1000);
        
        this.bookSpawner = setInterval(() => {
            FoodManager.spawnBook(this.foods, CONFIG.GRID_SIZE_X, CONFIG.GRID_SIZE_Y, 
                (x, y) => this.isOccupied(x, y));
        }, 5000);
    }   
}

// Khởi động game
const game = new Game();

// Xử lý slider tốc độ
const speedSlider = document.getElementById('gameSpeed');
const speedDisplay = document.getElementById('speedDisplay');

if (speedSlider && speedDisplay) {
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

    speedSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        speedDisplay.textContent = speedLabels[value];
        
        const customSpeed = speedValues[value];
        Object.keys(DIFFICULTY_LEVELS).forEach(key => {
            DIFFICULTY_LEVELS[key].gameSpeed = customSpeed;
        });
    });

    const initialSpeed = speedValues[speedSlider.value];
    Object.keys(DIFFICULTY_LEVELS).forEach(key => {
        DIFFICULTY_LEVELS[key].gameSpeed = initialSpeed;
    });
}
