const directions = {
    up: { dx: -1, dy: 0 },
    down: { dx: 1, dy: 0 },
    left: { dx: 0, dy: -1 },
    right: { dx: 0, dy: 1 }
};

let allPath = [];

function isPath(matrix, startTile, endTile) {
    allPath = [];

    if (!matrix || matrix.length === 0) return false;

    const newMatrix = cloneMatrix(matrix);
    const newStartRow = startTile.row;
    const newStartCol = startTile.col;
    const newEndRow = endTile.row;
    const newEndCol = endTile.col;

    const visited = Array(newMatrix.length).fill().map(() => Array(newMatrix[0].length).fill(false));

    checkPath(newMatrix, newStartRow, newStartCol, newEndRow, newEndCol, visited, [{ i: newStartRow, j: newStartCol }]);
    return allPath.length > 0;
}

function cloneMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    const newMatrix = Array(rows).fill().map(() => Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            newMatrix[i][j] = matrix[i][j];
        }
    }
    return newMatrix;
}

function isSafe(i, j, matrix) {
    return i >= 0 && i < matrix.length && j >= 0 && j < matrix[0].length;
}

function checkPath(matrix, i, j, endRow, endCol, visited, currentPath) {
    if (i === endRow && j === endCol) {
        const originalPath = currentPath.map(point => ({ i: point.i, j: point.j}));
        allPath.push(originalPath);
        return;
    }

    for (const dir in directions) {
        const ni = i + directions[dir].dx;
        const nj = j + directions[dir].dy;

        if (!isSafe(ni, nj, matrix) || visited[ni][nj]) continue;
        if (matrix[ni][nj] !== 0 && matrix[ni][nj] !== 999 && !(ni === endRow && nj === endCol)) continue;

        const newPath = [...currentPath, { i: ni, j: nj }];

        if (countTurns(newPath) > 2) continue;

        visited[ni][nj] = true;
        checkPath(matrix, ni, nj, endRow, endCol, visited, newPath);
        visited[ni][nj] = false;
    }
}

function countTurns(path) {
    let turns = 0;
    for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const next = path[i + 1];

        const dx1 = curr.i - prev.i;
        const dy1 = curr.j - prev.j;
        const dx2 = next.i - curr.i;
        const dy2 = next.j - curr.j;

        if ((dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0)) {
            turns++;
        }
    }
    return turns;
}