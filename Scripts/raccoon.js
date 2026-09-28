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

        // if visible, play the action gif as a warning; if furred, swap silently so the player doesn't notice
        if (!fromHole.isFurred)
        {
            fromHole.visualElement.src = "";
            fromHole.visualElement.src = "Sprites/Raccoon/raccoon_action.gif";
        }
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
