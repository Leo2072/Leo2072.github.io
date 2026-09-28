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

    scheduleFur()
    {
        this.furTimer = setTimeout(() => this.spreadFur(), 4000 + Math.random() * 4000);
    }

    spreadFur()
    {
        if (this.state === MOLE_STATE_DESPAWNING) return;
        holes.filter(h => h !== this.hole && h.mole != null).forEach(h => this.applyFur(h));
        this.scheduleFur();
    }

    applyFur(hole)
    {
        if (hole.slotElement.querySelector(".fur-overlay")) return;
        var img = document.createElement("img");
        img.className = "fur-overlay";
        img.src = "Sprites/Dog/dog_fur_pile.png";
        hole.slotElement.appendChild(img);
    }

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
