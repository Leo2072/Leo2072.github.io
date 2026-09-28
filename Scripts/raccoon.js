class Raccoon extends Mole
{
    constructor(parent = null)
    {
        super("raccoon", parent);
        this.swapTimer = null;
    }

    // trigger swap on hover only during the raccoon's required turn
    onHover()
    {
        if (this.hasUsedOnHitSpecial) return;
        if (animalNames[currentTarget] !== "raccoon") return;

        this.hasUsedOnHitSpecial = true;
        var fromHole = this.hole;
        var candidates = holes.filter(h => h !== fromHole && h.mole != null);
        if (candidates.length === 0) return;
        var toHole = randomItemFromArray(candidates);

        // play the action gif as a warning (hidden if he's under fur, so the swap is silent)
        fromHole.visualElement.src = "Sprites/Raccoon/raccoon_action.gif";
        this.swapTimer = setTimeout(() =>
        {
            fromHole.swapWith(toHole);
            holes.forEach(h => { if (h.mole instanceof Penguin && h.mole.isAsleep) h.mole.wake(); });
        }, 2850);
    }

    onDespawn()
    {
        clearTimeout(this.swapTimer);
    }

    onHit()
    {
        super.onHit();
    }
}
