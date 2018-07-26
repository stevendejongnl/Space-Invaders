(function () {
    'use strict';

    const canvas = document.querySelector('#game');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let speed = 20;
    let score = 0;
    let lives = 3;

    const player = {
        width: 100,
        height: 65,
        x: ((canvas.width / 2) - 100 / 2),
        y: (canvas.height - (65 * 2)),
        bullets: {
            width: 6,
            height: 14,
            data: {}
        }
    };

    const playerSvg = new Image();

    const aliens = {
        width: 65,
        height: 65,
        startPosX: 50,
        startPosY: 50,
        positions: []
    };

    let bulletX = 0,
        bulletY = 0;

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, 50, 50);
    ctx.fillText(`Lives: ${lives}`, (canvas.width - 125), 50);

    function drawAliens() {
        let totalAliensPosible = (Math.round((canvas.width - 100) / (aliens.width + 10)) - 4);
        let alienCount = 0;
        for (let row = 1; row < 5; row++) {
            for (let i = 0; i < totalAliensPosible; i++) {
                let alien = new Image(),
                    newStartPostX = ((aliens.width + 10) * (i + 1)),
                    newStartPostY = ((aliens.startPosY + 25) * row);

                aliens.positions.push({
                    alienCount: {
                        x: newStartPostX,
                        y: newStartPostY
                    }
                });

                alien.onload = () => {
                    ctx.drawImage(alien, newStartPostX, newStartPostY, aliens.width, aliens.height);
                };
                alien.src = `./assets/images/SVG/alien-0${row}.svg`;

                alienCount++;
            }
        }

        console.log(aliens.positions);
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

        // if ((event.code === 'ArrowUp' || event.keyCode === 38) && player.y - player.height < (canvas.height - (player.height * 3))) {
        //     ctx.clearRect(player.x, player.y, player.width, player.height);
        //     player.y = (canvas.height - (player.height * 3));
        //     playerRender();
        //     return false;
        // }
        //
        // if ((event.code === 'ArrowDown' || event.keyCode === 40) && player.y + (player.height * 2) > canvas.height) {
        //     ctx.clearRect(player.x, player.y, player.width, player.height);
        //     player.y = canvas.height - player.height;
        //     playerRender();
        //     return false;
        // }

        if (event.code === 'Space' || event.keyCode === 32) {
            console.log('Shoot!');

            bulletX = (player.x + (player.width / 2)) - 3;
            bulletY = player.y - (player.height - (player.height - 25));
            // bulletRender();
            setInterval(bulletAnimation, 500);
            return false;
        }

        ctx.clearRect(player.x, player.y, player.width, player.height);
        if (event.code === 'ArrowLeft' || event.keyCode === 37) {
            player.x -= speed;
        }
        if (event.code === 'ArrowRight' || event.keyCode === 39) {
            player.x += speed;
        }
        // if (event.code === 'ArrowUp' || event.keyCode === 38) {
        //     for (let currentSpeed = 0; currentSpeed < speed; currentSpeed++)
        //         player.y -= 1;
        // }
        // if (event.code === 'ArrowDown' || event.keyCode === 40) {
        //     for (let currentSpeed = 0; currentSpeed < speed; currentSpeed++)
        //         player.y += 1;
        // }
        playerRender();
    }

    function playerRender() {
        playerSvg.onload = () => {
            ctx.drawImage(playerSvg, player.x, player.y, player.width, player.height);
        };
        playerSvg.src = "./assets/images/SVG/player.svg";
    }

    function bulletRender() {
        ctx.beginPath();
        ctx.rect(bulletX, bulletY, player.bullets.width, player.bullets.height);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    function bulletAnimation() {
        ctx.clearRect(bulletX, bulletY, player.bullets.width, player.bullets.height);
        bulletY -= 5;
        bulletRender();
    }

    window.addEventListener("keydown", movePlayer, false);
    playerRender();
    drawAliens();
}());