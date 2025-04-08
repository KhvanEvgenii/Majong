Conditions = { standart: 'standart', win: 'win', lostheart: 'lostheart', end: 'end', pause: 'pause', reshuffle: 'reshuffle', showAdv: 'showAdv' };

function showRewardedVideo(rewardedCallback) {    
    if ('ysdk' in window) {
        yandexStop();
        window.ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                console.log('Video ad open.');
            },
            onRewarded: () => {
                rewardedCallback(true);
                console.log('Rewarded!');
            },
            onClose: () => {
                rewardedCallback(false);
            },
            onError: (e) => {
                    console.log('Error while open video ad:', e);
                }
            }
        })
    }
    else {
        rewardedCallback(true);
    }
}

function showFullscreenAdv(fullscreenCallback) {
    if ('ysdk' in window) {
        window.ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: () => {
                    fullscreenCallback();
            },
            onError: (error) => {
                console.log('Error while open fullscreen adv:', error);
            }
        }
        })
    }
    else {
        fullscreenCallback();
    }
}

function yandexStart() {
    if ('ysdk' in window) {
        ysdk.features.GameplayAPI?.start();
    }
}

function yandexStop() {
    if ('ysdk' in window) {
        ysdk.features.GameplayAPI?.stop();
    }
}

function pauseCallback(game) {
    console.log('pauseCallback');
    const table = document.getElementById('matrix-table');
    if (!table) {
        console.log('table not found');
        return;
    }
    game.pauseGame();
    game.sound.muteAmbient();
}

function resumeCallback(game) {
    console.log('resumeCallback');
    const table = document.getElementById('matrix-table');
    if (!table) {
        console.log('table not found');
        return;
    }
    game.unpauseGame();
    game.sound.unmuteAmbient();
}

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return;
}, { passive: false });

