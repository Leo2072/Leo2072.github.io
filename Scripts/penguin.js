class Penguin extends Mole
{
    constructor(parent = null)
    {
        super("penguin", parent);
    }
}


function setDarkness(element, darknessValue)
{
    element.style.setProperty("--game-darkness", darknessValue.toString());
}