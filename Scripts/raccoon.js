var RACCOON_STATE_SWAP_DOWN = "swapDown";
var RACCOON_STATE_SWAP_UP   = "swapUp";

class Raccoon extends Mole
{
    constructor(parent = null)
    {
        super("raccoon", parent);
        this.swapTimer = null;
        this.swapMole = null;   // the animal it's swapping places with
    }

    // on its turn, the raccoon warns right away, then swaps places with another animal
    onLinger()
    {
        if (this.hasUsedOnHitSpecial) return;
        if (animalNames[currentTarget] !== "raccoon") return;

        this.hasUsedOnHitSpecial = true;
        var fromHole = this.hole;
        var candidates = holes.filter(h => h !== fromHole && h.mole != null);
        if (candidates.length === 0) return;
        var toHole = randomItemFromArray(candidates);

        // play the action gif as a warning (hidden if the raccoon is under fur, so the swap is silent)
        fromHole.visualElement.src = "Sprites/Raccoon/raccoon_action.gif";
        this.swapTimer = setTimeout(() =>
        {
            // both go down, swap holes at the bottom, then come back up (handled in tick)
            this.swapMole = toHole.mole;
            this.isMoving = true;
            this.swapMole.isMoving = true;
            this.state = RACCOON_STATE_SWAP_DOWN;
        }, 2850);
    }

    tick(delta)
    {
        super.tick(delta);

        if (this.state == RACCOON_STATE_SWAP_DOWN)
        {
            this.moveSwap(-MOLE_RISE_SPEED * delta);
            if (this.out <= 0.0)
            {
                this.hole.swapWith(this.swapMole.hole);
                // the penguin only wakes up if it's the one being swapped
                if (this.swapMole instanceof Penguin && this.swapMole.isAsleep) this.swapMole.wake();
                this.state = RACCOON_STATE_SWAP_UP;
            }
        }
        else if (this.state == RACCOON_STATE_SWAP_UP)
        {
            this.moveSwap(MOLE_RISE_SPEED * delta);
            if (this.out >= 1.0)
            {
                this.isMoving = false;
                this.swapMole.isMoving = false;
                this.state = MOLE_STATE_ACTIVE;
            }
        }
    }

    // move the raccoon and the other animal in the swap up or down together
    moveSwap(amount)
    {
        for (var mole of [this, this.swapMole])
        {
            mole.out = clamp(mole.out + amount, 0.0, 1.0);
            mole.updateLayout();
        }
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
