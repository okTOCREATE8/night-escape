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

const grenadeDisplay =
    document.getElementById("grenades");

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
// GRANATEN
// ===============================

let grenades = 3;


// ===============================
// WAFFEN
// ===============================

let currentWeapon = "pistol";

let shotgunOwned = false;

let machinegunOwned = false;


// ===============================
// PISTOLE
// ===============================

const pistol = {

    name: "Pistole",

    damage: 1,

    ammo: 12,

    maxAmmo: 12,

    reloadTime: 1200,

    fireRate: 350

};


// ===============================
// MAGAZIN UPGRADES
// ===============================

let magazineUpgradeLevel = 0;

const magazineUpgrades = [

    {
        maxAmmo: 12,
        price: 0
    },

    {
        maxAmmo: 15,
        price: 150
    },

    {
        maxAmmo: 20,
        price: 250
    },

    {
        maxAmmo: 24,
        price: 400
    },

    {
        maxAmmo: 28,
        price: 600
    }

];


// ===============================
// SHOTGUN
// ===============================

const shotgun = {

    name: "Shotgun",

    damage: 1,

    ammo: 6,

    maxAmmo: 6,

    reloadTime: 1500,

    fireRate: 800

};


// ===============================
// MASCHINENPISTOLE
// ===============================

const machinegun = {

    name: "Maschinenpistole",

    damage: 1,

    ammo: 30,

    maxAmmo: 30,

    reloadTime: 1800,

    fireRate: 100

};


// ===============================
// WAFFE HOLEN
// ===============================

function getWeapon() {

    if (
        currentWeapon === "shotgun"
    ) {

        return shotgun;

    }


    if (
        currentWeapon === "machinegun"
    ) {

        return machinegun;

    }


    return pistol;

}


// ===============================
// SPIELSTATUS
// ===============================

let gameIsOver = false;

let gameRunning = true;


// ===============================
// MAUS
// ===============================

let mouseX = 0;

let mouseY = 0;

let mouseDown = false;

let lastShotTime = 0;


// ===============================
// TASTATUR
// ===============================

const keys = {};


// ===============================
// ZOMBIES
// ===============================

let zombies = [];

let zombiesSpawned = 0;

let zombiesToSpawn = 0;

let zombieSpawnTimer = 0;

let zombieSpawnDelay = 1000;


// ===============================
// WELLEN
// ===============================

let wave = 1;

let waveActive = false;

let bossWave = false;


// ===============================
// HUD AKTUALISIEREN
// ===============================

function updateHUD() {

    const weapon =
        getWeapon();


    healthDisplay.textContent =
        Math.floor(playerHealth);


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
// SPIEL STARTEN
// ===============================

function startGame() {

    waveActive = true;

    zombiesSpawned = 0;

    zombiesToSpawn =
        5 + wave * 3;

}


// ===============================
// MAUS BEWEGUNG
// ===============================

game.addEventListener(

    "mousemove",

    (event) => {

        const rect =
            game.getBoundingClientRect();


        mouseX =
            event.clientX - rect.left;


        mouseY =
            event.clientY - rect.top;


        crosshair.style.left =
            mouseX + "px";


        crosshair.style.top =
            mouseY + "px";


        rotateGun();

    }

);


// ===============================
// WAFFE DREHEN
// ===============================

function rotateGun() {

    const playerCenterX =
        playerX + 20;


    const playerCenterY =
        playerY + 40;


    const deltaX =
        mouseX - playerCenterX;


    const deltaY =
        mouseY - playerCenterY;


    let angle =
        Math.atan2(
            deltaY,
            deltaX
        ) *
        180 /
        Math.PI;


    gun.style.transform =
        `rotate(${angle}deg)`;

}


// ===============================
// MAUSTASTE GEDRÜCKT
// ===============================

game.addEventListener(

    "mousedown",

    (event) => {

        if (
            event.button === 0
        ) {

            mouseDown = true;

            shoot();

        }

    }

);


// ===============================
// MAUSTASTE LOSGELASSEN
// ===============================

window.addEventListener(

    "mouseup",

    (event) => {

        if (
            event.button === 0
        ) {

            mouseDown = false;

        }

    }

);


// ===============================
// TASTEN GEDRÜCKT
// ===============================

window.addEventListener(

    "keydown",

    (event) => {

        const key =
            event.key.toLowerCase();


        keys[key] = true;


        // ===============================
        // SPRINGEN
        // ===============================

        if (

            event.code === "Space" &&

            !jumping

        ) {

            velocityY =
                -15;


            jumping = true;

        }


        // ===============================
        // NACHLADEN
        // ===============================

        if (
            key === "r"
        ) {

            reloadWeapon();

        }


        // ===============================
        // WAFFEN WECHSELN
        // ===============================

        if (
            key === "1"
        ) {

            currentWeapon =
                "pistol";


            updateHUD();

        }


        if (

            key === "2" &&

            shotgunOwned

        ) {

            currentWeapon =
                "shotgun";


            updateHUD();

        }


        if (

            key === "3" &&

            machinegunOwned

        ) {

            currentWeapon =
                "machinegun";


            updateHUD();

        }


        // ===============================
        // GRANATE
        // ===============================

        if (
            key === "g"
        ) {

            throwGrenade();

        }

    }

);


// ===============================
// TASTE LOSGELASSEN
// ===============================

window.addEventListener(

    "keyup",

    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }

);


