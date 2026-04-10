// Cấu hình game
const CONFIG = {
    GRID_SIZE_X: 50,
    GRID_SIZE_Y: 25,
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
        aiQuestionCorrectRate: 0.6, // 60% trả lời đúng câu hỏi
        gameDuration: 60,
        correctFoodInterval: 2000,
        wrongFoodInterval: 4000
    },
    medium: {
        name: "Trung bình",
        aiName: "🐍 Rắn AI Chuyên Nghiệp",
        gameSpeed: 140,
        aiErrorRate: 0.20,
        aiQuestionCorrectRate: 0.8, // 80% trả lời đúng câu hỏi
        gameDuration: 60,
        correctFoodInterval: 2000,
        wrongFoodInterval: 4000
    },
    hard: {
        name: "Khó",
        aiName: "🐍 Rắn AI Huyền Thoại",
        gameSpeed: 100,
        aiErrorRate: 0.05,
        aiQuestionCorrectRate: 1.0, // 100% trả lời đúng câu hỏi
        gameDuration: 60,
        correctFoodInterval: 1500,
        wrongFoodInterval: 1500
    }
};
