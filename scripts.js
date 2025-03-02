const gameContainer = document.getElementById('gameContainer');
const gameBoard = document.getElementById('game-board');
const levelElement = document.getElementById('levelNum');
const progressBar = document.getElementById("myBar");
const hearts = document.getElementsByClassName("heartPic");
const heartsDiv = document.getElementById("hearts");
const heartsModal = document.getElementById("modalHearts");
const pauseBut = document.getElementById('but_pause');
const helpBut = document.getElementById('help');
const helpCountElement = document.getElementById('helpcount');

const unpauseBut = document.getElementById('unpause');
const pauseDiv = document.getElementById('pause');

const blurDiv = document.getElementById("blur");
const startMenu = document.getElementById("startMenu");

const modalHead = document.getElementById('modalHead');
const butModal = document.getElementById('but_modal');
const but_start = document.getElementById('but_start');
const timeUpModal = document.getElementById('timeUpModal');

const soundBut = document.getElementById('sound');
const backgroundMusic = document.getElementById('backgroundMusic');
const refreshBut = document.getElementById('refresh');

butModal.addEventListener('click', () => reStartGame())
but_start.addEventListener('click', () => {
    reStartGame();
    // document.getElementById('backgroundMusic').play();
})
pauseBut.addEventListener('click', () => pauseGame())
unpauseBut.addEventListener('click', () => reStartGame())
helpBut.addEventListener('click', () => help())
soundBut.addEventListener('click', () => toggleSound())
refreshBut.addEventListener('click', () => reshafle())

// Добавляем функцию закрытия модального окна
function closeTimeUpModal() {
    document.getElementById('timeUpModal').style.display = 'none';
}

// game settings
const numCols = 16;
const numRows = 8;
const gameSize = numCols * numRows / 2;
const startdiff = 7;
const T1 = 6000;  // Время на первый уровень (сек)
const dT = 5;    // Уменьшение времени на уровень (сек)
const B_max = 5; // Максимальное бонусное время (сек)
const t_b = 400;   // Пороговое время для бонуса (сек)
const levels = 15; // Количество уровней
const Conditions = { standart: 'standart', win: 'win', lostheart: 'lostheart', end: 'end', pause: 'pause' };


// game var
let finalTime; // Время таймера (сек)
let pairTime; // время для клика
let levelTime; // Максимальное время на этот раунд (сек)
let currentLife = 3; // Количесто жизней
let gametimer;
let gameCondition = Conditions.standart;;
let helpCount = 500;
let currentReshaffle = 0;
const maxReshaffle = 20;


let gameLVL = 1;
levelElement.innerText = gameLVL;

const tileValues = ['30', '31', '32', '33', '34', '36', '37', '38', '39', '51'];
let selectedTiles = [];
let matrix = [];

function createQueue() {
    const allTiles = [
        '30', '31', '32', '33', '34', '36', '37',
        '38', '39', '41', '42', '43', '51', '52',
        '53', '54', '55', '56', '57', '58', '59',
        '60', '61', '62', '63', '64', '65', '66',
        '67', '68', '70', '71', '72', '74'
    ];

    tileValues.length = 0;

    let currentdiff = startdiff + gameLVL;

    while (tileValues.length !== gameSize) {
        for (let i = 0; i < currentdiff; i++) {
            if (tileValues.length == gameSize)
                break;
            tileValues.push(allTiles[i]);
        }
    }
}

function start_countdown() {

    gametimer = setInterval(function () {
        finalTime--;
        pairTime++;

        progressBar.style.width = (finalTime / levelTime * 100) + '%';

        if (finalTime <= 0) {
            currentLife--;
            if (currentLife == 0) {
                gameCondition = Conditions.end;
                updateHeart();
                showModalDialoge();
            }
            else {
                gameCondition = Conditions.lostheart;
                updateHeart();
                showModalDialoge();
            }

            clearInterval(gametimer);
        }

    }, 10);
}

function calculateBonusTime(pairTime) {
    return pairTime <= t_b ? B_max * (1 - pairTime / t_b) * 100 : 0;
}

function createTiles() {
    matrix = [];
    const values = [...tileValues, ...tileValues].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numRows; i++) {
        let row = [];
        for (let j = 0; j < numCols; j++) {
            row.push(values[i * numCols + j]);
        }
        matrix.push(row);
    }
}

