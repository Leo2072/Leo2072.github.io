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
            clearTimeout(this.resetTimer); // so a leftover animation doesn't cut the sneeze short
            this.hole.visualElement.src = "Sprites/Dog/dog_action.gif";
            this.furTimer = setTimeout(() => this.spreadFur(), GIF_DURATIONS_MS.dog_action * 0.6625);
        }, 4000 + Math.random() * 4000);
    }

    // cover the other occupied holes with fur
    spreadFur()
    {
        if (this.state === MOLE_STATE_DESPAWNING) return;
        this.playSprite("idle");
        holes.filter(h => h !== this.hole && h.mole != null).forEach(h => this.applyFur(h));
        this.scheduleFur();
    }

    // show the fur pile and hide the animal; the animal keeps doing its thing underneath
    // clicking it just uncovers the animal (no penalty, only wastes a click)
    applyFur(hole)
    {
        if (hole.mole == null || hole.isFurred) return;
        var fur = hole.slotElement.querySelector(".fur-pile");
        hole.isFurred = true;
        fur.src = "Sprites/Dog/dog_fur_pile.gif";
        fur.hidden = false;
        hole.visualElement.style.visibility = "hidden";
        setTimeout(() => fur.src = "Sprites/Dog/dog_fur_pile.png", 1000);

        hole.slotElement.addEventListener("click", hole.clearFurHandler = () =>
        {
            hole.isFurred = false;
            fur.hidden = true;
            hole.visualElement.style.visibility = "";
            hole.slotElement.removeEventListener("click", hole.clearFurHandler);
        });
    }

    // cancel the fur timer when the dog leaves; fur stays on holes until cleared by the player
    onDespawn()
    {
        clearTimeout(this.furTimer);
    }
}
