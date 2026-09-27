var holes = [];

class Hole extends ProcessTreeNode
{
    constructor(index, parent = null, slotElement = null)
    {
        super(parent);

        this.index = index;
        this.mole = null;
        this.is_occupied = false;
        this.slotElement = slotElement;

        holes.push(this);
    }

    bindElement(element)
    {
        this.slotElement = element;
    }

    attachMole(mole)
    {
        if (this.is_occupied)
        {
            console.warn("Hole " + this.index + " is already occupied.");
            return false;
        }

        this.mole = mole;
        this.is_occupied = true;
        mole.hole = this;
        return true;
    }

    detachMole()
    {
        var mole = this.mole;
        if (mole != null)
        {
            mole.hole = null;
        }
        this.mole = null;
        this.is_occupied = false;
        return mole;
    }

    // Swaps moles with another hole
    swapWith(otherHole)
    {
        if (otherHole === this) return;

        var thisMole = this.mole;
        var otherMole = otherHole.mole;

        this.mole = otherMole;
        otherHole.mole = thisMole;

        this.is_occupied = otherMole != null;
        otherHole.is_occupied = thisMole != null;

        if (thisMole != null) thisMole.hole = otherHole;
        if (otherMole != null) otherMole.hole = this;

        this.updateLayout();
        otherHole.updateLayout();
    }

    isEmpty()
    {
        return !this.is_occupied;
    }

    updateLayout()
    {
        if (this.mole != null)
        {
            this.mole.updateLayout();
        }
    }
}