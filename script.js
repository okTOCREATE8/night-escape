// ===============================
// ELEMENTE
// ===============================

const game = document.getElementById("game");
const player = document.getElementById("player");
const gun = document.querySelector(".gun");
const muzzleFlash = document.querySelector(".muzzle-flash");

const healthDisplay = document.getElementById("health");
const ammoDisplay = document.getElementById("ammo");
const maxAmmoDisplay = document.getElementById("maxAmmo");

const scoreDisplay = document.getElementById("score");
const moneyDisplay = document.getElementById("money");

const waveDisplay = document.getElementById("wave");

const grenadeDisplay = document.getElementById("grenades");

const weaponNameDisplay =
    document.getElementById("weaponName");

const crosshair =
    document.getElementById("crosshair");

const shopScreen =
    document.getElementById("shopScreen");

const shopMoney =
    document.getElementById("shopMoney");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const bossWarning =
    document.getElementById("bossWarning");


// ===============================
// SPIELER
// ===============================

let playerX = 500;
let playerY = 500;

let velocityY = 0;

const gravity = 0.8;

let jumping = false;

let playerHealth = 100;

let playerSpeed = 5;


// ===============================
// PUNKTE & GELD
// ===============================

let score = 0;

let money = 0;


// ===============================
// WELLEN
// ===============================

let wave = 1;

let zombiesToSpawn = 5;

let zombiesSpawned = 0;

let waveActive = true;

let bossWave = false;


// ===============================
// ZOMBIES
// ===============================

const zombies = [];

let zombieSpawnTimer = 0;

const zombieSpawnDelay = 1200;


// ===============================
// WAFFEN
// ===============================

let currentWeapon = "pistol";

let shotgunOwned = false;

let machinegunOwned = false;


// Pistole

const pistol = {

    name: "Pistole",

    damage: 1,

    ammo: 12,

    maxAmmo: 12,

    reloadTime: 1200,

    fireRate: 350

};


// Shotgun

const shotgun = {

    name: "Shotgun",

    damage: 1,

    ammo: 6,

    maxAmmo: 6,

    reloadTime: 1500,

    fireRate: 800

};


// Maschinenpistole

const machinegun = {

    name: "Maschinenpistole",

    damage: 1,

    ammo: 30,

    maxAmmo: 30,

    reloadTime: 1800,

    fireRate: 90

};


// ===============================
// SCHIESSEN
// ===============================

let mouseDown = false;

let lastShot = 0;

let isReloading = false;


// ===============================
// GRANATEN
// ===============================

let grenades = 3;

let grenadeCooldown = false;


// ===============================
// POWER UPS
// ===============================

let rapidFireActive = false;

let doubleMoneyActive = false;

let speedBoostActive = false;


// ===============================
// TASTEN
// ===============================

const keys = {};


// ===============================
// MAUSPOSITION
// ===============================

let mouseGameX = 600;

let mouseGameY = 300;


// ===============================
// WAFFE HOLEN
// ===============================

function getWeapon() {

    if (currentWeapon === "pistol") {

        return pistol;

    }

    if (currentWeapon === "shotgun") {

        return shotgun;

    }

    if (currentWeapon === "machinegun") {

        return machinegun;

    }

}


// ===============================
// HUD AKTUALISIEREN
// ===============================

function updateHUD() {

    const weapon = getWeapon();

    healthDisplay.textContent =
        Math.max(0, Math.floor(playerHealth));

    ammoDisplay.textContent =
        weapon.ammo;

    maxAmmoDisplay.textContent =
        weapon.maxAmmo;

    scoreDisplay.textContent =
        score;

    moneyDisplay.textContent =
        money;

    waveDisplay.textContent =
        wave;

    grenadeDisplay.textContent =
        grenades;

    weaponNameDisplay.textContent =
        weapon.name;

}


// ===============================
// TASTATUR
// ===============================