// ===============================
// NACHLADEN
// ===============================

let reloading = false;

function reloadWeapon() {

    if (
        reloading
    ) {

        return;

    }


    const weapon =
        getWeapon();


    if (

        weapon.ammo >=
        weapon.maxAmmo

    ) {

        return;

    }


    reloading = true;


    setTimeout(

        () => {

            weapon.ammo =
                weapon.maxAmmo;


            reloading = false;


            updateHUD();

        },

        weapon.reloadTime

    );

}


// ===============================
// SCHIESSEN
// ===============================

function shoot() {

    if (

        gameIsOver ||

        reloading

    ) {

        return;

    }


    const weapon =
        getWeapon();


    const now =
        Date.now();


    if (

        now -

        lastShotTime <

        weapon.fireRate

    ) {

        return;

    }


    if (
        weapon.ammo <= 0
    ) {

        return;

    }


    lastShotTime =
        now;


    weapon.ammo--;


    updateHUD();


    showMuzzleFlash();


    if (
        currentWeapon ===
        "shotgun"
    ) {

        shootShotgun();

    }

    else {

        createBullet();

    }

}


// ===============================
// MÜNDUNGSFEUER
// ===============================

function showMuzzleFlash() {

    muzzleFlash.style.display =
        "block";


    setTimeout(

        () => {

            muzzleFlash.style.display =
                "none";

        },

        60

    );

}
// ===============================
// KUGEL ERSTELLEN
// ===============================

function createBullet() {

    const bullet =
        document.createElement("div");

    bullet.classList.add(
        "bullet"
    );


    const startX =
        playerX + 35;


    const startY =
        playerY + 40;


    bullet.style.left =
        startX + "px";


    bullet.style.top =
        startY + "px";


    game.appendChild(
        bullet
    );


    const deltaX =
        mouseX - startX;


    const deltaY =
        mouseY - startY;


    const distance =
        Math.sqrt(

            deltaX * deltaX +

            deltaY * deltaY

        );


    const speed =
        15;


    const velocityX =
        (deltaX / distance) *
        speed;


    const bulletVelocityY =
        (deltaY / distance) *
        speed;


    const bulletInterval =
        setInterval(

            () => {

                const bulletX =
                    parseFloat(
                        bullet.style.left
                    );


                const bulletY =
                    parseFloat(
                        bullet.style.top
                    );


                bullet.style.left =
                    bulletX +
                    velocityX +
                    "px";


                bullet.style.top =
                    bulletY +
                    bulletVelocityY +
                    "px";


                // ===============================
                // ZOMBIE TREFFER
                // ===============================

                for (

                    let i =
                        zombies.length - 1;

                    i >= 0;

                    i--

                ) {

                    const zombie =
                        zombies[i];


                    const zombieRect =
                        zombie.element.getBoundingClientRect();


                    const bulletRect =
                        bullet.getBoundingClientRect();


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
                            getWeapon().damage
                        );


                        bullet.remove();


                        clearInterval(
                            bulletInterval
                        );


                        return;

                    }

                }


                // ===============================
                // KUGEL AUS DEM SPIELFELD
                // ===============================

                if (

                    bulletX < -50 ||

                    bulletX > 1250 ||

                    bulletY < -50 ||

                    bulletY > 700

                ) {

                    bullet.remove();


                    clearInterval(
                        bulletInterval
                    );

                }

            },

            16

        );

}


