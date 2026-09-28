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

    // cover other occupied holes with fur
    spreadFur()
    {
        if (this.state === MOLE_STATE_DESPAWNING) return;
        holes.filter(h => h !== this.hole && h.mole != null).forEach(h => this.applyFur(h));
        this.scheduleFur();
    }

    // add a fur overlay to a hole; clicking it clears the fur and penalizes if wrong animal
    applyFur(hole)
    {
        if (hole.slotElement.querySelector(".fur-overlay")) return;
        var img = document.createElement("img");
        img.className = "fur-overlay";
        img.src = "Sprites/Dog/dog_fur_pile.png";
        img.addEventListener("click", (e) =>
        {
            e.stopPropagation();
            img.remove();
            if (hole.mole != null && hole.mole.type !== animalNames[currentTarget])
            {
                timeLeft = Math.max(0, timeLeft - 5);
                showPenalty();
            }
        });
        hole.slotElement.appendChild(img);
    }

    // cancel the fur timer and remove any existing fur when the dog leaves
    onDespawn()
    {
        clearTimeout(this.furTimer);
        holes.forEach(h =>
        {
            var fur = h.slotElement.querySelector(".fur-overlay");
            if (fur) fur.remove();
        });
    }
}
