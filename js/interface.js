function updateHeart(game) {
    for (let i = 0; i < 3; i++) {
        if (i <= game.currentLife - 1) {
            document.getElementById('heartFull' + i).style.display = "block";
            document.getElementById('heartBroken' + i).style.display = "none";
        }

        if (i > game.currentLife - 1) {
            document.getElementById('heartFull' + i).style.display = "none";
            document.getElementById('heartBroken' + i).style.display = "block";
        }
    }

    game.heartsModal.innerHTML = game.heartsDiv.innerHTML;
}

function showPath(allPath) {
    // Находим самый короткий путь в массиве allPath
    console.log(allPath);
    let shortestPath = allPath[0];
    
    for (let i = 1; i < allPath.length; i++) {
        if (allPath[i].length < shortestPath.length) {
            shortestPath = allPath[i];
        }
    }
    
    const path = shortestPath;
    console.log(path);

    // Собираем все плитки в массив
    const tiles = [];
    for (let i = 0; i < path.length; i++) {
        let tile = document.querySelectorAll(`.row${path[i].i}.col${path[i].j}`)[0];
        tiles.push(tile);
    }

    // Передаем массив плиток в функцию availableTile
    availableTile(tiles, 1, 1000);
}

function showModalDialoge(game) {

    switch (game.gameCondition) {
        case Conditions.win:
            game.modalHead.innerHTML = '<h1>Поздравляем!</h1><h2>Уровень пройден</h2>';
            game.butModal.textContent = 'Следующий уровень';
            game.blurDiv.style.display = 'block';
            game.timeUpModal.style.display = 'block';
            break;
        case Conditions.lostheart:
            game.modalHead.innerHTML = '<h1>Упс...</h1><h2> Минус жизнь</h2> ';
            game.butModal.textContent = 'Продолжить играть';
            game.blurDiv.style.display = 'block';
            game.timeUpModal.style.display = 'block';
            sound.playSound('lostheart');
            break;
        case Conditions.end:
            game.modalHead.innerHTML = '<h1>Сердец больше нет</h1><h2> Попробуйте еще раз</h2> ';
            game.butModal.textContent = 'Начать с начала';
            game.blurDiv.style.display = 'block';
            game.timeUpModal.style.display = 'block';
            sound.playSound('gameover');
            break;
        case Conditions.pause:
            game.pauseDiv.style.display = 'flex';
            game.gameContainer.style.display = 'none';
            break;
    }
}

function hideModalDialoge(game) {
    game.gameContainer.style.display = 'flex';
    game.startMenu.style.display = 'none';
    game.timeUpModal.style.display = 'none';
    game.blurDiv.style.display = 'none';
    game.pauseDiv.style.display = 'none';
}

function paintBackGround(tile1, tile2) {
    setTimeout(() => {
        tile1.classList.remove('selected');
        tile2.classList.remove('selected');
    }, 300);
    tile1.classList.add('unpair');
    tile2.classList.add('unpair');
    setTimeout(() => {
        tile1.classList.remove('unpair');
        tile2.classList.remove('unpair');
    }, 700);
}

function availableTile(tiles, time = 1, delay = 1000) {
    // Проверяем, передан ли массив или отдельные элементы
    if (!Array.isArray(tiles)) {
        // Поддержка старого формата вызова с двумя отдельными элементами
        const tile1 = tiles;
        const tile2 = arguments[1];
        time = arguments[2] || 1;
        delay = arguments[3] || 1000;

        // Преобразуем в массив для единообразной обработки
        tiles = [tile1, tile2];
    }

    // Добавляем класс ко всем плиткам
    tiles.forEach(tile => {
        tile.classList.add('availableTile');
    });

    // Создаем SVG элемент
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1000';
    document.body.appendChild(svg);

    // Создаем path элемент
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('stroke', '#ffcc00');
    path.setAttribute('stroke-width', '5');
    path.setAttribute('fill', 'none');
    path.style.strokeDasharray = '10, 5';
    path.style.animation = 'dash 1s linear infinite';

    const cellCoordinates = [];

    // Находим координаты центров ячеек
    for (let tile of tiles) {
        const rect = tile.getBoundingClientRect();
        // Координаты центра плитки относительно окна
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        cellCoordinates.push({ x, y });
    }

    // Создаем path
    let pathData = `M ${cellCoordinates[0].x} ${cellCoordinates[0].y}`;
    for (let i = 1; i < cellCoordinates.length; i++) {
        pathData += ` L ${cellCoordinates[i].x} ${cellCoordinates[i].y}`;
    }

    // Добавляем path в SVG
    path.setAttribute('d', pathData);
    svg.appendChild(path);

    // Получаем длину пути для правильной анимации
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    
    // Анимация пути
    path.style.animation = `dash ${time}s linear forwards`;


    // Удаляем SVG после анимации
    setTimeout(() => {
        svg.remove();
        tiles.forEach(tile => {
            tile.classList.remove('availableTile');
        });
    }, delay);
}

function updateInterface(game) {
    hideModalDialoge(game);
    game.levelElement.innerText = game.gameLVL;
    game.helpCountElement.innerText = game.helpCount;
    updateHeart(game);
}

function clearTable() {
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }
}

function changeSoundImg(muted = false) {
    if (!muted) {
        soundBut.src = "static/soundon.png";
    } else {
        soundBut.src = "static/soundoff.png";
    }
}