document.addEventListener("keydown", (event) => {

    const key =
        event.key.toLowerCase();

    keys[key] = true;


    // SPRINGEN

    if (
        event.code === "Space" &&
        !jumping &&
        !gameIsOver
    ) {

        velocityY = -15;

        jumping = true;

    }


    // NACHLADEN

    if (key === "r") {

        reloadWeapon();

    }


    // GRANATE

    if (key === "g") {

        throwGrenade();

    }


    // WAFFEN

    if (key === "1") {

        currentWeapon = "pistol";

        updateHUD();

    }


    if (
        key === "2" &&
        shotgunOwned
    ) {

        currentWeapon = "shotgun";

        updateHUD();

    }


    if (
        key === "3" &&
        machinegunOwned
    ) {

        currentWeapon = "machinegun";

        updateHUD();

    }

});


document.addEventListener("keyup", (event) => {

    keys[
        event.key.toLowerCase()
    ] = false;

});


// ===============================
// MAUS BEWEGUNG
// ===============================

document.addEventListener("mousemove", (event) => {

    const gameRect =
        game.getBoundingClientRect();


    mouseGameX =
        event.clientX - gameRect.left;

    mouseGameY =
        event.clientY - gameRect.top;


    // FADENKREUZ

    crosshair.style.left =
        mouseGameX + "px";

    crosshair.style.top =
        mouseGameY + "px";


    // WAFFE DREHEN

    const playerCenterX =
        playerX + 20;

    const playerCenterY =
        playerY + 35;


    const dx =
        mouseGameX - playerCenterX;

    const dy =
        mouseGameY - playerCenterY;


    const angle =
        Math.atan2(dy, dx)
        * 180 / Math.PI;


    gun.style.transform =
        `rotate(${angle}deg)`;

});


// ===============================
// MAUSTASTE GEDRÜCKT
// ===============================

document.addEventListener("mousedown", (event) => {

    if (event.button === 0) {

        mouseDown = true;

        shoot();

    }

});


// ===============================
// MAUSTASTE LOSLASSEN
// ===============================

document.addEventListener("mouseup", (event) => {

    if (event.button === 0) {

        mouseDown = false;

    }

});


// ===============================
// SCHIESSEN
// ===============================

function shoot() {

    if (
        gameIsOver ||
        !waveActive ||
        isReloading
    ) {

        return;

    }


    const weapon =
        getWeapon();


    if (weapon.ammo <= 0) {

        reloadWeapon();

        return;

    }


    const now =
        Date.now();


    let fireRate =
        weapon.fireRate;


    // POWER UP SCHNELLFEUER

    if (rapidFireActive) {

        fireRate =
            fireRate / 2;

    }


    if (
        now - lastShot <
        fireRate
    ) {

        return;

    }


    lastShot = now;


    weapon.ammo--;


    updateHUD();


    // MÜNDUNGSFEUER

    muzzleFlash.style.display =
        "block";


    setTimeout(() => {

        muzzleFlash.style.display =
            "none";

    }, 60);


    // SHOTGUN

    if (
        currentWeapon ===
        "shotgun"
    ) {

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            createBullet(
                (Math.random() - 0.5) * 0.25
            );

        }

    }

    else {

        createBullet(0);

    }

}


// ===============================
// KUGEL
// ===============================

function createBullet(spread) {

    const bullet =
        document.createElement("div");

    bullet.classList.add("bullet");


    const startX =
        playerX + 20;

    const startY =
        playerY + 35;


    bullet.style.left =
        startX + "px";

    bullet.style.top =
        startY + "px";


    game.appendChild(bullet);


    const dx =
        mouseGameX - startX;

    const dy =
        mouseGameY - startY;


    let angle =
        Math.atan2(dy, dx);


    angle += spread;


    const directionX =
        Math.cos(angle);

    const directionY =
        Math.sin(angle);


    const weapon =
        getWeapon();


    const bulletDamage =
        weapon.damage;


    let bulletX =
        startX;

    let bulletY =
        startY;


    function moveBullet() {


        if (gameIsOver) {

            bullet.remove();

            return;

        }


        bulletX +=
            directionX * 12;

        bulletY +=
            directionY * 12;


        bullet.style.left =
            bulletX + "px";

        bullet.style.top =
            bulletY + "px";


        // ZOMBIES TREFFEN

        for (
            let i =
            zombies.length - 1;

            i >= 0;

            i--
        ) {

            const zombie =
                zombies[i];


            if (!zombie.element.isConnected) {

                continue;

            }


            const zombieRect =
                zombie.element
                .getBoundingClientRect();


            const bulletRect =
                bullet
                .getBoundingClientRect();


            if (

                bulletRect.left <
                zombieRect.right &&

                bulletRect.right >
                zombieRect.left &&

                bulletRect.top <
                zombieRect.bottom &&

                bulletRect.bottom >
                zombieRect.top

            ) {


                damageZombie(
                    zombie,
                    bulletDamage
                );


                bullet.remove();

                return;

            }

        }


        // AUSSERHALB

        if (

            bulletX < -20 ||

            bulletX > game.clientWidth + 20 ||

            bulletY < -20 ||

            bulletY > game.clientHeight + 20

        ) {

            bullet.remove();

            return;

        }


        requestAnimationFrame(
            moveBullet
        );

    }


    moveBullet();

}


