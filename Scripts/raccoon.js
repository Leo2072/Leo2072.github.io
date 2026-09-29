var RACCOON_STATE_WARN = 3;
var RACCOON_STATE_DISAPPEARING = 4;
var RACCOON_STATE_REAPPEARING = 5;


var RACCOON_RELATIVE_WARN_DURATION = 0.3;


class Raccoon extends Mole
{
    constructor(index, gameController, visualElement)
    {
        super(index, gameController, visualElement);

        this.target = null;
    }


    getTargetSpriteSrc() { return RACCOON_TARGET_SRC; }


    getOtherMole()
    {
        var otherMoleCount = this.gameController.moles.length - 1;
        if (otherMoleCount > 0)
        {
            // Math.random() generates numbers within the range [0, 1).
            // Get the index of the other mole in an array where this mole does not exist.
            var otherMoleIndex = Math.floor(Math.random() * otherMoleCount);
            // To convert from the array where this mole does not exist to one where it does exits,
            // insert this mole at its usual index, thereby pushing the indices of all other moles up by 1.
            if (otherMoleIndex >= this.index)
            {
                otherMoleIndex += 1;
            }
            return this.gameController.moles[otherMoleIndex];
        }
        else
        {
            console.error("Cannot swap positions when there are no other moles.");
            return null;
        }
    }


    getSpriteSrc()
    {
        // Try to see if the parent class says anything about handling this.
        var spriteSrc = super.getSpriteSrc();
        if (spriteSrc != "") return spriteSrc;

        // If not, assign sprite based on state.
        switch (this.state)
        {
            case MOLE_STATE_IDLE:
            case RACCOON_STATE_DISAPPEARING:
            case RACCOON_STATE_REAPPEARING:
                return RACCOON_IDLE_SRC;
                break;
            case RACCOON_STATE_WARN:
                return RACCOON_WARN_SRC;
                break;
            case MOLE_STATE_SQUEAK:
                return RACCOON_SQUEAK_SRC;
                break;
            case MOLE_STATE_ANGRY:
                return RACCOON_STOP_SRC;
                break;
            default:
                return "";
                break;
        }
    }


    tick(delta)
    {
        super.tick(delta);

        switch (this.state)
        {
            case MOLE_STATE_IDLE:
                {
                    // Only perform the interaction once during the turn that this animal must be picked.
                    if (this.isCorrect && !this.hasUsedInteraction && this.gameController.isInTurn())
                    {
                        this.state = RACCOON_STATE_WARN;
                        this.timer = 0;
                        this.hasUsedInteraction = true;
                        this.updateSprite();
                    }
                }
                break;

            case RACCOON_STATE_WARN:
                {
                    this.timer += delta;
                    if (this.timer > this.gameController.getActualDuration(RACCOON_RELATIVE_WARN_DURATION))
                    {
                        this.state = RACCOON_STATE_DISAPPEARING;
                        this.timer = 0;

                        this.target = this.getOtherMole();
                        this.isMoving = true;
                        this.target.isMoving = true;
                        this.updateSprite();
                    }
                }
                break;

            case RACCOON_STATE_DISAPPEARING:
                {
                    this.timer += delta;
                    if (this.timer >= this.gameController.getActualDuration(MOLE_RELATIVE_MOVE_TIME))
                    {
                        this.state = RACCOON_STATE_REAPPEARING;
                        this.timer = 0;

                        this.setOutAmount(0);
                        this.target.setOutAmount(0);

                        // Swap holes. This automatically updates the sprites.
                        var temp = this.visualElement;
                        this.setHole(this.target.visualElement, false);
                        this.target.setHole(temp, false);
                    }
                    else
                    {
                        this.setOutAmount(1 - this.timer / this.gameController.getActualDuration(MOLE_RELATIVE_MOVE_TIME));
                        this.target.setOutAmount(1 - this.timer / this.gameController.getActualDuration(MOLE_RELATIVE_MOVE_TIME));
                    }
                }
                break;

            case RACCOON_STATE_REAPPEARING:
                {
                    this.timer += delta;
                    if (this.timer >= this.gameController.getActualDuration(MOLE_RELATIVE_MOVE_TIME))
                    {
                        this.state = MOLE_STATE_IDLE;
                        this.timer = 0;

                        this.setOutAmount(1.0);
                        this.target.setOutAmount(1.0);
                        this.target.isMoving = false;
                        this.isMoving = false;

                        this.updateSprite();
                    }
                    else
                    {
                        this.setOutAmount(this.timer / this.gameController.getActualDuration(MOLE_RELATIVE_MOVE_TIME));
                        this.target.setOutAmount(this.timer / this.gameController.getActualDuration(MOLE_RELATIVE_MOVE_TIME));
                    }
                }
        }
    }
}
