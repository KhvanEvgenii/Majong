function updateHeart() {
    for (let i = 0; i < 3; i++) {
        const gameHeartsClasses = hearts[i].classList;
        const modalHeartsClasses = heartsModal[i].classList;

        if (i <= currentLife - 1) {
            gameHeartsClasses.add("heartsFull");
            gameHeartsClasses.remove("heartsBroken");
            modalHeartsClasses.add("heartsFull");
            modalHeartsClasses.remove("heartsBroken");
        }

        if (i > currentLife - 1) {
            gameHeartsClasses.remove("heartsFull");
            gameHeartsClasses.add("heartsBroken");
            modalHeartsClasses.remove("heartsFull");
            modalHeartsClasses.add("heartsBroken");
        }
    }
}

function showModalDialoge() {

    switch (gameCondition) {
        case Conditions.win:
            modalHead.innerHTML = '<h1>Поздравляем!</h1><h2>Уровень пройден</h2>';
            butModal.textContent = 'Следующий уровень';
            blurDiv.style.display = 'block';
            timeUpModal.style.display = 'block';
            break;
        case Conditions.lostheart:
            modalHead.innerHTML = '<h1>Упс...</h1><h2> Минус жизнь</h2> ';
            butModal.textContent = 'Продолжить играть';
            blurDiv.style.display = 'block';
            timeUpModal.style.display = 'block';
            break;
        case Conditions.end:
            modalHead.innerHTML = '<h1>Сердец больше нет</h1><h2> Попробуйте еще раз</h2> ';
            butModal.textContent = 'Начать с начала';
            blurDiv.style.display = 'block';
            timeUpModal.style.display = 'block';
            break;
        case Conditions.pause:
            pauseDiv.style.display = 'flex';
            gameContainer.style.display = 'none';
            break;
    }    
}

function hideModalDialoge() {
    gameContainer.style.display = 'block';
    startMenu.style.display = 'none';
    timeUpModal.style.display = 'none';
    blurDiv.style.display = 'none';
    pauseDiv.style.display = 'none';
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

function availableTile(tile1, tile2) {
    tile1.classList.add('availableTile');
    tile2.classList.add('availableTile');

    const rect1 = tile1.getBoundingClientRect();
    const rect2 = tile2.getBoundingClientRect();
    
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    
    // Создаем SVG элемент
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '1000';
    
    // Создаем путь для кривой Безье
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Вычисляем контрольную точку для кривой
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const controlX = midX;
    const controlY = midY - 50; // Регулирует изгиб кривой
    
    // Формируем путь с помощью кривой Безье
    const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
    
    path.setAttribute("d", d);
    path.setAttribute("stroke", "#22ff77");
    path.setAttribute("stroke-width", "6");
    path.setAttribute("fill", "none");
    path.setAttribute("marker-end", "url(#arrowhead)");
    
    // Добавляем определение маркера для стрелки
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");
    
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygon.setAttribute("fill", "#22ff77");
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    svg.appendChild(path);
    
    document.body.appendChild(svg);
    
    // Добавляем анимацию
    path.style.strokeDasharray = path.getTotalLength();
    path.style.strokeDashoffset = path.getTotalLength();
    path.style.animation = "drawArrow 1s ease-out forwards";
    
    // Удаляем SVG после анимации
    setTimeout(() => {
        svg.remove();
        tile1.classList.remove('availableTile');
        tile2.classList.remove('availableTile');
    }, 1000);
}

function updateInterface() {
    hideModalDialoge();
    levelElement.innerText = gameLVL;
    helpCountElement.innerText = helpCount;
    updateHeart();
}

function clearTable() {
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }
}