function createTable() {
    const table = document.createElement('table');
    table.id = 'matrix-table';

    for (let i = 0; i < matrix.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < matrix[i].length; j++) {

            const number = matrix[i][j];

            const tile = document.createElement('td');
            // tile.textContent = matrix[i][j];
            tile.classList.add('tile');
            tile.classList.add(`row${i}`);
            tile.classList.add(`col${j}`);
            tile.classList.add(`val${matrix[i][j]}`);
            // tile.innerText =`row${i}col${j}`;

            if (number != 0) {
                const image = document.createElement('img');
                image.alt = "Плитка";
                image.src = `plates/white/${number}.svg`;
                tile.append(image);
                tile.addEventListener('click', () => selectTile(tile));
            }
            else {
                tile.classList.add('matched');
            }
            row.appendChild(tile);
        }
        table.appendChild(row);
    }

    gameBoard.appendChild(table);
}

function selectTile(tile) {
    if (tile.classList.contains('selected') || tile.classList.contains('matched')) return;

    tile.classList.add('selected');
    selectedTiles.push(tile);

    if (selectedTiles.length === 2) {
        const [tile1, tile2] = selectedTiles;

        const isPath = checkMatch(tile1, tile2);
        if (isPath) {

            tile1.classList.add('matched');
            tile2.classList.add('matched');    
            tile1.classList.remove('selected');
            tile2.classList.remove('selected');

            const tile1data = getTileData(tile1);
            const tile2data = getTileData(tile2);

            matrix[tile1data.row][tile1data.col] = 0;
            matrix[tile2data.row][tile2data.col] = 0;

            availableTile(tile1, tile2, .01, 300);

            let bonusTime = calculateBonusTime(pairTime);
            finalTime = Math.min(levelTime, finalTime + bonusTime);
            pairTime = 0;
        }
        else {
            paintBackGround(tile1, tile2);
        }

        selectedTiles = [];
        checkgamecondition();
    }
}

function getTileData(tile) {

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

function checkMatch(tile1, tile2) {

    const tile1data = getTileData(tile1);
    const tile2data = getTileData(tile2);

    if (tile1data.value === tile2data.value) {
        return isPath(matrix, tile1data, tile2data);
    }
    return false;
}

function checkgamecondition() {
    let winCondition = true;
    
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j]) {
                winCondition = false;
            }
        }
    }

    if (winCondition) {
        gameCondition = Conditions.win;
        showModalDialoge();
        clearInterval(gametimer);
    }
    else {
        if (!isAvailableTile()) {
            currentReshaffle = 0;
            reshafle(true);
        }
    }
}

function pauseGame() {
    clearInterval(gametimer);
    gameCondition = Conditions.pause;
    showModalDialoge();
}

function reStartGame() {

    if (gameCondition != Conditions.pause) {
        levelTime = T1 - (gameLVL - 1) * 100 * dT;
        finalTime = levelTime;
        pairTime = 0;
    }

    if (gameCondition == Conditions.win) {
        gameLVL++;
    }

    if (gameCondition == Conditions.end) {
        currentLife = 3;
        gameLVL = 1;
    }

    if (gameCondition != Conditions.lostheart && gameCondition != Conditions.pause) {
        clearTable();
        createQueue();
        createTiles();
        createTable();
        reshafle(true);
    }

    updateInterface();

    gameCondition = Conditions.standart;

    start_countdown();
}

function help() {
    if (helpCount == 0)
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

                    const isPath = checkMatch(currentTile, targetTile);
                    if (isPath) {
                        helpCount--;
                        availableTile(currentTile, targetTile);
                        updateInterface();
                        return;
                    }
                }
            }
        }
    }
}

function isAvailableTile() {
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

                    const isPath = checkMatch(currentTile, targetTile);
                    if (isPath) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function toggleSound() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        soundBut.src = "static/soundon.png";
    } else {
        backgroundMusic.pause();
        soundBut.src = "static/soundoff.png";
    }
}

function reshafle(freeShuffle = false) {
    
    if (gameCondition === Conditions.pause || gameCondition === Conditions.end) {
        return;
    }
    if (currentLife === 0) {
        return;
    }

    gameBoard.classList.add('reshuffle');

    setTimeout(() => {  } , 1000);

    if (!freeShuffle) {
        currentLife--;
    }

    clearTable();

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const newI = Math.floor(Math.random() * numRows);
            const newJ = Math.floor(Math.random() * numCols);

            // Меняем местами элементы
            const temp = matrix[i][j];
            matrix[i][j] = matrix[newI][newJ];
            matrix[newI][newJ] = temp;
        }
    }

    updateHeart();
    createTable();
    
    if (!isAvailableTile() && currentReshaffle < maxReshaffle) {
        currentReshaffle++;
        reshafle(true);
    }
}
