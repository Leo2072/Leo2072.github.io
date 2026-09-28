var MOLE_STATE_SPAWNING   = "spawning";
var MOLE_STATE_ACTIVE     = "active";
var MOLE_STATE_DESPAWNING = "despawning";

var MOLE_RISE_SPEED = 4.0;

var GIF_DURATIONS_MS = {
    penguin_action:     4550,
    penguin_correct:    1250,
    penguin_incorrect:  3150,
    raccoon_action:     3800,
    raccoon_correct:    1000,
    raccoon_incorrect:  2450,
    dog_action:         1000,
    dog_correct:        1950,
    dog_incorrect:      1950,
};

class Mole extends ProcessTreeNode
{
    constructor(type, parent = null)
    {
        super(parent);

        this.type = type;                   // e.g. "penguin", "raccoon", "dog"
        this.hole = null;

        this.out = 0.0;
        this.state = MOLE_STATE_SPAWNING;

        this.hasBeenHovered = false;
        this.hasUsedOnHitSpecial = false;
        this.lingerTime = 0.0;              // seconds alive
        this.onExit = null;                 // optional callback(hole), fired once this mole finishes despawning.

        this.isBusy = false;                // disable hits while busy

        this.currentSpriteState = "idle";   // store this for redraw after hole change
        this.resetTimer = null;
    }

    // Only update the y-translation for in/out animations, since css handles the rest of the scaling
    updateLayout()
    {
        if (this.hole == null || this.hole.visualElement == null) return;
        this.hole.visualElement.style.transform = "translateY(" + ((1.0 - this.out) * 100) + "%)";
    }

    spawn(hole)
    {
        if (!hole.attachMole(this))
        {
            return false;
        }

        this.playSprite("idle");
        this.out = 0.0;
        this.state = MOLE_STATE_SPAWNING;
        this.updateLayout();
        this.onSpawn();
        return true;
    }

    // Starts the sink animation; the mole detaches and deletes itself once fully hidden.
    despawn()
    {
        if (this.state == MOLE_STATE_DESPAWNING)
        {
            return;
        }
        this.state = MOLE_STATE_DESPAWNING;
        this.onDespawn();
    }

    tick(delta)
    {
        super.tick(delta);

        if (this.state == MOLE_STATE_SPAWNING)
        {
            this.out = clamp(this.out + MOLE_RISE_SPEED * delta, 0.0, 1.0);
            this.updateLayout();
            if (this.out >= 1.0)
            {
                this.state = MOLE_STATE_ACTIVE;
            }
        }
        else if (this.state == MOLE_STATE_ACTIVE)
        {
            this.lingerTime += delta;
            this.onLinger(this.lingerTime);
        }
        else if (this.state == MOLE_STATE_DESPAWNING)
        {
            this.out = clamp(this.out - MOLE_RISE_SPEED * delta, 0.0, 1.0);
            this.updateLayout();
            if (this.out <= 0.0)
            {
                var hole = this.hole;
                if (hole != null)
                {
                    hole.detachMole();
                }
                this.queue_delete();
                if (this.onExit) this.onExit(hole);
            }
        }
    }

    // Override for interactions
    onSpawn() {}
    onDespawn() {}

    onHit()
    {
        this.playAnimation("correct");
        this.despawn();
    }

    onMiss() {
        this.playAnimation("incorrect");
    }
    onHover() {}
    onLinger(lingerTime) {}

    playSprite(state)
    {
        this.currentSpriteState = state;
        if (this.hole == null || this.hole.visualElement == null) return;
        var ext = state == "idle" ? "png" : "gif";
        this.hole.visualElement.src = spriteBasePathFor(this.type) + "_" + state + "." + ext;
    }

    // playSprite, but resets to idle once the animation is finished
    playAnimation(state)
    {
        this.playSprite(state);
        clearTimeout(this.resetTimer);

        var duration = GIF_DURATIONS_MS[this.type + "_" + state];
        this.resetTimer = setTimeout(() => this.playSprite("idle"), duration);
    }

    // Redraws this mole's last sprite state into its current hole
    refreshSprite()
    {
        this.playSprite(this.currentSpriteState);
    }
}

function spriteBasePathFor(type)
{
    var folder = type.charAt(0).toUpperCase() + type.slice(1);
    return "Sprites/" + folder + "/" + type;
}