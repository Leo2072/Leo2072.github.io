randomiseTitleIcon()

startPerFrameProcessLoop();

new Hole(0, processTreeRoot, document.getElementsByClassName("game-slot")[0]);
new Hole(1, processTreeRoot, document.getElementsByClassName("game-slot")[1]);
new Hole(2, processTreeRoot, document.getElementsByClassName("game-slot")[2]);

var gameRootElement = document.getElementsByClassName("game-bound")[0];

setDarkness(gameRootElement, 0);


// Game state
var score = 0;
var timeLeft = 60;
var currentTarget = 0;

var animalNames = ["penguin", "raccoon", "dog"];
var raccoonSlot = 1;

var moleClasses =
{
    penguin: Penguin,
    raccoon: Raccoon,
    dog: Dog
};

function spawnMole(hole)
{
    // Avoid spawning a type that's already active (and not itself despawning) in another hole.
    var usedTypes = holes
        .filter((h) => h !== hole && h.mole != null && h.mole.state !== MOLE_STATE_DESPAWNING)
        .map((h) => h.mole.type);
    var availableTypes = animalNames.filter((name) => !usedTypes.includes(name));
    var pool = availableTypes.length > 0 ? availableTypes : animalNames;

    var type = randomItemFromArray(pool);
    var mole = new moleClasses[type](processTreeRoot);
    mole.onExit = (exitedHole) => spawnMole(exitedHole);
    mole.spawn(hole);
}

var scoreElement = document.getElementById("score-display");
var targetElement = document.getElementById("target-display");
var targetIconElement = document.getElementById("target-icon");
var timerElement = document.getElementById("timer-display");

var animalIcons = {
    "penguin": "Sprites/penguin_title_icon.png",
    "raccoon": "Sprites/raccoon_title_icon.png",
    "dog":     "Sprites/Dog/dog_idle.png"
};

// briefly show a floating -5s indicator and flash the timer red when the player is penalized
function showPenalty()
{
    var el = document.createElement("div");
    el.className = "penalty-text";
    el.textContent = "-5s";
    document.body.appendChild(el);

    timerElement.classList.add("timer-penalty");
    setTimeout(() => timerElement.classList.remove("timer-penalty"), 300);
    setTimeout(() => el.remove(), 1000);
}

// Choose a mole target
function pickTarget()
{
    var presentTypes = holes
        .filter((hole) => hole.mole != null && hole.mole.state !== MOLE_STATE_DESPAWNING)
        .map((hole) => hole.mole.type);

    var pool = presentTypes.length > 0 ? [...new Set(presentTypes)] : animalNames;

    var chosenType = randomItemFromArray(pool);
    currentTarget = animalNames.indexOf(chosenType);
    targetIconElement.src = animalIcons[animalNames[currentTarget]];
    targetIconElement.style.display = "inline";

    // pulse the target display to signal a new target
    targetElement.classList.remove("target-changed");
    void targetElement.offsetWidth;
    targetElement.classList.add("target-changed");
}

// Despawn all moles and create new ones
function resetAllMoles()
{
    var occupiedHoles = holes.filter((hole) => hole.mole != null);

    if (occupiedHoles.length == 0)
    {
        pickTarget();
        return;
    }

    var pendingCount = occupiedHoles.length;

    for (let hole of occupiedHoles)
    {
        let originalOnExit = hole.mole.onExit;
        hole.mole.onExit = (exitedHole) =>
        {
            if (originalOnExit) originalOnExit(exitedHole);

            pendingCount--;
            if (pendingCount == 0)
            {
                pickTarget();
            }
        };
        hole.mole.despawn();
    }
}

for (let hole of holes)
{
    hole.slotElement.addEventListener("mouseenter", () =>
    {
        if (timeLeft <= 0 || hole.mole == null) return;
        hole.mole.onHover();
    });

    hole.slotElement.addEventListener("click", () =>
    {
        if (timeLeft <= 0 || hole.mole == null) return;
        if (hole.isFurred) return;

        // sleeping penguin wakes on any click with no penalty
        if (hole.mole instanceof Penguin && hole.mole.isAsleep)
        {
            hole.mole.onHit();
            return;
        }

        if (hole.mole.type == animalNames[currentTarget])
        {
            var hitMole = hole.mole;
            hitMole.onHit();

            // Only increase score if the mole is in a despawning state
            if (hitMole.state == MOLE_STATE_DESPAWNING)
            {
                score++;
                scoreElement.textContent = "Score: " + score;
                resetAllMoles();
            }
        }
        else
        {
            timeLeft = Math.max(0, timeLeft - 5);
            showPenalty();
            hole.mole.onMiss();
        }
    });

    spawnMole(hole);
}

pickTarget();


// stop everything on game over: mole movement, dog sneezes, raccoon swaps, penguin sleep and any playing gifs
function endGame()
{
    stopPerFrameProcessLoop();

    for (let hole of holes)
    {
        if (hole.isFurred)
            hole.visualElement.src = "Sprites/Dog/dog_fur_pile.png";

        var mole = hole.mole;
        if (mole == null) continue;

        clearTimeout(mole.resetTimer);
        mole.onDespawn();
        mole.playSprite("idle");
    }

    timerElement.textContent = "Time: 0";
    document.getElementById("target-label").textContent = "Game over!";
    targetIconElement.style.display = "none";
}

var gameTimer = setInterval(() =>
{
    timeLeft -= 0.1;
    timerElement.textContent = "Time: " + Math.ceil(timeLeft);

    if (timeLeft <= 0)
    {
        timeLeft = 0;
        clearInterval(gameTimer);
        endGame();
    }
}, 100);