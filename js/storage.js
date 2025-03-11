class Storage {
    constructor() {
        this.storage = window.localStorage;
    }

    getItem(key) {
        return this.storage.getItem(key);
    }

    setItem(key, value) {
        this.storage.setItem(key, value);
    }

    removeItem(key) {
        this.storage.removeItem(key);
    }

    saveGame(game) {
        this.setItem("gameLVL", game.gameLVL);
        this.setItem("currentLife", game.currentLife);
        this.setItem("helpCount", game.helpCount);
    }

    loadGame() {
        return this.storage;
    }

    getSoundStatus() {
        return this.storage.getItem('sound') ? this.storage.getItem('sound') : 'enable';
    }

    setSoundStatus(status) {
        this.storage.setItem('sound', status)
    }
}