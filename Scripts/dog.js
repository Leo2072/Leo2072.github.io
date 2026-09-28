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
            this.playSprite("action_warn");
            this.furTimer = setTimeout(() => this.spreadFur(), 1500);
        }, 4000 + Math.random() * 4000);
    }

    // swap other occupied holes' sprites to fur
    spreadFur()
    {
        if (this.state === MOLE_STATE_DESPAWNING) return;
        holes.filter(h => h !== this.hole && h.mole != null).forEach(h => this.applyFur(h));
        this.scheduleFur();
    }

    // swap the hole's sprite to the fur pile; clicking it restores the animal and penalizes if wrong
    applyFur(hole)
    {
        if (hole.mole == null || hole.mole.isFurred) return;
        hole.mole.isFurred = true;
        hole.visualElement.src = "Sprites/Dog/dog_fur_pile.png";

        hole.slotElement.addEventListener("click", hole.mole.clearFurHandler = (e) =>
        {
            e.stopPropagation();
            hole.mole.isFurred = false;
            hole.mole.refreshSprite();
            hole.slotElement.removeEventListener("click", hole.mole.clearFurHandler);
            if (hole.mole.type !== animalNames[currentTarget])
            {
                timeLeft = Math.max(0, timeLeft - 5);
                showPenalty();
            }
        });
    }

    // cancel the fur timer and restore any furred holes when the dog leaves
    onDespawn()
    {
        clearTimeout(this.furTimer);
        holes.forEach(h =>
        {
            if (h.mole != null && h.mole.isFurred)
            {
                h.mole.isFurred = false;
                h.slotElement.removeEventListener("click", h.mole.clearFurHandler);
                h.mole.refreshSprite();
            }
        });
    }
}
