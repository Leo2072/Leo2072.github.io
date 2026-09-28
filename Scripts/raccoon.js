class Raccoon extends Mole
{
    constructor(parent = null)
    {
        super("raccoon", parent);
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

        // play action gif and swap once it finishes
        fromHole.visualElement.src = "";
        fromHole.visualElement.src = "Sprites/Raccoon/raccoon_action.gif";
        setTimeout(() => fromHole.swapWith(toHole), 2850);
    }

    onHit()
    {
        super.onHit();
    }
}
