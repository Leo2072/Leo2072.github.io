class Raccoon extends Mole
{
    constructor(parent = null)
    {
        super("raccoon", parent);
    }

    onHit()
    {
        if (!this.hasUsedOnHitSpecial)
        {
            var otherHole = randomItemFromArray(holes.filter((hole) => hole != this.hole && hole.mole != null));
            if (otherHole != null)
            {
                this.hasUsedOnHitSpecial = true;
                this.playAnimation("action");
                this.hole.swapWith(otherHole);
                return;
            }
        }
        super.onHit();
    }
}