// ===============================
// ZOMBIE ERSTELLEN
// ===============================

function createZombie(type = "normal") {

    const zombieElement =
        document.createElement("div");


    zombieElement.classList.add(
        "zombie"
    );


    if (type !== "normal") {

        zombieElement.classList.add(
            type
        );

    }


    zombieElement.innerHTML = `

        <div class="zombie-health">

            <div class="zombie-health-bar"></div>

        </div>

        <div class="zombie-head"></div>

        <div class="zombie-body"></div>

        <div class="zombie-arm left-zombie-arm"></div>

        <div class="zombie-arm right-zombie-arm"></div>

        <div class="zombie-leg left-zombie-leg"></div>

        <div class="zombie-leg right-zombie-leg"></div>

    `;


    let health = 3;

    let speed = 1;

    let damage = 5;

    let reward = 25;

    let points = 100;


    // FAST

    if (type === "fast") {

        health = 2;

        speed = 2.2;

        damage = 4;

        reward = 35;

        points = 150;

    }


    // TANK

    if (type === "tank") {

        health = 10;

        speed = 0.6;

        damage = 8;

        reward = 70;

        points = 300;

    }


    // BOSS

    if (type === "boss") {

        health = 50;

        speed = 0.7;

        damage = 12;

        reward = 500;

        points = 2000;

    }


    const spawnRight =
        Math.random() > 0.5;


    let x =
        spawnRight

        ? game.clientWidth - 50

        : 10;


    const groundY =
        game.clientHeight - 115;


    const zombie = {

        element:
            zombieElement,

        x:
            x,

        y:
            groundY,

        health:
            health,

        maxHealth:
            health,

        speed:
            speed,

        damage:
            damage,

        reward:
            reward,

        points:
            points,

        type:
            type,

        attackCooldown:
            false

    };


    zombieElement.style.left =
        zombie.x + "px";

    zombieElement.style.top =
        zombie.y + "px";


    game.appendChild(
        zombieElement
    );


    zombies.push(
        zombie
    );

}


// ===============================
// ZOMBIE SCHADEN
// ===============================

function damageZombie(
    zombie,
    damage
) {

    zombie.health -= damage;


    // TREFFER EFFEKT

    createHitEffect(
        zombie.x + 20,
        zombie.y + 30
    );


    // LEBENSBALKEN

    const healthBar =
        zombie.element.querySelector(
            ".zombie-health-bar"
        );


    if (healthBar) {

        const percentage =

            Math.max(
                0,

                zombie.health /
                zombie.maxHealth *
                100
            );


        healthBar.style.width =
            percentage + "%";

    }


    // TOT

    if (
        zombie.health <= 0
    ) {

        killZombie(zombie);

    }

}


// ===============================
// ZOMBIE TÖTEN
// ===============================

function killZombie(zombie) {

    const index =
        zombies.indexOf(zombie);


    if (index !== -1) {

        zombies.splice(
            index,
            1
        );

    }


    zombie.element.remove();


    // PUNKTE

    score +=
        zombie.points;


    // GELD

    let earnedMoney =
        zombie.reward;


    if (doubleMoneyActive) {

        earnedMoney *= 2;

    }


    money +=
        earnedMoney;


    // POWER UP CHANCE

    if (
        Math.random() < 0.20
    ) {

        spawnPowerup(
            zombie.x,
            zombie.y
        );

    }


    updateHUD();

}


