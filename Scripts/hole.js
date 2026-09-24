var MOLE_SIZE = 128;
var HOLE_POSITIONS =    // x = middle, y = lowest.
{
    h: [ {x: 215, y: 270}, {x: 480, y: 270}, {x: 745, y: 270} ],
    v: [ {x: 320, y: 197}, {x: 320, y: 357}, {x: 320, y: 595} ]
};
var DOWNWARDS_OFFSET = 3;   // Shift sprites slightly downwards to avoid gaps with out == 1.
var holes = [];

function positionAtHole(element, index, out = 1)
{
    var pos = (is_horizontal ? HOLE_POSITIONS.h : HOLE_POSITIONS.v)[index];
    element.style.left = (pos.x - MOLE_SIZE / 2) + "px";
    element.style.top = (pos.y - MOLE_SIZE - (out - 1.0) * MOLE_SIZE + DOWNWARDS_OFFSET) + "px";
}

class Hole extends ProcessTreeNode
{
    constructor(index, parent = null)
    {
        super(parent);

        this.index = index;
        this.mole = null;
        this.is_occupied = false;
        this.out = 0.0;

        holes.push(this);
    }

    attachMole(mole, out = 0.0)
    {

        this.mole = mole;
        this.is_occupied = true;
        this.setOut(out);

        mole.hole = this;

        return true;
    }

    detachMole()
    {
        var mole = this.mole;

        mole.parent = null;
        mole.hole = null;
        this.mole = null;
        this.is_occupied = false;
        return mole;
    }

    // 1.0 == fully out, 0.5 == halfway out, 0.0 == fully under (should not be visible at all)
    setOut(out)
    {
        this.out = out;
        this.updateLayout();
    }

    updateLayout()
    {
        if (this.mole != null)
        {
            positionAtHole(this.mole.element, this.index, this.out);
        }
    }
}