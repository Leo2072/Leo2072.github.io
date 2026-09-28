class Dog extends Mole
{
    constructor(parent = null)
    {
        super("dog", parent);
        this.furTimer = null;
    }

    onSpawn()
    {
        this.scheduleFur();
    }

    // queue the next fur spread at a random interval, with a short warning first
    scheduleFur()
    {
        this.furTimer = setTimeout(() =>
        {
            if (this.state === MOLE_STATE_DESPAWNING) return;
            this.hole.visualElement.src = "";
            this.hole.visualElement.src = "Sprites/Dog/dog_action.gif";
            this.furTimer = setTimeout(() => this.spreadFur(), GIF_DURATIONS_MS.dog_action * 0.6625);
        }, 4000 + Math.random() * 4000);
    }

    // swap other occupied holes' sprites to fur
    spreadFur()
    {
        if (this.state === MOLE_STATE_DESPAWNING) return;
        this.playSprite("idle");
        holes.filter(h => h !== this.hole && h.mole != null).forEach(h => this.applyFur(h));
        this.scheduleFur();
    }

    // swap the hole's sprite to the fur pile; clicking it restores the animal and penalizes if wrong
    applyFur(hole)
    {
        if (hole.mole == null || hole.isFurred) return;
        hole.isFurred = true;
        hole.visualElement.src = "";
        hole.visualElement.src = "Sprites/Dog/dog_fur_pile.gif";
        setTimeout(() =>
        {
            if (hole.isFurred)
                hole.visualElement.src = "Sprites/Dog/dog_fur_pile.png";
        }, 1400);

        hole.slotElement.addEventListener("click", hole.clearFurHandler = (e) =>
        {
            e.stopPropagation();
            hole.isFurred = false;
            if (hole.mole != null) hole.mole.refreshSprite();
            hole.slotElement.removeEventListener("click", hole.clearFurHandler);
            if (hole.mole != null && hole.mole.type !== animalNames[currentTarget])
            {
                timeLeft = Math.max(0, timeLeft - 5);
                showPenalty();
            }
        });
    }

    // cancel the fur timer when the dog leaves; fur stays on holes until cleared by the player
    onDespawn()
    {
        clearTimeout(this.furTimer);
    }
}