// ===============================
// TREFFER EFFEKT
// ===============================

function createHitEffect(
    x,
    y
) {

    const effect =
        document.createElement("div");


    effect.classList.add(
        "hit-effect"
    );


    effect.style.left =
        x + "px";

    effect.style.top =
        y + "px";


    game.appendChild(
        effect
    );


    setTimeout(() => {

        effect.remove();

    }, 300);

}


// ===============================
// POWER UP
// ===============================

function spawnPowerup(
    x,
    y
) {

    const powerups = [

        {
            type: "health",
            icon: "❤️"
        },

        {
            type: "money",
            icon: "💰"
        },

        {
            type: "rapid",
            icon: "🔥"
        },

        {
            type: "speed",
            icon: "⚡"
        }

    ];


    const powerupData =

        powerups[
            Math.floor(
                Math.random()
                * powerups.length
            )
        ];


    const powerup =
        document.createElement("div");


    powerup.classList.add(
        "powerup"
    );


    powerup.textContent =
        powerupData.icon;


    powerup.style.left =
        x + "px";

    powerup.style.top =
        y + "px";


    game.appendChild(
        powerup
    );


    const powerupObject = {

        element:
            powerup,

        x:
            x,

        y:
            y,

        type:
            powerupData.type

    };


    function checkPickup() {

        if (
            gameIsOver ||
            !powerup.isConnected
        ) {

            return;

        }


        const distance =

            Math.abs(
                powerupObject.x -
                playerX
            );


        if (
            distance < 45
        ) {

            collectPowerup(
                powerupObject
            );

            return;

        }


        requestAnimationFrame(
            checkPickup
        );

    }


    checkPickup();


    // VERSCHWINDET

    setTimeout(() => {

        if (
            powerup.isConnected
        ) {

            powerup.remove();

        }

    }, 8000);

}


// ===============================
// POWER UP EINSAMMELN
// ===============================

function collectPowerup(powerup) {

    powerup.element.remove();


    // HEILUNG

    if (
        powerup.type ===
        "health"
    ) {

        playerHealth =
            Math.min(
                100,
                playerHealth + 25
            );

    }


    // GELD

    if (
        powerup.type ===
        "money"
    ) {

        money += 100;

    }


    // SCHNELLFEUER

    if (
        powerup.type ===
        "rapid"
    ) {

        rapidFireActive = true;


        setTimeout(() => {

            rapidFireActive =
                false;

        }, 8000);

    }


    // SPEED

    if (
        powerup.type ===
        "speed"
    ) {

        speedBoostActive = true;

        playerSpeed = 9;


        setTimeout(() => {

            speedBoostActive =
                false;

            playerSpeed = 5;

        }, 8000);

    }


    updateHUD();

}


// ===============================
// GRANATE
// ===============================

function throwGrenade() {

    if (

        gameIsOver ||

        !waveActive ||

        grenadeCooldown ||

        grenades <= 0

    ) {

        return;

    }


    grenadeCooldown =
        true;


    grenades--;


    updateHUD();


    const grenade =
        document.createElement("div");


    grenade.classList.add(
        "grenade"
    );


    let grenadeX =
        playerX + 20;

    let grenadeY =
        playerY + 30;


    grenade.style.left =
        grenadeX + "px";

    grenade.style.top =
        grenadeY + "px";


    game.appendChild(
        grenade
    );


    const dx =
        mouseGameX -
        grenadeX;

    const dy =
        mouseGameY -
        grenadeY;


    const distance =

        Math.sqrt(

            dx * dx +

            dy * dy

        );


    const directionX =
        dx / distance;

    const directionY =
        dy / distance;


    let time = 0;


    function moveGrenade() {

        time++;


        grenadeX +=
            directionX * 8;

        grenadeY +=
            directionY * 8;


        grenade.style.left =
            grenadeX + "px";

        grenade.style.top =
            grenadeY + "px";


        if (
            time < 45
        ) {

            requestAnimationFrame(
                moveGrenade
            );

        }

        else {

            grenade.remove();

            explode(
                grenadeX,
                grenadeY
            );

        }

    }


    moveGrenade();


    setTimeout(() => {

        grenadeCooldown =
            false;

    }, 800);

}