// ===============================
// SHOTGUN SCHUSS
// ===============================

function shootShotgun() {

    const originalMouseX =
        mouseX;

    const originalMouseY =
        mouseY;


    // 5 Kugeln gleichzeitig

    for (

        let i = -2;

        i <= 2;

        i++

    ) {

        const spread =
            i * 25;


        mouseX =
            originalMouseX +
            spread;


        mouseY =
            originalMouseY +
            spread * 0.3;


        createBullet();

    }


    mouseX =
        originalMouseX;


    mouseY =
        originalMouseY;

}


// ===============================
// ZOMBIE ERSTELLEN
// ===============================

function spawnZombie() {

    const zombieElement =
        document.createElement("div");


    zombieElement.classList.add(
        "zombie"
    );


    let type =
        "normal";


    // ===============================
    // ZOMBIE ARTEN
    // ===============================

    const random =
        Math.random();


    if (

        bossWave &&

        zombiesSpawned === 0

    ) {

        type =
            "boss";

    }

    else if (

        wave >= 3 &&

        random < 0.15

    ) {

        type =
            "fast";

    }

    else if (

        wave >= 5 &&

        random < 0.12

    ) {

        type =
            "tank";

    }


    zombieElement.classList.add(
        type
    );


    // ===============================
    // ZOMBIE HTML
    // ===============================

    zombieElement.innerHTML = `

        <div class="zombie-health">

            <div
                class="zombie-health-bar"
            ></div>

        </div>

        <div class="zombie-head"></div>

        <div class="zombie-body"></div>

        <div
            class="zombie-arm
            left-zombie-arm"
        ></div>

        <div
            class="zombie-arm
            right-zombie-arm"
        ></div>

        <div
            class="zombie-leg
            left-zombie-leg"
        ></div>

        <div
            class="zombie-leg
            right-zombie-leg"
        ></div>

    `;


    let health =
        3;

    let speed =
        0.7;

    let damage =
        2;

    let reward =
        20;


    // ===============================
    // SCHNELLER ZOMBIE
    // ===============================

    if (
        type === "fast"
    ) {

        health =
            2;


        speed =
            1.5;


        damage =
            1.5;


        reward =
            30;

    }


    // ===============================
    // TANK ZOMBIE
    // ===============================

    if (
        type === "tank"
    ) {

        health =
            10;


        speed =
            0.45;


        damage =
            3;


        reward =
            50;

    }


    // ===============================
    // BOSS
    // ===============================

    if (
        type === "boss"
    ) {

        health =
            50 + wave * 5;


        speed =
            0.35;


        damage =
            5;


        reward =
            300;

    }


    const side =
        Math.random() < 0.5
            ? "left"
            : "right";


    let zombieX;


    if (
        side === "left"
    ) {

        zombieX =
            -50;

    }

    else {

        zombieX =
            game.clientWidth + 50;

    }


    const zombieY =
        535;


    zombieElement.style.left =
        zombieX + "px";


    zombieElement.style.top =
        zombieY + "px";


    game.appendChild(
        zombieElement
    );


    const zombie = {

        element:
            zombieElement,

        x:
            zombieX,

        y:
            zombieY,

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

        type:
            type,

        lastAttack:
            0

    };


    zombies.push(
        zombie
    );


    zombiesSpawned++;

}


// ===============================
// ZOMBIE SCHADEN
// ===============================

function damageZombie(

    zombie,

    damage

) {

    zombie.health -=
        damage;


    updateZombieHealth(
        zombie
    );


    if (

        zombie.health <= 0

    ) {

        killZombie(
            zombie
        );

    }

}


// ===============================
// ZOMBIE LEBENSBALKEN
// ===============================

