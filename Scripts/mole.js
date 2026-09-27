var MOLE_STATE_SPAWNING   = "spawning";
var MOLE_STATE_ACTIVE     = "active";
var MOLE_STATE_DESPAWNING = "despawning";

var MOLE_RISE_SPEED = 4.0;
var MOLE_CORRECT_DURATION = 1500;
var MOLE_INCORRECT_DURATION = 2000;

class Mole extends ProcessTreeNode
{
    constructor(type, parent = null)
    {
        super(parent);

        this.type = type;              // e.g. "penguin", "raccoon", "dog"
        this.hole = null;
        this.element = null;           // hole.slotElement
        this.visualElement = null;     // the .animal-button img inside that slot

        this.out = 0.0;
        this.state = MOLE_STATE_SPAWNING;

        this.hasBeenHovered = false;

        this._resetTimer = null;
    }

    // Only update the y-translation for in/out animations, since css handles the rest of the scaling
    updateLayout()
    {
        if (this.visualElement == null) return;
        this.visualElement.style.transform = "translateY(" + ((1.0 - this.out) * 100) + "%)";
    }

    spawn(hole)
    {
        if (!hole.attachMole(this))
        {
            return false;
        }

        this.element = hole.slotElement;
        this.visualElement = this.element.querySelector(".animal-button");
        this.out = 0.0;
        this.state = MOLE_STATE_SPAWNING;
        this.updateLayout();
        this.onSpawn();
        return true;
    }

    // Starts the sink animation; the mole detaches and deletes itself once fully hidden.
    despawn()
    {
        if (this.state === MOLE_STATE_DESPAWNING)
        {
            return;
        }
        this.state = MOLE_STATE_DESPAWNING;
        this.onDespawn();
    }

    tick(delta)
    {
        super.tick(delta);

        if (this.state === MOLE_STATE_SPAWNING)
        {
            this.out = clamp(this.out + MOLE_RISE_SPEED * delta, 0.0, 1.0);
            this.updateLayout();
            if (this.out >= 1.0)
            {
                this.state = MOLE_STATE_ACTIVE;
            }
        }
        else if (this.state === MOLE_STATE_DESPAWNING)
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
            }
        }
    }

    // Override for interactions
    onSpawn() {}
    onDespawn() {}
    onHit() { this.playAnimation("correct", MOLE_CORRECT_DURATION); }
    onMiss() { this.playAnimation("incorrect", MOLE_INCORRECT_DURATION); }
    onHover() {}

    playSprite(state)
    {
        if (this.visualElement == null) return;
        this.visualElement.src = spriteBasePathFor(this.type) + "_" + state + ".gif";
    }

    // playSprite, but resets to idle animation after duration
    playAnimation(state, duration)
    {
        this.playSprite(state);
        clearTimeout(this._resetTimer);
        this._resetTimer = setTimeout(() => this.playSprite("idle"), duration);
    }
}

function spriteBasePathFor(type)
{
    var folder = type.charAt(0).toUpperCase() + type.slice(1);
    return "Sprites/" + folder + "/" + type;
}