// Các hàm tiện ích

class GameUtils {
    static adjustBrightness(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
            (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
            .toString(16).slice(1);
    }
    
    static playSound(sounds, type) {
        try {
            const sound = sounds[type].cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => console.log('Không thể phát âm thanh:', e));
        } catch (e) {
            console.log('Lỗi âm thanh:', e);
        }
    }
}
