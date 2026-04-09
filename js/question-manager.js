// Quản lý logic câu hỏi

class QuestionManager {
    static async loadQuestions() {
        try {
            const response = await fetch('assets/cauhoi.json');
            const questions = await response.json();
            console.log('Đã load', questions.length, 'câu hỏi');
            return questions;
        } catch (e) {
            console.error('Không thể load câu hỏi:', e);
            return [];
        }
    }
    
    static showQuestion(questions, onAnswer) {
        if (questions.length === 0) {
            console.log('Chưa load câu hỏi');
            return null;
        }
        
        // Chọn câu hỏi ngẫu nhiên
        const question = questions[Math.floor(Math.random() * questions.length)];
        
        // Hiển thị modal
        const modal = document.getElementById('questionModal');
        document.getElementById('questionText').textContent = question.question;
        
        // Tạo các nút trả lời
        const answersDiv = document.getElementById('questionAnswers');
        answersDiv.innerHTML = '';
        
        ['A', 'B', 'C', 'D'].forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = `${option}. ${question[option]}`;
            btn.onclick = () => onAnswer(option, question.answer);
            answersDiv.appendChild(btn);
        });
        
        modal.classList.add('show');
        
        // Đếm ngược 20 giây
        let timeLeft = 20;
        document.getElementById('questionTimer').textContent = timeLeft;
        
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('questionTimer').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                onAnswer(null, question.answer);
            }
        }, 1000);
        
        return timer;
    }
    
    static hideQuestion() {
        const modal = document.getElementById('questionModal');
        modal.classList.remove('show');
    }
}
