class Sound {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);

        this.loadSound('click', 'audio/key_press.mp3');
        this.loadSound('ambient', 'audio/background2.mp3');
        this.loadSound('minusheart', 'audio/minusheart.mp3');
        this.loadSound('gameover', 'audio/gameover.mp3');
        this.ambient = null;
        this.muted = false;
    }

    loadSound(name, url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.sounds[name] = audioBuffer;
            })
            .catch(error => console.error(`Failed to load sound ${name} from ${url}:`, error));
    }

    playSound(name) {
        if (this.muted || !this.sounds[name]) return;
        const source = this.context.createBufferSource();
        source.buffer = this.sounds[name];
        source.connect(this.gainNode);
        source.start(0);
    }

    playAmbient() {
        if (this.muted || !this.sounds['ambient']) return;
        if (this.ambient) return;

        this.ambient = this.context.createBufferSource();
        this.ambient.buffer = this.sounds['ambient'];
        this.ambient.connect(this.gainNode);
        this.ambient.loop = true;
        this.ambient.start(0);
        this.fadeSound(0.01, 1);
    }

    stopAmbient() {
        if (!this.sounds['ambient']) return;
        if (!this.ambient) return;

        this.fadeSound(1, 0.01);
        setTimeout(() => {
            this.ambient.stop();
            this.ambient = null;
        }, 150);
    }

    unmuteAmbient() {
        this.fadeSound(0.01, 1);
    }

    muteAmbient() {
        this.fadeSound(1, 0.01);
        setTimeout(() => {
            this.gainNode.gain.value = 0
        }, 150);
    }

    fadeSound(start, end, duration = 0.1) {
        this.gainNode.gain.setValueAtTime(start, this.context.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(end, this.context.currentTime + duration);
    }

    toggleSound() {
        this.muted = !this.muted;
        this.muted ? this.stopAmbient() : this.playAmbient();
    }

    onFocus() {
        document.hidden && !this.muted ? this.muteAmbient() : this.unmuteAmbient();
    }
}