// ===============================
// EXPLOSION
// ===============================

function explode(
    x,
    y
) {

    const explosion =
        document.createElement("div");


    explosion.classList.add(
        "explosion"
    );


    explosion.style.left =
        x + "px";

    explosion.style.top =
        y + "px";


    game.appendChild(
        explosion
    );


    const radius = 150;


    // ZOMBIES TREFFEN

    for (
        let i =
        zombies.length - 1;

        i >= 0;

        i--
    ) {

        const zombie =
            zombies[i];


        const distance =

            Math.sqrt(

                Math.pow(
                    zombie.x - x,
                    2
                )

                +

                Math.pow(
                    zombie.y - y,
                    2
                )

            );


        if (
            distance < radius
        ) {

            damageZombie(
                zombie,
                8
            );

        }

    }


    setTimeout(() => {

        explosion.remove();

    }, 400);

}


// ===============================
// NACHLADEN
// ===============================

function reloadWeapon() {

    const weapon =
        getWeapon();


    if (

        isReloading ||

        weapon.ammo ===
        weapon.maxAmmo

    ) {

        return;

    }


    isReloading =
        true;


    weaponNameDisplay.textContent =
        "Lädt...";


    setTimeout(() => {

        weapon.ammo =
            weapon.maxAmmo;


        isReloading =
            false;


        updateHUD();

    }, weapon.reloadTime);

}


// ===============================
// SHOP
// ===============================

function openShop() {

    waveActive =
        false;


    shopMoney.textContent =
        money;


    shopScreen.style.display =
        "flex";

}


// ===============================
// WEITER
// ===============================

function continueGame() {

    shopScreen.style.display =
        "none";


    wave++;


    waveDisplay.textContent =
        wave;


    zombiesSpawned =
        0;


    // MEHR ZOMBIES

    zombiesToSpawn =
        5 + wave * 3;


    bossWave =
        wave % 5 === 0;


    waveActive =
        true;


    // BOSS WARNUNG

    if (bossWave) {

        showBossWarning();

    }

}


// ===============================
// MEDKIT
// ===============================

