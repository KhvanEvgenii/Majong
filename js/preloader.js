const imagePaths = [
    // иконки
    'static/adv_ico.png',
    'static/background.png',
    'static/changeColor.png',
    'static/heartsBroken.png',
    'static/heartsFull.png',
    'static/help.png',
    'static/level.png',
    'static/levelCircle.png',
    'static/mainmenu.png',
    'static/pause.png',
    'static/pausebackground.png',
    'static/progressClock.png',
    'static/refresh.png',
    'static/soundoff.png',
    'static/soundon.png',
    'static/unpause.png',
    'static/unpause2.png',

    // цветные плашки
    'plates/Color/1.svg',
    'plates/Color/2.svg',
    'plates/Color/3.svg',
    'plates/Color/4.svg',
    'plates/Color/5.svg',
    'plates/Color/6.svg',
    'plates/Color/7.svg',
    'plates/Color/8.svg',
    'plates/Color/9.svg',
    'plates/Color/10.svg',
    'plates/Color/11.svg',
    'plates/Color/12.svg',
    'plates/Color/13.svg',
    'plates/Color/14.svg',
    'plates/Color/15.svg',
    'plates/Color/16.svg',
    'plates/Color/17.svg',
    'plates/Color/18.svg',
    'plates/Color/19.svg',
    'plates/Color/20.svg',
    'plates/Color/21.svg',
    'plates/Color/22.svg',
    'plates/Color/23.svg',
    'plates/Color/24.svg',
    'plates/Color/25.svg',
    'plates/Color/26.svg',
    'plates/Color/27.svg',
    'plates/Color/28.svg',
    'plates/Color/29.svg',
    'plates/Color/30.svg',
    'plates/Color/31.svg',
    'plates/Color/32.svg',
    'plates/Color/33.svg',
    'plates/Color/34.svg',
    'plates/Color/35.svg',
    'plates/Color/36.svg',

    // белые плашки
    'plates/white/1.svg',
    'plates/white/2.svg',
    'plates/white/3.svg',
    'plates/white/4.svg',
    'plates/white/5.svg',
    'plates/white/6.svg',  
    'plates/white/7.svg',
    'plates/white/8.svg',
    'plates/white/9.svg',
    'plates/white/10.svg',
    'plates/white/11.svg',
    'plates/white/12.svg',
    'plates/white/13.svg',
    'plates/white/14.svg',
    'plates/white/15.svg',
    'plates/white/16.svg',
    'plates/white/17.svg',
    'plates/white/18.svg',
    'plates/white/19.svg',
    'plates/white/20.svg',
    'plates/white/21.svg',
    'plates/white/22.svg',
    'plates/white/23.svg',
    'plates/white/24.svg',
    'plates/white/25.svg',
    'plates/white/26.svg',
    'plates/white/27.svg',
    'plates/white/28.svg',
    'plates/white/29.svg',
    'plates/white/30.svg',
    'plates/white/31.svg',
    'plates/white/32.svg',
    'plates/white/33.svg',
    'plates/white/34.svg',
    'plates/white/35.svg',
    'plates/white/36.svg'
  ];    

  const progressBar = document.getElementById('prl-progress-bar');
  const progressText = document.getElementById('prl-progress-text');

  
  let loadedCount = 0;
  const loadedImages = new Map();

  function updateProgress() {
    const percent = Math.floor((loadedCount / imagePaths.length) * 100);
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
  }


  function loadImages() {
    imagePaths.forEach(path => {
      const img = document.createElement('img');
      img.onload = () => {
        loadedImages.set(path, img);
        loadedCount++;
        updateProgress();
        console.log(img);
        
      };
      img.onerror = () => {
        console.error(`Ошибка при загрузке изображения: ${path}`);
      };
      img.src = path;
      img.alt = 'плитка';
      console.log('путь назначения', path);
  });
}

