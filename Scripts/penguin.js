function setDarkness(element, darknessValue)
{
    element.style.setProperty("--game-darkness", darknessValue.toString());
}

class Penguin extends Mole
{
    constructor(parent = null)
    {
        super("penguin", parent);
        this.isAsleep = false;
        this.sleepFreezeTimer = null;
        this.sleepStartTime = 0;
    }

    onLinger(lingerTime)
    {
        // TEMP for recording the video: add ?nosleep to the page address to keep the penguin awake (remove before merging to master)
        if (location.search.includes("nosleep")) return;

        // only doze off while idle, so animations like the incorrect gif get to finish first
        if (!this.isAsleep && lingerTime >= 2.0 && this.currentSpriteState == "idle")
        {
            this.sleep();
        }
    }

    sleep()
    {
        this.isAsleep = true;
        this.sleepStartTime = Date.now();
        clearTimeout(this.resetTimer); // so a leftover animation doesn't snap him back to idle mid-sleep
        this.hole.visualElement.src = "Sprites/Penguin/penguin_action.gif";
        this.sleepFreezeTimer = setTimeout(() =>
        {
            if (!this.isAsleep) return;
            if (this.hole != null && this.hole.visualElement != null)
                this.hole.visualElement.src = "Sprites/Penguin/penguin_action.png";
            setDarkness(gameRootElement, 1);
            targetElement.style.visibility = "hidden";
        }, GIF_DURATIONS_MS.penguin_action * 0.7);
    }

    wake()
    {
        this.isAsleep = false;
        this.lingerTime = 0.0;
        clearTimeout(this.sleepFreezeTimer);

        // the wake gif starts from fully nodded off (2.55s into the sleep gif), so before that he just snaps awake
        if (Date.now() - this.sleepStartTime >= 2550)
            this.playAnimation("wake");
        else
            this.playSprite("idle");
        setDarkness(gameRootElement, 0);
        targetElement.style.visibility = "visible";
    }

    refreshSprite()
    {
        if (this.isAsleep)
        {
            if (this.hole != null && this.hole.visualElement != null)
                this.hole.visualElement.src = "Sprites/Penguin/penguin_action.png";
            return;
        }
        super.refreshSprite();
    }

    onHit()
    {
        if (this.isAsleep)
        {
            this.wake();
            return;
        }
        super.onHit();
    }

    onDespawn()
    {
        if (this.isAsleep)
        {
            this.wake();
        }
    }
}