function buyMedkit() {

    if (
        money < 100
    ) {

        return;

    }


    money -= 100;


    playerHealth =
        Math.min(
            100,
            playerHealth + 30
        );


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// MUNITION
// ===============================

function buyAmmo() {

    if (
        money < 50
    ) {

        return;

    }


    money -= 50;


    const weapon =
        getWeapon();


    weapon.ammo =
        weapon.maxAmmo;


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// SHOTGUN KAUFEN
// ===============================

function buyShotgun() {

    if (
        shotgunOwned ||
        money < 300
    ) {

        return;

    }


    money -= 300;


    shotgunOwned =
        true;


    currentWeapon =
        "shotgun";


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// MASCHINENPISTOLE
// ===============================

function buyMachinegun() {

    if (
        machinegunOwned ||
        money < 500
    ) {

        return;

    }


    money -= 500;


    machinegunOwned =
        true;


    currentWeapon =
        "machinegun";


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// GRANATE KAUFEN
// ===============================

function buyGrenade() {

    if (
        money < 150
    ) {

        return;

    }


    money -= 150;


    grenades++;


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// BOSS WARNUNG
// ===============================

function showBossWarning() {

    bossWarning.style.display =
        "block";


    setTimeout(() => {

        bossWarning.style.display =
            "none";

    }, 2500);

}


// ===============================
// SPIELER SCHADEN
// ===============================

function damagePlayer(
    damage
) {

    if (
        gameIsOver
    ) {

        return;

    }


    playerHealth -=
        damage;


    if (
        playerHealth < 0
    ) {

        playerHealth = 0;

    }


    updateHUD();


    if (
        playerHealth <= 0
    ) {

        gameOver();

    }

}


// ===============================
// GAME OVER
// ===============================

let gameIsOver =
    false;


function gameOver() {

    if (
        gameIsOver
    ) {

        return;

    }


    gameIsOver =
        true;


    document.getElementById(
        "finalScore"
    ).textContent =
        score;


    document.getElementById(
        "finalWave"
    ).textContent =
        wave;


    gameOverScreen.style.display =
        "flex";

}


// ===============================
// NEUSTART
// ===============================

function restartGame() {

    location.reload();

}


// ===============================
// HAUPTSPIEL
// ===============================

function update() {


    if (
        gameIsOver
    ) {

        return;

    }


    // ===============================
    // SPIELER BEWEGUNG
    // ===============================

    if (
        keys["a"]
    ) {

        playerX -=
            playerSpeed;

    }


    if (
        keys["d"]
    ) {

        playerX +=
            playerSpeed;

    }


    // GRENZEN

    if (
        playerX < 0
    ) {

        playerX = 0;

    }


    if (
        playerX >
        game.clientWidth - 40
    ) {

        playerX =
            game.clientWidth - 40;

    }


    // SCHWERKRAFT

    velocityY +=
        gravity;


    playerY +=
        velocityY;


    const groundY =
        game.clientHeight - 115;


    if (
        playerY >=
        groundY
    ) {

        playerY =
            groundY;


        velocityY =
            0;


        jumping =
            false;

    }


    // SPIELER POSITION

    player.style.left =
        playerX + "px";

    player.style.top =
        playerY + "px";


    // ===============================
    // MASCHINENGEWEHR DAUERFEUER
    // ===============================

    if (

        mouseDown &&

        currentWeapon ===
        "machinegun"

    ) {

        shoot();

    }


    // ===============================
    // ZOMBIES SPAWNEN
    // ===============================

    if (

        waveActive &&

        zombiesSpawned <
        zombiesToSpawn

    ) {

        const now =
            Date.now();


        if (

            now -
            zombieSpawnTimer >

            zombieSpawnDelay

        ) {


            let type =
                "normal";


            // BOSS

            if (

                bossWave &&

                zombiesSpawned === 0

            ) {

                type =
                    "boss";

            }


            // NORMALE ZOMBIE TYPEN

            else {

                const random =
                    Math.random();


                if (
                    random < 0.15
                ) {

                    type =
                        "fast";

                }

                else if (
                    random < 0.25
                ) {

                    type =
                        "tank";

                }

            }


            createZombie(
                type
            );


            zombiesSpawned++;


            zombieSpawnTimer =
                now;

        }

    }


    // ===============================
    // ZOMBIES BEWEGEN
    // ===============================

    for (
        let i =
        zombies.length - 1;

        i >= 0;

        i--
    ) {

        const zombie =
            zombies[i];


        // ZUM SPIELER

        if (
            zombie.x >
            playerX
        ) {

            zombie.x -=
                zombie.speed;

        }

        else {

            zombie.x +=
                zombie.speed;

        }


        zombie.element.style.left =
            zombie.x + "px";


        // ANGRIFF

        const distance =

            Math.abs(

                zombie.x -
                playerX

            );


        if (

            distance < 35 &&

            !zombie.attackCooldown

        ) {

            zombie.attackCooldown =
                true;


            damagePlayer(
                zombie.damage
            );


            setTimeout(() => {

                zombie.attackCooldown =
                    false;

            }, 1200);

        }

    }


    // ===============================
    // WELLE BEENDET
    // ===============================

    if (

        waveActive &&

        zombiesSpawned >=
        zombiesToSpawn &&

        zombies.length === 0

    ) {

        openShop();

    }


    requestAnimationFrame(
        update
    );

}


// ===============================
// STARTPOSITION
// ===============================

function setStartPosition() {

    playerX =
        game.clientWidth / 2;


    playerY =
        game.clientHeight - 115;


    player.style.left =
        playerX + "px";


    player.style.top =
        playerY + "px";

}


// ===============================
// START
// ===============================

window.addEventListener(
    "load",

    () => {

        setStartPosition();

        updateHUD();

        zombieSpawnTimer =
            Date.now();

        update();

    }

);