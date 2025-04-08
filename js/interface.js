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

function showPath(allPath, time = 0.2, delay = 500) {
    // Находим самый короткий путь в массиве allPath
    let shortestPath = allPath[0];

    for (let i = 1; i < allPath.length; i++) {
        if (allPath[i].length < shortestPath.length) {
            shortestPath = allPath[i];
        }
    }

    const path = shortestPath;

    // Собираем все плитки в массив
    const tiles = [];
    for (let i = 0; i < path.length; i++) {
        let tile = document.querySelectorAll(`.row${path[i].i}.col${path[i].j}`)[0];
        tiles.push(tile);
    }

    // Передаем массив плиток в функцию availableTile
    availableTile(tiles, time, delay);
}

function showModalDialoge(game) {

    if (game.gameCondition == Conditions.lostheart) {
        game.currentLife--;
        game.storage.saveGame(game);
    }

    clearInterval(game.gametimer);

    updateHeart(game);

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
            game.sound.playSound('lostheart');
            break;
        case Conditions.reshuffle:
            game.modalHead.innerHTML = '<h1>Услуга платная</h1><h2> Минус жизнь</h2> ';
            game.butModal.textContent = 'Продолжить играть';
            game.blurDiv.style.display = 'block';
            game.timeUpModal.style.display = 'block';
            game.sound.playSound('lostheart');
            break;
        case Conditions.showAdv:
            game.modalHead.innerHTML = '<h1>Сердец больше нет</h1><h2> Попробуйте еще раз</h2> ';
            game.butModal.textContent = 'Начать с начала';
            game.blurDiv.style.display = 'block';
            game.timeUpModal.style.display = 'block';
            game.sound.playSound('gameover');
            break;
        case Conditions.end:
            game.modalHead.innerHTML = '<h1>Сердец больше нет</h1><h2> Попробуйте еще раз</h2> ';
            game.butModal.textContent = 'Начать с начала';
            game.blurDiv.style.display = 'block';
            game.timeUpModal.style.display = 'block';
            game.sound.playSound('gameover');
            break;
        case Conditions.pause:
            game.pauseDiv.style.display = 'flex';
            document.getElementById('game-board').style.display = 'none';
            // game.gameContainer.style.display = 'none';
            break;
    }
    yandexStop();
}

function hideModalDialoge(game) {
    document.getElementById('game-board').style.display = 'block';
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

function availableTile(tiles, time = 0.2, delay = 1000) {
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
    // path.style.animation = 'dash 1s linear infinite';

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
    game.advIco.style.display = game.helpCount <= 0 ? 'flex' : 'none';
    game.helpCountElement.style.display = game.helpCount != 0 ? 'flex' : 'none';
    updateHeart(game);
    updateTable(game);
}

function changeSoundImg(muted = false) {
    if (!muted) {
        soundBut.src = "static/soundon.png";
    } else {
        soundBut.src = "static/soundoff.png";
    }
}

function  showTable(game) {
    const table = document.createElement('table');
    table.id = 'matrix-table';

    for (let i = 0; i < game.matrix.length; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < game.matrix[i].length; j++) {
            const number = game.matrix[i][j];   
            const tile = document.createElement('td');

            tile.classList.add(`row${i}`);
            tile.classList.add(`col${j}`);
            tile.classList.add(`val${game.matrix[i][j]}`);

            if (number != 0 && number != 999) {
                
                const image = document.createElement('img');
                console.log(game.isColor);
                const color = game.isColor ? 'Color' : 'White';
                const path = `plates/${color}/${number}.svg`;
                // const image = loadedImages.get(path).cloneNode(true);

                image.src = path;
                tile.appendChild(image);
                tile.addEventListener('click', () => game.selectTile(tile));
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

    game.gameBoard.appendChild(table);
}

function clearTable(game) {
    const table = document.getElementById('matrix-table');
    if (table) {
        table.remove();
    }
}

function updateTable(game) {
    clearTable(game);
    showTable(game);
}

function changeColor(game) {
    game.isColor = !game.isColor;
    updateTable(game);
}