function updateZombieHealth(

    zombie

) {

    const healthBar =
        zombie.element.querySelector(
            ".zombie-health-bar"
        );


    if (
        !healthBar
    ) {

        return;

    }


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


// ===============================
// ZOMBIE TÖTEN
// ===============================

function killZombie(

    zombie

) {

    const index =
        zombies.indexOf(
            zombie
        );


    if (

        index !== -1

    ) {

        zombies.splice(
            index,
            1
        );

    }


    zombie.element.remove();


    score +=
        10;


    money +=
        zombie.reward;


    updateHUD();


    checkWaveComplete();

}


// ===============================
// WELLEN PRÜFEN
// ===============================

function checkWaveComplete() {

    if (

        zombies.length === 0 &&

        zombiesSpawned >=
        zombiesToSpawn &&

        waveActive

    ) {

        waveActive =
            false;


        openShop();

    }

}


// ===============================
// ZOMBIES BEWEGEN
// ===============================

function updateZombies() {

    zombies.forEach(

        (zombie) => {

            const playerCenterX =
                playerX + 20;


            const zombieCenterX =
                zombie.x + 20;


            // ===============================
            // ZOMBIE ZUM SPIELER
            // ===============================

            if (

                zombieCenterX <
                playerCenterX

            ) {

                zombie.x +=
                    zombie.speed;

            }

            else {

                zombie.x -=
                    zombie.speed;

            }


            zombie.element.style.left =
                zombie.x +
                "px";


            // ===============================
            // SPIELER ANGREIFEN
            // ===============================

            const distance =

                Math.abs(

                    zombieCenterX -

                    playerCenterX

                );


            if (

                distance < 45

            ) {

                const now =
                    Date.now();


                if (

                    now -

                    zombie.lastAttack >

                    900

                ) {

                    playerHealth -=
                        zombie.damage;


                    zombie.lastAttack =
                        now;


                    if (

                        playerHealth < 0

                    ) {

                        playerHealth =
                            0;

                    }


                    updateHUD();


                    if (

                        playerHealth <= 0

                    ) {

                        gameOver();

                    }

                }

            }

        }

    );

}
// ===============================
// GRANATE WERFEN
// ===============================

function throwGrenade() {

    if (

        gameIsOver ||

        !gameRunning ||

        grenades <= 0

    ) {

        return;

    }


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


    const deltaX =
        mouseX - grenadeX;


    const deltaY =
        mouseY - grenadeY;


    const distance =
        Math.sqrt(

            deltaX * deltaX +

            deltaY * deltaY

        );


    const speed =
        9;


    const velocityX =
        (deltaX / distance) *
        speed;


    const velocityY =
        (deltaY / distance) *
        speed;


    let time =
        0;


    const grenadeInterval =
        setInterval(

            () => {

                time++;


                grenadeX +=
                    velocityX;


                grenadeY +=
                    velocityY +
                    time * 0.15;


                grenade.style.left =
                    grenadeX + "px";


                grenade.style.top =
                    grenadeY + "px";


                if (

                    time > 35 ||

                    grenadeX < 0 ||

                    grenadeX > game.clientWidth ||

                    grenadeY > game.clientHeight - 35

                ) {

                    clearInterval(
                        grenadeInterval
                    );


                    explodeGrenade(

                        grenadeX,

                        grenadeY,

                        grenade

                    );

                }

            },

            16

        );

}


// ===============================
// GRANATE EXPLOSION
// ===============================

function explodeGrenade(

    x,

    y,

    grenade

) {

    if (
        grenade
    ) {

        grenade.remove();

    }


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


    setTimeout(

        () => {

            explosion.remove();

        },

        400

    );


    const radius =
        160;


    // Zombies im Radius töten

    [...zombies].forEach(

        (zombie) => {

            const zombieCenterX =
                zombie.x + 20;


            const zombieCenterY =
                zombie.y + 40;


            const distance =
                Math.sqrt(

                    Math.pow(

                        zombieCenterX - x,

                        2

                    )

                    +

                    Math.pow(

                        zombieCenterY - y,

                        2

                    )

                );


            if (

                distance <= radius

            ) {

                damageZombie(

                    zombie,

                    999

                );

            }

        }

    );

}


// ===============================
// SHOP ÖFFNEN
// ===============================

function openShop() {

    gameRunning =
        false;


    shopMoney.textContent =
        money;


    updateMagazineUpgradeButton();


    shopScreen.style.display =
        "flex";

}


// ===============================
// SHOP SCHLIESSEN
// ===============================

function continueGame() {

    shopScreen.style.display =
        "none";


    wave++;


    waveDisplay.textContent =
        wave;


    gameRunning =
        true;


    // Boss alle 5 Wellen

    bossWave =
        wave % 5 === 0;


    if (

        bossWave

    ) {

        showBossWarning();

    }


    setTimeout(

        () => {

            startGame();

        },

        bossWave

            ? 2000

            : 300

    );

}


// ===============================
// BOSS WARNUNG
// ===============================

function showBossWarning() {

    if (
        !bossWarning
    ) {

        return;

    }


    bossWarning.style.display =
        "block";


    setTimeout(

        () => {

            bossWarning.style.display =
                "none";

        },

        1800

    );

}


// ===============================
// MEDKIT KAUFEN
// ===============================

function buyMedkit() {

    const price =
        100;


    if (

        money < price

    ) {

        return;

    }


    if (

        playerHealth >= 100

    ) {

        return;

    }


    money -=
        price;


    playerHealth +=
        30;


    if (

        playerHealth > 100

    ) {

        playerHealth =
            100;

    }


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// SHOTGUN KAUFEN
// ===============================

function buyShotgun() {

    const price =
        300;


    if (

        shotgunOwned ||

        money < price

    ) {

        return;

    }


    money -=
        price;


    shotgunOwned =
        true;


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// MASCHINENPISTOLE KAUFEN
// ===============================

function buyMachinegun() {

    const price =
        500;


    if (

        machinegunOwned ||

        money < price

    ) {

        return;

    }


    money -=
        price;


    machinegunOwned =
        true;


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// GRANATE KAUFEN
// ===============================

function buyGrenade() {

    const price =
        150;


    if (

        money < price

    ) {

        return;

    }


    money -=
        price;


    grenades++;


    updateHUD();


    shopMoney.textContent =
        money;

}


// ===============================
// MAGAZIN UPGRADE KAUFEN
// ===============================

function buyMagazineUpgrade() {

    if (

        magazineUpgradeLevel >= 4

    ) {

        return;

    }


    const nextUpgrade =

        magazineUpgrades[
            magazineUpgradeLevel + 1
        ];


    if (

        money <

        nextUpgrade.price

    ) {

        return;

    }


    money -=

        nextUpgrade.price;


    magazineUpgradeLevel++;


    pistol.maxAmmo =

        magazineUpgrades[
            magazineUpgradeLevel
        ].maxAmmo;


    // Magazin direkt auffüllen

    pistol.ammo =
        pistol.maxAmmo;


    updateHUD();


    shopMoney.textContent =
        money;


    updateMagazineUpgradeButton();

}


// ===============================
// MAGAZIN BUTTON TEXT
// ===============================

function updateMagazineUpgradeButton() {

    const upgradeText =
        document.getElementById(

            "magazineUpgradeText"

        );


    if (
        !upgradeText
    ) {

        return;

    }


    if (

        magazineUpgradeLevel >= 4

    ) {

        upgradeText.innerHTML =
            "🏆 MAXIMAL: 28 Schuss";

        return;

    }


    const nextUpgrade =

        magazineUpgrades[
            magazineUpgradeLevel + 1
        ];


    upgradeText.innerHTML =

        `⬆️ Upgrade ${magazineUpgradeLevel + 1}

        <br>

        🔫 ${nextUpgrade.maxAmmo} Schuss

        <br>

        💰 ${nextUpgrade.price}`;

}


// ===============================
// SPIELER BEWEGEN
// ===============================

function updatePlayer() {

    if (

        !gameRunning ||

        gameIsOver

    ) {

        return;

    }


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


    // Grenzen

    if (

        playerX < 0

    ) {

        playerX =
            0;

    }


    if (

        playerX >

        game.clientWidth - 40

    ) {

        playerX =

            game.clientWidth -

            40;

    }


    // Springen

    playerY +=
        velocityY;


    velocityY +=
        gravity;


    const groundY =
        game.clientHeight - 115;


    if (

        playerY >= groundY

    ) {

        playerY =
            groundY;


        velocityY =
            0;


        jumping =
            false;

    }


    player.style.left =
        playerX + "px";


    player.style.top =
        playerY + "px";

}


// ===============================
// ZOMBIES SPAWNEN
// ===============================

function updateZombieSpawning() {

    if (

        !waveActive ||

        !gameRunning ||

        gameIsOver

    ) {

        return;

    }


    if (

        zombiesSpawned >=

        zombiesToSpawn

    ) {

        return;

    }


    const now =
        Date.now();


    if (

        now -

        zombieSpawnTimer >=

        zombieSpawnDelay

    ) {

        spawnZombie();


        zombieSpawnTimer =
            now;

    }

}
// ===============================
// DAUERFEUER
// ===============================

function updateAutomaticFire() {

    if (

        !mouseDown ||

        gameIsOver ||

        !gameRunning

    ) {

        return;

    }


    // Nur Maschinenpistole schießt automatisch

    if (

        currentWeapon === "machinegun"

    ) {

        shoot();

    }

}


// ===============================
// GAME OVER
// ===============================

function gameOver() {

    if (
        gameIsOver
    ) {

        return;

    }


    gameIsOver =
        true;


    gameRunning =
        false;


    waveActive =
        false;


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
// SPIEL NEUSTARTEN
// ===============================

function restartGame() {

    // Alte Zombies löschen

    zombies.forEach(

        (zombie) => {

            zombie.element.remove();

        }

    );


    zombies =
        [];


    // Spielwerte zurücksetzen

    playerHealth =
        100;


    score =
        0;


    money =
        0;


    wave =
        1;


    grenades =
        3;


    // Waffen zurücksetzen

    currentWeapon =
        "pistol";


    shotgunOwned =
        false;


    machinegunOwned =
        false;


    // Magazine zurücksetzen

    pistol.ammo =
        12;


    pistol.maxAmmo =
        12;


    shotgun.ammo =
        shotgun.maxAmmo;


    machinegun.ammo =
        machinegun.maxAmmo;


    // Magazin Upgrade zurücksetzen

    magazineUpgradeLevel =
        0;


    // Sonstige Werte

    zombiesSpawned =
        0;


    zombiesToSpawn =
        0;


    bossWave =
        false;


    jumping =
        false;


    velocityY =
        0;


    reloading =
        false;


    gameIsOver =
        false;


    gameRunning =
        true;


    waveActive =
        false;


    // Spieler zurücksetzen

    setStartPosition();


    // Anzeigen schließen

    gameOverScreen.style.display =
        "none";


    shopScreen.style.display =
        "none";


    // HUD aktualisieren

    updateHUD();


    updateMagazineUpgradeButton();


    // Neue Welle starten

    startGame();


    zombieSpawnTimer =
        Date.now();

}


// ===============================
// STARTPOSITION SPIELER
// ===============================

function setStartPosition() {

    playerX =
        game.clientWidth / 2 - 20;


    playerY =
        game.clientHeight - 115;


    player.style.left =
        playerX + "px";


    player.style.top =
        playerY + "px";

}


// ===============================
// HAUPT GAME LOOP
// ===============================

function update() {

    // Spieler bewegen

    updatePlayer();


    // Zombies bewegen

    if (

        gameRunning &&

        !gameIsOver

    ) {

        updateZombies();

    }


    // Neue Zombies erstellen

    updateZombieSpawning();


    // Dauerfeuer

    updateAutomaticFire();


    requestAnimationFrame(
        update
    );

}


// ===============================
// SPIEL STARTEN
// ===============================

window.addEventListener(

    "load",

    () => {

        setStartPosition();


        updateHUD();


        updateMagazineUpgradeButton();


        zombieSpawnTimer =
            Date.now();


        // Erste Welle starten

        startGame();


        // Game Loop starten

        update();

    }

);
