randomiseTitleIcon()

startPerFrameProcessLoop();

new Hole(0, processTreeRoot, document.getElementsByClassName("game-slot")[0]);
new Hole(1, processTreeRoot, document.getElementsByClassName("game-slot")[1]);
new Hole(2, processTreeRoot, document.getElementsByClassName("game-slot")[2]);

var gameRootElement = document.getElementsByClassName("game-bound")[0];

var timeVal = 0;
setInterval(() =>
{
    timeVal += 0.06;
    var darknessValue = 0.5 + Math.sin(timeVal) * 0.5;
    setDarkness(gameRootElement, darknessValue);
}, 60);


// Game state
var score = 0;
var timeLeft = 30;
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
var timerElement = document.getElementById("timer-display");

// Choose a mole target
function pickTarget()
{
    var presentTypes = holes
        .filter((hole) => hole.mole != null && hole.mole.state !== MOLE_STATE_DESPAWNING)
        .map((hole) => hole.mole.type);

    var pool = presentTypes.length > 0 ? [...new Set(presentTypes)] : animalNames;

    var chosenType = randomItemFromArray(pool);
    currentTarget = animalNames.indexOf(chosenType);
    targetElement.textContent = "Click: " + animalNames[currentTarget];
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
    hole.slotElement.addEventListener("click", () =>
    {
        if (timeLeft <= 0 || hole.mole == null) return;

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
            hole.mole.onMiss();
        }
    });

    spawnMole(hole);
}

pickTarget();

function scheduleRaccoonWarn()
{
    setTimeout(() =>
    {
        if (timeLeft > 0)
        {
            showSprite(raccoonSlot, "action_warn", "png", 2500);
        }
        scheduleRaccoonWarn();
    }, 5000 + Math.random() * 5000);
}

scheduleRaccoonWarn();

setInterval(() =>
{
    if (timeLeft > 0)
    {
        timeLeft -= 0.1;
        timerElement.textContent = "Time: " + Math.ceil(timeLeft);
    }
    else
    {
        targetElement.textContent = "Game over!";
    }
}, 100);