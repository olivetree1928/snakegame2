document.addEventListener('DOMContentLoaded', () => {
    // 多语言支持
    const translations = {
        'zh': {
            'title': '贪吃蛇游戏',
            'score-label': '分数: ',
            'start-btn': '开始游戏',
            'pause-btn': '暂停',
            'continue-btn': '继续',
            'restart-btn': '重新开始',
            'game-over': '游戏结束!',
            'final-score-label': '你的最终分数: ',
            'play-again-btn': '再玩一次',
            'lang-toggle': 'EN'
        },
        'en': {
            'title': 'Snake Game',
            'score-label': 'Score: ',
            'start-btn': 'Start Game',
            'pause-btn': 'Pause',
            'continue-btn': 'Continue',
            'restart-btn': 'Restart',
            'game-over': 'Game Over!',
            'final-score-label': 'Your Final Score: ',
            'play-again-btn': 'Play Again',
            'lang-toggle': '中文'
        }
    };

    let currentLang = 'zh';

    // 获取DOM元素
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverElement = document.getElementById('game-over');
    const playAgainBtn = document.getElementById('play-again-btn');
    const langToggleBtn = document.getElementById('lang-toggle');

    // 游戏配置
    const gridSize = 20; // 网格大小
    const tileCount = canvas.width / gridSize; // 网格数量
    let speed = 7; // 游戏速度

    // 游戏状态
    let gameRunning = false;
    let gamePaused = false;
    let gameOver = false;
    let score = 0;

    // 蛇的初始位置和速度
    let snake = [
        { x: 5, y: 5 }
    ];
    let velocityX = 0;
    let velocityY = 0;

    // 食物位置
    let foodX;
    let foodY;

    // 上一次按键方向
    let lastDirection = '';

    // 游戏循环
    let gameInterval;

    // 初始化游戏
    function initGame() {
        // 重置游戏状态
        gameRunning = false;
        gamePaused = false;
        gameOver = false;
        score = 0;
        scoreElement.textContent = score;

        // 重置蛇
        snake = [{ x: 5, y: 5 }];
        velocityX = 0;
        velocityY = 0;
        lastDirection = '';

        // 生成第一个食物
        generateFood();

        // 更新按钮状态
        updateButtonStates();

        // 隐藏游戏结束界面
        gameOverElement.classList.add('hidden');

        // 绘制初始状态
        drawGame();
    }

    // 开始游戏
    function startGame() {
        if (!gameRunning && !gameOver) {
            gameRunning = true;
            gamePaused = false;
            updateButtonStates();
            gameInterval = setInterval(drawGame, 1000 / speed);
        }
    }

    // 语言切换功能
    function updateLanguage() {
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[currentLang][key]) {
                if (element.tagName === 'TITLE') {
                    element.textContent = translations[currentLang][key];
                } else if (element.querySelector('span')) {
                    element.querySelector('span').textContent = translations[currentLang][key];
                } else {
                    element.textContent = translations[currentLang][key];
                }
            }
        });
        
        // 更新HTML语言属性
        document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    }

    // 切换语言
    function toggleLanguage() {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        updateLanguage();
        
        // 如果游戏正在暂停，更新暂停按钮文本
        if (gamePaused) {
            const pauseBtnSpan = pauseBtn.querySelector('span');
            pauseBtnSpan.textContent = translations[currentLang]['continue-btn'];
        }
    }

    // 暂停游戏
    function pauseGame() {
        if (gameRunning) {
            if (gamePaused) {
                gamePaused = false;
                const pauseBtnSpan = pauseBtn.querySelector('span');
                pauseBtnSpan.textContent = translations[currentLang]['pause-btn'];
                gameInterval = setInterval(drawGame, 1000 / speed);
            } else {
                gamePaused = true;
                const pauseBtnSpan = pauseBtn.querySelector('span');
                pauseBtnSpan.textContent = translations[currentLang]['continue-btn'];
                clearInterval(gameInterval);
            }
            updateButtonStates();
        }
    }

    // 重新开始游戏
    function restartGame() {
        clearInterval(gameInterval);
        initGame();
    }

    // 更新按钮状态
    function updateButtonStates() {
        startBtn.disabled = gameRunning || gameOver;
        pauseBtn.disabled = !gameRunning || gameOver;
        restartBtn.disabled = gameOver;
    }

    // 生成食物
    function generateFood() {
        // 随机生成食物位置
        function getRandomPosition() {
            return Math.floor(Math.random() * tileCount);
        }

        // 确保食物不会生成在蛇身上
        let newFoodX, newFoodY;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFoodX = getRandomPosition();
            newFoodY = getRandomPosition();
            
            // 检查是否与蛇身重叠
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFoodX && snake[i].y === newFoodY) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        foodX = newFoodX;
        foodY = newFoodY;
    }

    // 游戏主循环
    function drawGame() {
        if (gameOver) return;

        // 移动蛇
        moveSnake();

        // 检查游戏是否结束
        if (checkGameOver()) {
            endGame();
            return;
        }

        // 清空画布
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制食物
        ctx.fillStyle = 'red';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);

        // 绘制蛇
        ctx.fillStyle = 'green';
        for (let i = 0; i < snake.length; i++) {
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
            
            // 绘制蛇身边框
            ctx.strokeStyle = 'darkgreen';
            ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        }

        // 绘制蛇头
        if (snake.length > 0) {
            ctx.fillStyle = '#006400'; // 深绿色蛇头
            ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);
        }

        // 检查是否吃到食物
        checkFoodCollision();
    }

    // 移动蛇
    function moveSnake() {
        // 如果蛇没有移动方向，则不移动
        if (velocityX === 0 && velocityY === 0) return;

        // 创建新的蛇头
        const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
        
        // 将新蛇头添加到蛇身前面
        snake.unshift(head);
        
        // 如果没有吃到食物，则移除蛇尾
        if (!(head.x === foodX && head.y === foodY)) {
            snake.pop();
        }
    }

    // 检查是否吃到食物
    function checkFoodCollision() {
        if (snake[0].x === foodX && snake[0].y === foodY) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 生成新的食物
            generateFood();
            
            // 每增加50分，速度增加
            if (score % 50 === 0) {
                speed += 1;
                clearInterval(gameInterval);
                gameInterval = setInterval(drawGame, 1000 / speed);
            }
        }
    }

    // 检查游戏是否结束
    function checkGameOver() {
        // 检查是否撞墙
        if (
            snake[0].x < 0 ||
            snake[0].x >= tileCount ||
            snake[0].y < 0 ||
            snake[0].y >= tileCount
        ) {
            return true;
        }

        // 检查是否撞到自己的身体
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
                return true;
            }
        }

        return false;
    }

    // 游戏结束
    function endGame() {
        gameRunning = false;
        gameOver = true;
        clearInterval(gameInterval);
        
        // 显示游戏结束界面
        finalScoreElement.textContent = score;
        gameOverElement.classList.remove('hidden');
        
        // 更新按钮状态
        updateButtonStates();
    }

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!gameRunning || gamePaused) return;

        // 根据按键改变蛇的移动方向
        switch (e.key) {
            case 'ArrowUp':
                if (lastDirection !== 'down') {
                    velocityX = 0;
                    velocityY = -1;
                    lastDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (lastDirection !== 'up') {
                    velocityX = 0;
                    velocityY = 1;
                    lastDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (lastDirection !== 'right') {
                    velocityX = -1;
                    velocityY = 0;
                    lastDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (lastDirection !== 'left') {
                    velocityX = 1;
                    velocityY = 0;
                    lastDirection = 'right';
                }
                break;
        }
    });

    // 添加触摸滑动控制（适配移动设备）
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);

    canvas.addEventListener('touchmove', (e) => {
        if (!gameRunning || gamePaused) return;
        e.preventDefault();
        
        if (!touchStartX || !touchStartY) return;

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // 判断滑动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0 && lastDirection !== 'left') {
                // 向右滑动
                velocityX = 1;
                velocityY = 0;
                lastDirection = 'right';
            } else if (dx < 0 && lastDirection !== 'right') {
                // 向左滑动
                velocityX = -1;
                velocityY = 0;
                lastDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (dy > 0 && lastDirection !== 'up') {
                // 向下滑动
                velocityX = 0;
                velocityY = 1;
                lastDirection = 'down';
            } else if (dy < 0 && lastDirection !== 'down') {
                // 向上滑动
                velocityX = 0;
                velocityY = -1;
                lastDirection = 'up';
            }
        }
        
        // 重置触摸起始点
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }, false);

    // 按钮事件监听
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', restartGame);
    langToggleBtn.addEventListener('click', toggleLanguage);

    // 初始化语言和游戏
    updateLanguage();
    initGame();
});