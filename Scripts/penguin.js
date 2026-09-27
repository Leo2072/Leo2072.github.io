function setDarkness(element, darknessValue)
{
    element.style.setProperty("--game-darkness", darknessValue.toString());
}

class Penguin extends Mole
{
    constructor(parent = null)
    {
        super("penguin", parent);
        this.isAsleep = true;
    }

    onHit()
    {
        if (this.isAsleep && !this.hasUsedOnHitSpecial)
        {
            this.isAsleep = false;
            this.hasUsedOnHitSpecial = true;
            this.playAnimation("action");
            return;
        }
        super.onHit();
    }
}