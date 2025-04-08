class MajongGame {
    constructor(ysdk) {
        this.ysdk = ysdk;
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
        this.advIco = document.getElementById('advIco');
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
        this.progressCircle = document.getElementById('progressCircle');
        // this.progressNum = document.getElementById('progressNum');

        // Настройки игры
        this.numCols = 16;
        this.numRows = 8;
        this.gameSize = this.numCols * this.numRows / 2;
        this.startdiff = 20;
        this.T1 = 6000;  // Время на первый уровень (сек)
        this.dT = 1;    // Уменьшение времени на уровень (сек)
        this.B_max = 5; // Максимальное бонусное время (сек)
        this.t_b = 400;   // Пороговое время для бонуса (сек)

        // Переменные игры
        this.finalTime = 0; // Время таймера (сек)
        this.pairTime = 0; // время для клика
        this.levelTime = 0; // Максимальное время на этот раунд (сек)
        this.currentLife = 3; // Количесто жизней
        this.gametimer = null;
        this.gameCondition = Conditions.standart;
        this.helpCount = 4;
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
        if (this.storage.getSoundStatus() == 0) {
            this.toggleSound();
        }
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
            if (this.gameCondition != Conditions.pause) {
                this.pauseGame();
                this.sound.playSound('click');
            }
            else {
                this.reStartGame();
                this.sound.playSound('click');
            }
        });

        this.changeColorBut.addEventListener('click', () => {
            changeColor(this);
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
            this.handleRefresh();
            this.sound.playSound('click');
        });

        if (this.ysdk) {
            this.ysdk.on('game_api_pause', pauseCallback.bind(null, this));
            this.ysdk.on('game_api_resume', resumeCallback.bind(null, this));
        }

        // window.addEventListener("visibilitychange", () => this.sound.onFocus());
    }

    createQueue() {
        let allTiles = [];
        for (let i = 1; i < 37; i++) {
            allTiles.push(i);
        }
        this.tileValues.length = 0;
        console.log('Заполняем массив');
        try {
            let currentdiff = Math.min(this.startdiff + Math.floor(this.gameLVL / 3) * 2, allTiles.length);
            const tileValuesPull = [];

            let tileIndex = this.gameLVL <= 10 ? 4 - Math.floor(this.gameLVL / 3) : 1;

            console.log('tileIndex', tileIndex);
            while (tileValuesPull.length < currentdiff) {
                for (let i = 0; i < allTiles.length; i += tileIndex) {
                    if (tileValuesPull.length > currentdiff)
                        break;
                    tileValuesPull.push(allTiles[i]);
                    console.log(i);
                }
            }
            console.log('tileValuesPull', tileValuesPull);
            while (this.tileValues.length !== this.gameSize) {
                for (let i = 0; i < tileValuesPull.length; i++) {
                    if (this.tileValues.length == this.gameSize)
                        break;
                    this.tileValues.push(tileValuesPull[i]);
                }
            }
            console.log('tileValues', this.tileValues);
        }
        catch (error) {
            console.log(error);
        }
    }

    start_countdown() {
        console.log('start_countdown');
        if (this.gametimer) {
            clearInterval(this.gametimer);
        }
        this.gametimer = setInterval(() => {
            this.finalTime--;
            this.pairTime++;

            let progressValue = (this.finalTime / this.levelTime * 100);
            document.documentElement.style.setProperty('--progress', progressValue);

            // this.progressBar.style.width = (this.finalTime / this.levelTime * 100) + '%';
            // this.progressCircle.setAttribute('stroke-dashoffset', (this.finalTime / this.levelTime * 100));

            if (this.finalTime <= 0) {
                console.log('finalTime <= 0');
                if (this.currentLife <= 0) {
                    console.log('currentLife <= 0');
                    if ('ysdk' in window) {
                        console.log('ysdk in window');
                        this.gameCondition = Conditions.showAdv;
                    }
                    else {
                        console.log('ysdk not in window');
                        this.gameCondition = Conditions.end;
                    }
                }
                else {
                    this.gameCondition = Conditions.lostheart;

                }
                showModalDialoge(this);
            }
        }, 10);
    }

    calculateBonusTime(pairTime) {
        return pairTime <= this.t_b ? this.B_max * (1 - pairTime / this.t_b) * 100 : 0;
    }

    makeMatrix(values) {

        this.matrix = this.distributeElementsInMatrix(values);
        console.log('matrix', this.matrix);
        this.addMatrixBorder();

    }

    selectTile(tile) {
        if (tile.classList.contains('selected') || tile.classList.contains('matched')) return;

        tile.classList.add('selected');
        this.selectedTiles.push(tile);

        this.sound.playSound('click');

        if (this.selectedTiles.length === 2) {
            const [tile1, tile2] = this.selectedTiles;
            const tile1data = this.getTileData(tile1);
            const tile2data = this.getTileData(tile2);
            if (tile1data.value != tile2data.value) {
                tile1.classList.remove('selected');
                this.selectedTiles = [tile2];
            }
            else {
                const isPath = this.checkMatch(tile1, tile2);
                if (isPath) {
                    tile1.classList.add('matched');
                    tile2.classList.add('matched');
                    tile1.classList.remove('selected');
                    tile2.classList.remove('selected');

                    this.matrix[tile1data.row][tile1data.col] = 0;
                    this.matrix[tile2data.row][tile2data.col] = 0;
                    
                    showPath(allPath);

                    this.moveMatrix({x: 1, y: 0});
                    updateTable(this);
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
            if (this.gameLVL % 3 == 0) {
                showFullscreenAdv(() => {
                    showModalDialoge(this);
                });
            }
            else {
                showModalDialoge(this);
            }
        }
        else {
            if (!this.isAvailableTile()) {
                this.currentReshaffle = 0;
                this.reshafle(true);
            }
        }
    }

    pauseGame() {
        this.gameCondition = Conditions.pause;
        this.sound.muteAmbient();
        showModalDialoge(this);
    }

    unpauseGame() {
        this.gameCondition = Conditions.standart;
        this.sound.unmuteAmbient();
        hideModalDialoge(this);
    }

    reStartGame() {
        const save = this.storage.loadGame();
        console.log('gamecondition', this.gameCondition);
        console.log("Данные сохранения");
        console.log(save);
        try {
            if (save && save.gameLVL) {
                this.gameLVL = save.gameLVL;
                this.currentLife = save.currentLife;
                this.helpCount = save.helpCount;
                if (save.isColor !== undefined) {
                    this.isColor = save.isColor;
                }
            }
        } catch (error) {
            console.log("Ошибка при загрузке данных");
            console.log(error);
        }

        console.log(this.gameCondition);
        if (this.gameCondition == Conditions.showAdv) {
            showFullscreenAdv(() => {
                this.reStartGame();
            });
            this.gameCondition = Conditions.end;
            return;
        }

        if (this.gameCondition != Conditions.pause && this.gameCondition != Conditions.reshuffle) {
            this.levelTime = this.T1 - (this.gameLVL - 1) * Math.min(2000, 100 * this.dT);
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

        if (this.gameCondition != Conditions.lostheart &&
            this.gameCondition != Conditions.pause) {

            let values;
            if (this.gameCondition != Conditions.reshuffle) {
                this.createQueue();
                values = [...this.tileValues, ...this.tileValues];
            }
            else {
                values = this.getMatrixValues();
            }
            this.makeMatrix(values);
            this.reshafle(true);
            updateTable(this);

        }
        updateInterface(this);

        this.gameCondition = Conditions.standart;
        console.log('Сохранение данных');
        this.storage.saveGame(this);
        this.start_countdown();
        this.sound.unmuteAmbient();
        yandexStart();
    }

    help() {
        if (this.helpCount == 0) {

            clearInterval(this.gametimer);
            yandexStop();
            showRewardedVideo((rewarded) => {
                if (rewarded) {
                    console.log(this);
                    this.helpCount += 1;
                    this.finalTime += 100;
                    updateInterface(this);
                    this.storage.saveGame(this);
                }
                yandexStart();
                this.start_countdown();
            });
            return;
        }

        const table = document.getElementById('matrix-table');
        if (!table) {
            console.log('table not found');
            return;
        }
        const rows = table.getElementsByTagName('tr');

        // Создаем массив индексов для строк
        const rowIndices = Array.from({ length: rows.length }, (_, i) => i);
        // Перемешиваем индексы строк
        rowIndices.sort(() => Math.random() - 0.5);

        for (const i of rowIndices) {
            const cells = rows[i].getElementsByTagName('td');
            // Создаем массив индексов для ячеек
            const cellIndices = Array.from({ length: cells.length }, (_, j) => j);
            // Перемешиваем индексы ячеек
            cellIndices.sort(() => Math.random() - 0.5);

            for (const j of cellIndices) {
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
                            this.storage.saveGame(this);
                            showPath(allPath, 1, 2000);
                            updateInterface(this);

                            return;
                        }
                    }
                }
            }
        }
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
        if (this.currentLife <= 0 && !freeShuffle) {
            return;
        }

        this.gameBoard.classList.add('reshuffle');

        setTimeout(() => {
            this.gameBoard.classList.remove('reshuffle');
        }, 1000);

        const matrixValues = this.getMatrixValues();
        this.removeMatrixBorder();
        this.makeMatrix(matrixValues);

        updateHeart(this);
        updateTable(this);

        if (!this.isAvailableTile() && this.currentReshaffle < this.maxReshaffle) {
            this.currentReshaffle++;
            this.reshafle(true);
        }
    }

    toggleSound() {
        this.sound.toggleSound();
        this.storage.setSoundStatus(this.sound.muted ? 0 : 1);
        this.soundBut.src = this.sound.muted ? "static/soundoff.png" : "static/soundon.png";
    }

    distributeElementsInMatrix(array) {

        array = [...array].sort(() => Math.random() - 0.5);

        const rows = this.numRows;
        const cols = this.numCols;
        const matrix = Array(rows).fill().map(() => Array(cols).fill(0));

        const canPlaceValue = (row, col, value) => {
            // Проверяем соседей сверху, снизу, слева и справа
            const neighbors = [
                { r: row - 1, c: col },   // сверху
                { r: row + 1, c: col },   // снизу
                { r: row, c: col - 1 },   // слева
                { r: row, c: col + 1 }    // справа
            ];

            for (const { r, c } of neighbors) {
                if (r >= 0 && r < rows && c >= 0 && c < cols && matrix[r][c] === value) {
                    return false;
                }
            }
            return true;
        };

        for (const value of array) {
            let placed = false;

            // Создаем список всех свободных позиций
            const availablePositions = [];
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (matrix[row][col] === 0 && canPlaceValue(row, col, value)) {
                        availablePositions.push({ row, col });
                    }
                }
            }

            // Если есть доступные позиции, выбираем случайную
            if (availablePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * availablePositions.length);
                const { row, col } = availablePositions[randomIndex];
                matrix[row][col] = value;
                placed = true;
            }

            // Если не удалось разместить элемент, пробуем найти любую свободную позицию
            if (!placed) {
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (matrix[row][col] === 0) {
                            matrix[row][col] = value;
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            }

            // Если все позиции заняты, выходим из цикла
            if (!placed) break;
        }

        return matrix;
    }

    getMatrixValues() {
        const values = [];

        for (let i = 1; i < this.matrix.length - 1; i++) {
            for (let j = 1; j < this.matrix[i].length - 1; j++) {
                if (this.matrix[i][j] !== 0 && this.matrix[i][j] !== 999) {
                    values.push(this.matrix[i][j]);
                }
            }
        }

        return values;
    }

    removeMatrixBorder() {
        this.matrix = this.matrix.slice(1, -1).map(row => row.slice(1, -1));
    }

    addMatrixBorder() {
        this.matrix = this.matrix.map(row => [999, ...row, 999]);
        this.matrix.unshift(Array(this.numCols + 2).fill(999));
        this.matrix.push(Array(this.numCols + 2).fill(999));
    }

    handleRefresh() {
        if (this.currentLife > 0) {
            this.currentLife--;
            this.storage.saveGame(this);
            this.gameCondition = Conditions.reshuffle;
            showModalDialoge(this);
        }
    }

    moveMatrix(direction) {
        if (!this.matrix) return;

        const {x, y} = direction;
        
        // Определяем направление обхода матрицы
        let rowStart, rowEnd, rowStep;
        let colStart, colEnd, colStep;
        
        if (x > 0) {
            // Движение вниз - начинаем с нижних строк
            rowStart = this.matrix.length - 2; // Не трогаем границу
            rowEnd = 0;
            rowStep = -1;
        } else if (x < 0) {
            // Движение вверх - начинаем с верхних строк
            rowStart = 1; // Не трогаем границу
            rowEnd = this.matrix.length - 1;
            rowStep = 1;
        } else {
            // Нет движения по вертикали
            rowStart = 1;
            rowEnd = this.matrix.length - 1;
            rowStep = 1;
        }
        
        if (y > 0) {
            // Движение вправо - начинаем с правых столбцов
            colStart = this.matrix[0].length - 2; // Не трогаем границу
            colEnd = 0;
            colStep = -1;
        } else if (y < 0) {
            // Движение влево - начинаем с левых столбцов
            colStart = 1; // Не трогаем границу
            colEnd = this.matrix[0].length - 1;
            colStep = 1;
        } else {
            // Нет движения по горизонтали
            colStart = 1;
            colEnd = this.matrix[0].length - 1;
            colStep = 1;
        }
        
        // Смещаем плитки в заданном направлении
        for (let i = rowStart; rowStep > 0 ? i <= rowEnd : i >= rowEnd; i += rowStep) {
            for (let j = colStart; colStep > 0 ? j <= colEnd : j >= colEnd; j += colStep) {
                // Пропускаем пустые ячейки и границы
                if (this.matrix[i][j] === 0 || this.matrix[i][j] === 999) continue;
                
                let currentRow = i;
                let currentCol = j;
                
                // Смещаем плитку до упора в заданном направлении
                while (true) {
                    const nextRow = currentRow + x;
                    const nextCol = currentCol + y;
                    
                    // Проверяем, что следующая ячейка в пределах матрицы и пуста
                    if (nextRow >= 0 && nextRow < this.matrix.length && 
                        nextCol >= 0 && nextCol < this.matrix[0].length && 
                        this.matrix[nextRow][nextCol] === 0) {
                        
                        // Перемещаем плитку
                        this.matrix[nextRow][nextCol] = this.matrix[currentRow][currentCol];
                        this.matrix[currentRow][currentCol] = 0;
                        
                        // Обновляем текущую позицию
                        currentRow = nextRow;
                        currentCol = nextCol;
                    } else {
                        // Не можем двигаться дальше
                        break;
                    }
                }
            }
        }
    }
}
