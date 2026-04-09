// Quản lý âm thanh

class AudioManager {
    constructor() {
        this.sounds = {
            correct: new Audio('assets/freesound_community-eating-chips-81092.mp3'),
            wrong: new Audio('assets/freesounds123-bomb-333672.mp3')
        };
        
        this.sounds.correct.volume = 0.5;
        this.sounds.wrong.volume = 0.5;
    }
    
    play(type) {
        try {
            const sound = this.sounds[type].cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => console.log('Không thể phát âm thanh:', e));
        } catch (e) {
            console.log('Lỗi âm thanh:', e);
        }
    }
}
