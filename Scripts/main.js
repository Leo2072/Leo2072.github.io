randomiseTitleIcon()


new Hole(0, processTreeRoot);
new Hole(1, processTreeRoot);
new Hole(2, processTreeRoot);


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

var scoreEl = document.getElementById("score-display");
var targetEl = document.getElementById("target-display");
var timerEl = document.getElementById("timer-display");

function updateDisplays()
{
    scoreEl.textContent = "Score: " + score;
    targetEl.textContent = "Click: " + animalNames[currentTarget];
    timerEl.textContent = "Time: " + Math.ceil(timeLeft);
}

updateDisplays();