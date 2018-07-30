(function () {
    'use strict';

    const canvas = document.querySelector('#game');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.onblur = function () {
        this.focus();
    };

    let speed = 20;

    localStorage.setItem('scoreData', JSON.stringify({
        score: 0,
        lives: 3
    }));
    let scoreData = JSON.parse(localStorage.getItem('scoreData'));

    let getCookieScoreList = JSON.parse(getCookie('cookieScoreList'));
    if (!Array.isArray(getCookieScoreList))
        getCookieScoreList = [];

    getCookieScoreList = [...new Set(getCookieScoreList)];
    getCookieScoreList.sort((a, b) => b - a);

    const paths = {
        assets: './assets/',
        images: './assets/images/',
        svg: './assets/images/SVG/'
    };

    const player = {
        width: 100,
        height: 65,
        x: ((canvas.width / 2) - 100 / 2),
        y: (canvas.height - (65 * 2)),
        bullets: {
            width: 6,
            height: 14,
            data: []
        }
    };
    const playerSvg = new Image();

    const aliens = {
        width: 65,
        height: 65,
        startPosX: 50,
        startPosY: 50,
        totalInRow: (Math.round((canvas.width - 100) / 75) - 5),
        totalWidth: ((Math.round((canvas.width - 100) / 75) - 4) * 75),
        count: 0,
        direction: 'right',
        positions: []
    };

    let bulletX = 0,
        bulletY = 0;

    let startButton = new Image();
    startButton.onload = () => {
        ctx.drawImage(startButton, (canvas.width / 2) - 150, (canvas.height / 2) - 30, 300, 60);
    };
    startButton.src = `${paths.svg}start-button.svg`;

    ctx.font = "35px Arial";
    ctx.fillStyle = 'white';
    ctx.textAlign = "center";
    ctx.fillText('Top 3 Highscores:', (canvas.width / 2), (canvas.height / 2) + 80);
    ctx.font = "20px Arial";
    getCookieScoreList.slice(0, 3).map((item, i) => {
        let rowPos = i + 2;
        ctx.fillText(`${item}`, (canvas.width / 2), (canvas.height / 2) + 80 + (rowPos * 30));
    });

    function drawAliens() {
        for (let row = 1; row < 5; row++) {
            for (let i = 0; i < aliens.totalInRow; i++) {
                let newStartPostX = ((aliens.width + 10) * (i + 1)),
                    newStartPostY = ((aliens.startPosY + 25) * row);

                aliens.positions.push({
                    id: aliens.count,
                    image: new Image(),
                    type: row,
                    x: newStartPostX,
                    y: newStartPostY,
                    destroyed: false
                });

                let image = aliens.positions[aliens.count].image;

                image.onload = () => {
                    ctx.beginPath();
                    ctx.drawImage(image, newStartPostX, newStartPostY, aliens.width, aliens.height);
                    ctx.closePath();
                };
                image.src = `${paths.svg}alien-0${row}.svg`;

                aliens.count++;
            }
        }

        let gameOver = false;
        let firstRun = true;
        let moveAliens = setInterval(() => {
            let firstAlien = true,
                rowDown = false,
                totalDestroyed = 0;

            if (!gameOver) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.rect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.closePath();

                let scoreData = JSON.parse(localStorage.getItem('scoreData'));
                ctx.font = "20px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(`Score: ${scoreData.score}`, 100, 50);
                ctx.fillText(`Lives: ${scoreData.lives}`, (canvas.width - 175), 50);

                for (const [key, value] of Object.entries(aliens.positions)) {
                    for (const [k, v] of Object.entries(value)) {
                        let alien = aliens.positions[key],
                            image = alien.image;

                        if (aliens.count === totalDestroyed) {
                            console.log(aliens.count, totalDestroyed);
                            ctx.clearRect(alien.x, alien.y, aliens.width, aliens.height);
                            clearInterval(moveAliens);
                            break;
                        }

                        ctx.clearRect(alien.x, alien.y, aliens.width, aliens.height);

                        if (firstAlien && ((alien.x + aliens.totalWidth) >= canvas.width)) {
                            aliens.direction = 'left';
                            rowDown = true;
                        }

                        if (!firstRun && firstAlien && ((alien.x + aliens.totalWidth) <= (aliens.startPosX + aliens.totalWidth))) {
                            aliens.direction = 'right';
                            rowDown = true;
                        }

                        if (!alien.destroyed && (alien.y + aliens.height) >= player.y) {
                            scoreData = JSON.parse(localStorage.getItem('scoreData'));

                            scoreData.lives--;

                            localStorage.setItem('scoreData', JSON.stringify({
                                score: scoreData.score,
                                lives: scoreData.lives
                            }));
                            gameOver = true;
                            clearInterval(moveAliens);

                            ctx.fillStyle = 'black';
                            ctx.fillRect((canvas.width - 275), 25, 275, 30);
                            ctx.fillStyle = 'white';
                            ctx.fillText(`Lives: ${scoreData.lives}`, (canvas.width - 175), 50);
                            break;
                        }

                        if (aliens.direction === 'right') {
                            if (k === 'x')
                                alien.x = (v + (aliens.width / 2));
                        } else {
                            if (k === 'x')
                                alien.x = (v - (aliens.width / 2));
                        }
                        if (rowDown && k === 'y')
                            alien.y = (v + (aliens.height / 2));

                        if (!alien.destroyed) {
                            image.onload = () => {
                                ctx.beginPath();
                                ctx.drawImage(image, alien.x, alien.y, aliens.width, aliens.height);
                                ctx.closePath();
                            };
                            image.src = `${paths.svg}alien-0${alien.type}.svg`;
                        }

                        playerRender();

                        firstRun = false;
                        firstAlien = false;
                    }

                    if (aliens.count === totalDestroyed)
                        break;

                    if (gameOver)
                        break;
                }

                for (let key in aliens.positions) {
                    if (aliens.positions[key].destroyed)
                        totalDestroyed++;
                }
            }

            if (aliens.count === totalDestroyed)
                init(true);

            if (gameOver)
                init(true, true);
        }, 500);
    }

    function movePlayer(event) {
        if ((event.code === 'ArrowLeft' || event.keyCode === 37) && player.x - player.width < 0) {
            ctx.clearRect(player.x, player.y, player.width, player.height);
            player.x = 0;
            playerRender();
            return false;
        }

        if ((event.code === 'ArrowRight' || event.keyCode === 39) && player.x + (player.width * 2) > canvas.width) {
            ctx.clearRect(player.x, player.y, player.width, player.height);
            player.x = canvas.width - player.width;
            playerRender();
            return false;
        }

        if (event.code === 'Space' || event.keyCode === 32) {
            bulletX = (player.x + (player.width / 2)) - 3;
            bulletY = player.y - (player.height - (player.height - 25));
            bulletAnimation();
            return false;
        }

        ctx.clearRect(player.x, player.y, player.width, player.height);
        if (event.code === 'ArrowLeft' || event.keyCode === 37) {
            player.x -= speed;
        }

        if (event.code === 'ArrowRight' || event.keyCode === 39) {
            player.x += speed;
        }

        playerRender();
    }

    function playerRender() {
        playerSvg.onload = () => {
            ctx.beginPath();
            ctx.drawImage(playerSvg, player.x, player.y, player.width, player.height);
            ctx.closePath();
        };
        playerSvg.src = `${paths.svg}player.svg`;
    }

    function bulletAnimation() {

        let bullet = player.bullets.data,
            newId = bullet.length;

        bullet.push({
            x: bulletX,
            y: bulletY,
            done: false,
            element: null
        });

        bullet[newId].element = setInterval(() => {
            ctx.clearRect(bullet[newId].x, bullet[newId].y, player.bullets.width, player.bullets.height);
            bullet[newId].y -= 5;

            let noHit = true;
            for (const [key, value] of Object.entries(aliens.positions)) {
                for (const [k, v] of Object.entries(value)) {
                    let alien = aliens.positions[key],
                        alienXStart = alien.x,
                        alienXEnd = alien.x + aliens.width,
                        alienYStart = alien.y,
                        alienYEnd = alien.y + aliens.height;

                    if (!alien.destroyed && (bullet[newId].x >= alienXStart && bullet[newId].x <= alienXEnd) && (bullet[newId].y >= alienYStart && bullet[newId].y <= alienYEnd)) {
                        noHit = false;
                        alien.destroyed = true;
                        bullet[newId].done = true;

                        let scoreData = JSON.parse(localStorage.getItem('scoreData'));

                        if (alien.type === 4)
                            scoreData.score += 5;
                        if (alien.type === 3)
                            scoreData.score += 10;
                        if (alien.type === 2)
                            scoreData.score += 15;
                        if (alien.type === 1)
                            scoreData.score += 20;

                        localStorage.setItem('scoreData', JSON.stringify({
                            score: scoreData.score,
                            lives: scoreData.lives
                        }));

                        ctx.fillStyle = 'black';
                        ctx.fillRect(0, 25, 275, 30);
                        ctx.fillStyle = 'white';
                        ctx.fillText(`Score: ${scoreData.score}`, 100, 50);

                        clearInterval(bullet[newId].element);
                        break;
                    }
                }

                if (!noHit)
                    break;
            }

            if (noHit) {
                ctx.beginPath();
                ctx.rect(bullet[newId].x, bullet[newId].y, player.bullets.width, player.bullets.height);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.closePath();
            }
        }, 50);
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function init(reset = false, gameOver = false) {
        scoreData = JSON.parse(localStorage.getItem('scoreData'));

        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`Score: ${scoreData.score}`, 100, 50);
        ctx.fillText(`Lives: ${scoreData.lives}`, (canvas.width - 175), 50);

        if (reset) {
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.rect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.closePath();

                for (const [key, value] of Object.entries(aliens.positions)) {
                    ctx.clearRect(value.x, value.y, aliens.width, aliens.height);
                }

                ctx.clearRect(player.x, player.y, player.width, player.height);

                player.bullets.data.forEach((bullet) => {
                    ctx.clearRect(bullet.x, bullet.y, player.bullets.width, player.bullets.height);
                    clearInterval(bullet.element);
                });

                aliens.count = 0;
                aliens.positions = [];

                if (gameOver && scoreData.lives <= 0) {
                    window.removeEventListener('keydown', movePlayer, false);
                    window.addEventListener("keydown", (event) => {
                        event.preventDefault();
                        if (event.code === 'Space' || event.keyCode === 32)
                            location.reload();
                    });

                    getCookieScoreList.push(scoreData.score);
                    getCookieScoreList = [...new Set(getCookieScoreList)];
                    getCookieScoreList.sort((a, b) => b - a);
                    setCookie('cookieScoreList', JSON.stringify(getCookieScoreList), 365);

                    let currentPositionOfRanking = (getCookieScoreList.findIndex(position => position === scoreData.score) + 1);
                    let namingPositionOfRanking = (currentPositionOfRanking <= 1 ? '1st' : (currentPositionOfRanking === 2 ? `${currentPositionOfRanking}nd` : (currentPositionOfRanking === 3 ? `${currentPositionOfRanking}rd` : `${currentPositionOfRanking}th`)));

                    ctx.fillStyle = 'red';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.font = "35px Arial";
                    ctx.fillStyle = 'white';
                    ctx.textAlign = "center";
                    ctx.fillText('GAME OVER!!', (canvas.width / 2), (canvas.height / 2));
                    ctx.font = "25px Arial";
                    ctx.fillText(`You are ${namingPositionOfRanking} in the highscore ranking`, (canvas.width / 2), ((canvas.height / 2)) + 30);
                    ctx.fillText(`with a score of ${scoreData.score}`, (canvas.width / 2), ((canvas.height / 2)) + 60);
                } else {
                    drawAliens();
                }
            }, 500);
        } else {
            window.addEventListener("keydown", movePlayer, false);
            drawAliens();
            playerRender();
        }
    }

    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.keyCode === 32) {
            ctx.clearRect((canvas.width / 2) - 150, (canvas.height / 2) - 30, 800, 900);
            init();
        }
    }, {
        once: true
    });
}());