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
    }

    onLinger(lingerTime)
    {
        if (!this.isAsleep && lingerTime >= 3.0)
        {
            this.sleep();
        }
    }

    sleep()
    {
        this.isAsleep = true;
        this.hole.visualElement.src = "";
        this.hole.visualElement.src = "Sprites/Penguin/penguin_action.gif";
        this.sleepFreezeTimer = setTimeout(() =>
        {
            if (!this.isAsleep) return;
            if (this.hole != null && this.hole.visualElement != null && !this.hole.isFurred)
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
        clearTimeout(this.resetTimer);
        this.playSprite("idle");
        setDarkness(gameRootElement, 0);
        targetElement.style.visibility = "visible";
    }

    refreshSprite()
    {
        if (this.isAsleep)
        {
            if (this.hole != null && this.hole.visualElement != null && !this.hole.isFurred)
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
