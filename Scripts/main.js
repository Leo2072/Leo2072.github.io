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