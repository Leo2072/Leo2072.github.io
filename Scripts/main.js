randomiseTitleIcon()

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

var spriteBases = [
    "Sprites/Penguin/penguin",
    "Sprites/Raccoon/raccoon",
    null
];

var resetTimers = [null, null, null];

var correctDurations   = [1950, 1250, 1500];
var incorrectDurations = [3150, 2450, 2000];

function showSprite(index, state, ext, duration)
{
    if (spriteBases[index] == null) return;
    clearTimeout(resetTimers[index]);
    slots[index].querySelector("img").src = spriteBases[index] + "_" + state + "." + ext;
    resetTimers[index] = setTimeout(() => resetSprite(index), duration);
}

function resetSprite(index)
{
    if (spriteBases[index] == null) return;
    slots[index].querySelector("img").src = spriteBases[index] + "_idle.png";
}

var scoreEl = document.getElementById("score-display");
var targetEl = document.getElementById("target-display");
var timerEl = document.getElementById("timer-display");

function pickTarget()
{
    currentTarget = Math.floor(Math.random() * 3);
    targetEl.textContent = "Click: " + animalNames[currentTarget];
}

function onSlotClicked(index)
{
    if (timeLeft <= 0) return;

    if (index === currentTarget)
    {
        score++;
        scoreEl.textContent = "Score: " + score;
        showSprite(index, "correct", "gif", correctDurations[index]);
        pickTarget();
    }
    else
    {
        timeLeft = Math.max(0, timeLeft - 5);
        showSprite(index, "incorrect", "gif", incorrectDurations[index]);
    }
}

var slots = document.getElementsByClassName("game-slot");
slots[0].addEventListener("click", () => onSlotClicked(0));
slots[1].addEventListener("click", () => onSlotClicked(1));
slots[2].addEventListener("click", () => onSlotClicked(2));

pickTarget();

setInterval(() =>
{
    if (timeLeft > 0)
    {
        timeLeft -= 0.1;
        timerEl.textContent = "Time: " + Math.ceil(timeLeft);
    }
    else
    {
        targetEl.textContent = "Game over!";
    }
}, 100);