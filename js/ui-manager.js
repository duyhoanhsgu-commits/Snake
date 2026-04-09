// Quản lý UI và controls

class UIManager {
    static updateUI(player, ai, player2) {
        document.getElementById('player-length').textContent = player.body.length;
        document.getElementById('ai-length').textContent = ai.body.length;
        
        if (player2) {
            document.getElementById('player3-length').textContent = player2.body.length;
        }
    }
    
    static updateStatus(type, message) {
        document.getElementById(`${type}-status`).textContent = message;
    }
    
    static clearStatus(type, delay = 2000) {
        setTimeout(() => {
            document.getElementById(`${type}-status`).textContent = '';
        }, delay);
    }
    
    static updateTimer(timeLeft) {
        document.getElementById('timer').textContent = timeLeft;
    }
    
    static showGameOver(winner, reason, player, ai, player2) {
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
        
        let statsHTML = `<div><strong>Lý do kết thúc:</strong> ${reason}</div><div style="margin-top: 15px;">`;
        statsHTML += `<div>👨 Người chơi 1: ${player.body.length} đốt</div>`;
        
        if (player2) {
            statsHTML += `<div>👩 Người chơi 2: ${player2.body.length} đốt</div>`;
        }
        
        statsHTML += `<div>🤖 AI: ${ai.body.length} đốt</div>`;
        statsHTML += `</div>`;
        
        title.textContent = resultText;
        stats.innerHTML = statsHTML;
        
        modal.classList.add('show');
    }
    
    static setupTouchControls(canvas, onTurn) {
        let lastTouchTime = 0;
        const touchCooldown = 100;
        
        canvas.addEventListener('touchstart', (e) => {
            const now = Date.now();
            if (now - lastTouchTime < touchCooldown) return;
            lastTouchTime = now;
            
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const screenCenter = rect.width / 2;
            const isTouchLeft = touchX < screenCenter;
            
            onTurn(isTouchLeft);
        });
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const screenCenter = rect.width / 2;
            const isClickLeft = clickX < screenCenter;
            
            onTurn(isClickLeft);
        });
    }
    
    static turnSnakeRelative(snake, turnLeft) {
        const dir = snake.direction;
        
        if (turnLeft) {
            if (dir.x === 1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: -1};
            } else if (dir.x === -1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: 1};
            } else if (dir.x === 0 && dir.y === -1) {
                snake.nextDirection = {x: -1, y: 0};
            } else if (dir.x === 0 && dir.y === 1) {
                snake.nextDirection = {x: 1, y: 0};
            }
        } else {
            if (dir.x === 1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: 1};
            } else if (dir.x === -1 && dir.y === 0) {
                snake.nextDirection = {x: 0, y: -1};
            } else if (dir.x === 0 && dir.y === -1) {
                snake.nextDirection = {x: 1, y: 0};
            } else if (dir.x === 0 && dir.y === 1) {
                snake.nextDirection = {x: -1, y: 0};
            }
        }
    }
}
