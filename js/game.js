class MajongGame {
    constructor() {
        // DOM элементы
        this.gameContainer = document.getElementById('gameContainer');
        this.gameBoard = document.getElementById('game-board');
        this.levelElement = document.getElementById('levelNum');
        this.progressBar = document.getElementById("myBar");
        this.hearts = document.getElementsByClassName("heartPic");
        this.heartsDiv = document.getElementById("hearts");
        this.heartsModal = document.getElementById("modalHearts");
        this.pauseBut = document.getElementById('but_pause');
        this.helpBut = document.getElementById('help');
        this.helpCountElement = document.getElementById('helpcount');
        this.changeColorBut = document.getElementById('changeColor');
        this.unpauseBut = document.getElementById('unpause');
        this.pauseDiv = document.getElementById('pause');
        this.blurDiv = document.getElementById("blur");
        this.startMenu = document.getElementById("startMenu");
        this.modalHead = document.getElementById('modalHead');
        this.butModal = document.getElementById('but_modal');
        this.but_start = document.getElementById('but_start');
        this.timeUpModal = document.getElementById('timeUpModal');
        this.soundBut = document.getElementById('sound');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.refreshBut = document.getElementById('refresh');

        // Настройки игры
        this.numCols = 16;
        this.numRows = 8;
        this.gameSize = this.numCols * this.numRows / 2;
        this.startdiff = 10;
        this.T1 = 6000;  // Время на первый уровень (сек)
        this.dT = 5;    // Уменьшение времени на уровень (сек)
        this.B_max = 5; // Максимальное бонусное время (сек)
        this.t_b = 400;   // Пороговое время для бонуса (сек)

        // Переменные игры
        this.finalTime = 0; // Время таймера (сек)
        this.pairTime = 0; // время для клика
        this.levelTime = 0; // Максимальное время на этот раунд (сек)
        this.currentLife = 3; // Количесто жизней
        this.gametimer = null;
        this.gameCondition = Conditions.standart;
        this.helpCount = 7;
        this.isColor = true;
        this.currentReshaffle = 0;
        this.maxReshaffle = 20;
        this.gameLVL = 1;

        this.tileValues = [];
        this.selectedTiles = [];
        this.matrix = [];

        this.sound = new Sound();
        this.storage = new Storage();

        this.init();
    }

    init() {
        this.levelElement.innerText = this.gameLVL;
        this.initEventListeners();
        this.initSound();
    }

    initSound() {
        if (this.storage.getSoundStatus() == 'disable') {
            this.toggleSound();
        }
    }

    initSavedData() {
        this.gameLVL = this.storage.getGameLVL();
        this.currentLife = this.storage.getCurrentLife();
        this.isColor = this.storage.getIsColor();
        this.helpCount = this.storage.getHelpCount();
    }

    initEventListeners() {
        this.butModal.addEventListener('click', () => {
            this.reStartGame();
            this.sound.playSound('click');
        });

        this.but_start.addEventListener('click', () => {
            this.reStartGame();
            this.sound.playSound('click');
            this.sound.playAmbient();
        });

        this.pauseBut.addEventListener('click', () => {
            this.pauseGame();
            this.sound.playSound('click');
        });

        this.changeColorBut.addEventListener('click', () => {
            this.changeColor();
            this.sound.playSound('click');
        });

        this.unpauseBut.addEventListener('click', () => {
            this.reStartGame();
            this.sound.playSound('click');
        });

        this.helpBut.addEventListener('click', () => {
            this.help();
            this.sound.playSound('click');
        });

        this.soundBut.addEventListener('click', () => {
            this.sound.playSound('click');
            this.toggleSound();
        });

        this.refreshBut.addEventListener('click', () => {
            this.reshafle();
            this.sound.playSound('click');
        });
    }

    createQueue() {
        let allTiles = [];
        for (let i = 1; i < 37; i++) {
            allTiles.push(i);
        }
        this.tileValues.length = 0;

        let currentdiff = Math.min(this.startdiff + Math.floor(this.gameLVL / 3) * 2, allTiles.length);

        while (this.tileValues.length !== this.gameSize) {
            for (let i = 0; i < currentdiff; i++) {
                if (this.tileValues.length == this.gameSize)
                    break;
                this.tileValues.push(allTiles[i]);
            }
        }
    }

    start_countdown() {
        this.gametimer = setInterval(() => {
            this.finalTime--;
            this.pairTime++;

            this.progressBar.style.width = (this.finalTime / this.levelTime * 100) + '%';

            if (this.finalTime <= 0) {
                this.currentLife--;
                if (this.currentLife == 0) {
                    this.gameCondition = Conditions.end;
                    updateHeart(this);
                    showModalDialoge(this);
                }
                else {
                    this.gameCondition = Conditions.lostheart;
                    updateHeart(this);
                    showModalDialoge(this);
                }

                clearInterval(this.gametimer);
            }
        }, 10);
    }

    calculateBonusTime(pairTime) {
        return pairTime <= this.t_b ? this.B_max * (1 - pairTime / this.t_b) * 100 : 0;
    }

    makeMatrix() {
        this.matrix = [];
        const values = [...this.tileValues, ...this.tileValues].sort(() => Math.random() - 0.5);

        for (let i = 0; i < this.numRows + 2; i++) {
            let row = [];

            for (let j = 0; j < this.numCols + 2; j++) {
                if (i === 0 || j === 0 || i === this.numRows + 1 || j === this.numCols + 1) {
                    row.push(999);
                } else {
                    row.push(values[(i - 1) * this.numCols + (j - 1)]);
                }
            }
            this.matrix.push(row);
        }
    }

    clearTable() {
        const table = document.getElementById('matrix-table');
        if (table) {
            table.remove();
        }
    }

    showTable() {
        const table = document.createElement('table');
        table.id = 'matrix-table';

        for (let i = 0; i < this.matrix.length; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < this.matrix[i].length; j++) {
                const number = this.matrix[i][j];
                const tile = document.createElement('td');

                tile.classList.add(`row${i}`);
                tile.classList.add(`col${j}`);
                tile.classList.add(`val${this.matrix[i][j]}`);

                if (number != 0 && number != 999) {
                    const image = document.createElement('img');
                    image.alt = "Плитка";

                    const color = this.isColor ? 'Color' : 'White';

                    image.src = `plates/${color}/${number}.svg`;
                    tile.append(image);
                    tile.addEventListener('click', () => this.selectTile(tile));
                }
                else {
                    tile.classList.add('matched');
                }

                if (number === 999) {
                    tile.classList.add('border-tile');
                }
                else {
                    tile.classList.add('tile');
                }
                row.appendChild(tile);
            }
            table.appendChild(row);
        }

        this.gameBoard.appendChild(table);
    }

    selectTile(tile) {
        if (tile.classList.contains('selected') || tile.classList.contains('matched')) return;

        tile.classList.add('selected');
        this.selectedTiles.push(tile);

        this.sound.playSound('click');

        if (this.selectedTiles.length === 2) {
            const [tile1, tile2] = this.selectedTiles;

            const isPath = this.checkMatch(tile1, tile2);
            if (isPath) {
                tile1.classList.add('matched');
                tile2.classList.add('matched');
                tile1.classList.remove('selected');
                tile2.classList.remove('selected');

                const tile1data = this.getTileData(tile1);
                const tile2data = this.getTileData(tile2);

                this.matrix[tile1data.row][tile1data.col] = 0;
                this.matrix[tile2data.row][tile2data.col] = 0;

                showPath(allPath);

                let bonusTime = this.calculateBonusTime(this.pairTime);
                this.finalTime = Math.min(this.levelTime, this.finalTime + bonusTime);
                this.pairTime = 0;
            }
            else {
                paintBackGround(tile1, tile2);
            }

            this.selectedTiles = [];
            this.checkgamecondition();
        }
    }

    getTileData(tile) {
        let row;
        let col;
        let value;

        for (let i = 0; i < tile.classList.length; i++) {
            const className = tile.classList[i];

            if (className.includes('col'))
                col = parseInt(className.replaceAll('col', ''), 10);
            if (className.includes('row'))
                row = parseInt(className.replaceAll('row', ''), 10);
            if (className.includes('val'))
                value = className.replaceAll('val', '');
        }

        return { row, col, value };
    }

    checkMatch(tile1, tile2) {
        const tile1data = this.getTileData(tile1);
        const tile2data = this.getTileData(tile2);

        if (tile1data.value === tile2data.value) {
            return isPath(this.matrix, tile1data, tile2data);
        }
        return false;
    }

    checkgamecondition() {
        let winCondition = true;

        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j] !== 0 && this.matrix[i][j] !== 999) {
                    winCondition = false;
                    break;
                }
            }
            if (!winCondition) break;
        }

        if (winCondition) {
            this.gameCondition = Conditions.win;
            showModalDialoge(this);
            clearInterval(this.gametimer);
        }
        else {
            if (!this.isAvailableTile()) {
                this.currentReshaffle = 0;
                this.reshafle(true);
            }
        }
    }

    pauseGame() {
        clearInterval(this.gametimer);
        this.gameCondition = Conditions.pause;
        showModalDialoge(this);
    }

    reStartGame() {

        const save = this.storage.loadGame();

        if (save) {
            this.gameLVL = save.gameLVL;
            this.currentLife = save.currentLife;
            this.helpCount = save.helpCount;
        } 

        if (this.gameCondition != Conditions.pause) {
            this.levelTime = this.T1 - (this.gameLVL - 1) * 100 * this.dT;
            this.finalTime = this.levelTime;
            this.pairTime = 0;
        }

        if (this.gameCondition == Conditions.win) {
            this.gameLVL++;
        }

        if (this.gameCondition == Conditions.end) {
            this.currentLife = 3;
            this.gameLVL = 1;
            this.helpCount = 7;
        }

        if (this.gameCondition != Conditions.lostheart && this.gameCondition != Conditions.pause) {
            this.clearTable();
            this.createQueue();
            this.makeMatrix();
            this.showTable();
            this.reshafle(true);
        }

        updateInterface(this);

        this.gameCondition = Conditions.standart;
        this.storage.saveGame(this);
        this.start_countdown();
    }

    help() {
        if (this.helpCount == 0)
            return;

        const table = document.getElementById('matrix-table');
        const rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < cells.length; j++) {
                const currentTile = cells[j];

                if (currentTile.classList.contains('matched')) continue;

                for (let m = 0; m < rows.length; m++) {
                    const searchCells = rows[m].getElementsByTagName('td');
                    for (let n = 0; n < searchCells.length; n++) {
                        if (i === m && j === n) continue;
                        const targetTile = searchCells[n];
                        if (targetTile.classList.contains('matched')) continue;

                        const isPath = this.checkMatch(currentTile, targetTile);
                        if (isPath) {
                            this.helpCount--;
                            availableTile(currentTile, targetTile);
                            updateInterface(this);
                            return;
                        }
                    }
                }
            }
        }
        this.storage.saveGame(this);
    }

    isAvailableTile() {
        const table = document.getElementById('matrix-table');
        const rows = table.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            for (let j = 0; j < cells.length; j++) {
                const currentTile = cells[j];

                if (currentTile.classList.contains('matched')) continue;

                for (let m = 0; m < rows.length; m++) {
                    const searchCells = rows[m].getElementsByTagName('td');
                    for (let n = 0; n < searchCells.length; n++) {
                        if (i === m && j === n) continue;
                        const targetTile = searchCells[n];
                        if (targetTile.classList.contains('matched')) continue;

                        const isPath = this.checkMatch(currentTile, targetTile);
                        if (isPath) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    reshafle(freeShuffle = false) {
        if (this.gameCondition === Conditions.pause || this.gameCondition === Conditions.end) {
            return;
        }
        if (this.currentLife === 0) {
            return;
        }

        this.gameBoard.classList.add('reshuffle');

        setTimeout(() => {
            this.gameBoard.classList.remove('reshuffle');
        }, 1000);

        if (!freeShuffle) {
            this.currentLife--;
        }

        this.clearTable();

        const matrixNumRow = this.matrix.length;
        const matrixNumCol = this.matrix[0].length;

        for (let i = 1; i < matrixNumRow - 1; i++) {
            for (let j = 1; j < matrixNumCol - 1; j++) {
                const newI = Math.min(1 + Math.floor(Math.random() * matrixNumRow), matrixNumRow - 2);
                const newJ = Math.min(1 + Math.floor(Math.random() * matrixNumCol), matrixNumCol - 2);

                // Меняем местами элементы
                const temp = this.matrix[i][j];
                this.matrix[i][j] = this.matrix[newI][newJ];
                this.matrix[newI][newJ] = temp;
            }
        }

        updateHeart(this);
        this.showTable();

        if (!this.isAvailableTile() && this.currentReshaffle < this.maxReshaffle) {
            this.currentReshaffle++;
            this.reshafle(true);
        }

        this.storage.saveGame(this);
    }

    changeColor() {
        this.isColor = !this.isColor;
        this.clearTable();
        this.showTable();
    }

    toggleSound() {
        this.sound.toggleSound();
        this.storage.setSoundStatus(this.sound.muted ? 'disable' : 'enable');
        this.soundBut.src = this.sound.muted ? "static/soundoff.png" : "static/soundon.png";
    }
}
