class Storage {
    constructor() {
        this.storage = window.localStorage;
        try {
            if ('yandexData' in window) {
                const yandexData = JSON.parse(window.yandexData);
                if (yandexData) {
                    try {
                    this.setItem("gameLVL", yandexData.gameLVL ? parseInt(yandexData.gameLVL) : this.getItem("gameLVL"));
                    this.setItem("currentLife", yandexData.currentLife ? parseInt(yandexData.currentLife) : this.getItem("currentLife"));
                    this.setItem("helpCount", yandexData.helpCount ? parseInt(yandexData.helpCount) : this.getItem("helpCount"));
                    this.setItem("sound", yandexData.sound ? parseInt(yandexData.sound) : this.getItem("sound"));
                } catch (error) {
                    console.error('Ошибка при загрузке данных из Яндекса:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных из Яндекса:', error);
        }
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
        this.setItem("sound", game.sound.muted ? 0 : 1);
        this.setItem("isColor", game.isColor);
        try {
            if ('ysdk' in window) {
                this.saveYandex(game);
            }
        } catch (error) {
            console.error('Ошибка при сохранении данных в Яндекс:', error);
        }
    }

    clearAll() {
        this.storage.clear();
        if ('ysdk' in window && 'player' in window) {
            window.player.setStats({});
        }
    }

    checkValue(value) {
        return value !== null && value !== undefined && value !== 'undefined' && value !== 'null' && value !== '' && value !== ' ' && value !== 'NaN';
    }

    loadGame() {
        try {
            let gameLVL = this.checkValue(this.storage.getItem('gameLVL')) ? parseInt(this.storage.getItem('gameLVL')) : 1;
            let currentLife = this.checkValue(this.storage.getItem('currentLife')) ? parseInt(this.storage.getItem('currentLife')) : 3;
            let helpCount = this.checkValue(this.storage.getItem('helpCount')) ? parseInt(this.storage.getItem('helpCount')) : 4;
            let sound = this.checkValue(this.storage.getItem('sound')) ? parseInt(this.storage.getItem('sound')) : 1;
            let isColor = this.storage.getItem('isColor');
            
            const gamedata = {
                gameLVL: gameLVL,
                currentLife: currentLife,
                helpCount: helpCount,
                sound: sound,
                isColor: isColor
            }
            return gamedata;
        } catch (error) {
            console.error('Ошибка при загрузке данных из localStorage:', error);
            return null;
        }
    }

    getSoundStatus() {
        return this.storage.getItem('sound') ? this.storage.getItem('sound') : 1;
    }

    setSoundStatus(status) {
        this.storage.setItem('sound', status)
    }

    saveYandex(game) {
        console.log(`Данные загружаемые в Яндекс`);
        console.log(window.yandexData);

        console.log({
            gameLVL: parseInt(game.gameLVL),
            currentLife: parseInt(game.currentLife),
            helpCount: parseInt(game.helpCount),
            sound: game.sound.muted ? 0 : 1
        });
        window.player.setStats(
            {
                gameLVL: parseInt(game.gameLVL),
                currentLife: parseInt(game.currentLife),
                helpCount: parseInt(game.helpCount),
                sound: game.sound.muted ? 0 : 1
            }
        );
    }
}