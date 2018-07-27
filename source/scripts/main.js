(function () {
    'use strict';

    const canvas = document.querySelector('#game');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.onblur = function() {
        this.focus();
    };

    let speed = 20;

    localStorage.setItem('scoreData', JSON.stringify({
        score: 0,
        lives: 3
    }));
    let scoreData = JSON.parse(localStorage.getItem('scoreData'));

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
                    ctx.drawImage(image, newStartPostX, newStartPostY, aliens.width, aliens.height);
                };
                image.src = `${paths.svg}alien-0${row}.svg`;

                aliens.count++;
            }
        }

        let gameOver = false;
        let firstRun = true;
        let moveAliens = setInterval(() => {
            let firstAlien = true,
                rowDown = false;

            if (!gameOver) {
                for (const [key, value] of Object.entries(aliens.positions)) {
                    for (const [k, v] of Object.entries(value)) {
                        let alien = aliens.positions[key],
                            image = alien.image;

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

                            localStorage.setItem('scoreData', JSON.stringify({score: scoreData.score, lives: scoreData.lives}));
                            gameOver = true;
                            clearInterval(moveAliens);

                            ctx.fillStyle = 'black';
                            ctx.fillRect((canvas.width - 175), 25, 175, 30);
                            ctx.fillStyle = 'white';
                            ctx.fillText(`Lives: ${scoreData.lives}`, (canvas.width - 125), 50);
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
                                ctx.drawImage(image, alien.x, alien.y, aliens.width, aliens.height);
                            };
                            image.src = `${paths.svg}alien-0${alien.type}.svg`;
                        }

                        firstRun = false;
                        firstAlien = false;
                    }

                    if (gameOver)
                        break;
                }
            }

            if (gameOver) {
                if (scoreData.lives <= 0) {
                    alert('Game over!');
                } else {
                    drawAliens();
                }
            }
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
            ctx.drawImage(playerSvg, player.x, player.y, player.width, player.height);
        };
        playerSvg.src = `${paths.svg}player.svg`;
    }

    function bulletAnimation() {
        let animateBullet = setInterval(() => {
            ctx.clearRect(bulletX, bulletY, player.bullets.width, player.bullets.height);
            bulletY -= 5;

            let noHit = true;
            for (const [key, value] of Object.entries(aliens.positions)) {
                for (const [k, v] of Object.entries(value)) {
                    let alien = aliens.positions[key],
                        alienXStart = alien.x,
                        alienXEnd = alien.x + aliens.width,
                        alienYStart = alien.y,
                        alienYEnd = alien.y + aliens.height;

                    if (!alien.destroyed && (bulletX >= alienXStart && bulletX <= alienXEnd) && (bulletY >= alienYStart && bulletY <= alienYEnd)) {
                        noHit = false;
                        alien.destroyed = true;

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

                        ctx.clearRect(0, 0, 50, 50);
                        ctx.fillStyle = 'black';
                        ctx.fillRect(25, 25, 175, 30);
                        ctx.fillStyle = 'white';
                        ctx.fillText(`Score: ${scoreData.score}`, 50, 50);

                        clearInterval(animateBullet);
                        break;
                    }
                }

                if (!noHit)
                    break;
            }

            if (noHit) {
                ctx.beginPath();
                ctx.rect(bulletX, bulletY, player.bullets.width, player.bullets.height);
                ctx.fillStyle = "white";
                ctx.fill();
            }
        }, 50);
    }

    function init(reset = false) {
        if (!reset) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(`Score: ${scoreData.score}`, 50, 50);
            ctx.fillText(`Lives: ${scoreData.lives}`, (canvas.width - 125), 50);
        }

        window.addEventListener("keydown", movePlayer, false);
        playerRender();
        drawAliens();
    }

    const startTypes = ['click', 'keydown'];
    startTypes.forEach((types) => {
        console.log(types);
        canvas.addEventListener(types, (e) => {
            ctx.clearRect((canvas.width / 2) - 150, (canvas.height / 2) - 30, 300, 60);
            init();
        }, {
            once: true
        });
    });
}());