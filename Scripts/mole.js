/* How long it takes for a mole to get into and out of a hole, relative to the amount of time in the current turn. */
var MOLE_RELATIVE_MOVE_TIME = 0.1;

// How long it takes for a mole to squeak or get angry, relative to the amount of time in the current turn.
var MOLE_RELATIVE_SQUEAK_TIME = 0.1;
var MOLE_RELATIVE_ANGRY_TIME = 0.1;


/* Duration of various GIF animations. Deprecated. */
var GIF_DURATIONS_SEC =
{
    penguin_sleep: 2.550,
    penguin_wake: 1.250,
    penguin_correct: 1.200,
    penguin_incorrect: 2.400,

    raccoon_warn: 1.500,
    raccoon_smoke: 0.450,
    raccoon_incorrect: 2.700,
    raccoon_correct: 0.900,

    dog_inhale: 1.800,
    dog_sneeze: 0.300,
    dog_fur_pile: 0.600,
    dog_correct: 1.200,
    dog_incorrect: 1.750,
};



/* Mole Sprites */
var DOG_TARGET_SRC = "Sprites/dog_title_icon.png";
var DOG_SNEEZE_SRC = "Sprites/Dog/dog_action.png";
var DOG_INHALE_SRC = "Sprites/Dog/dog_action_warn.png";
var DOG_SQUEAK_SRC = "Sprites/Dog/dog_correct.png";
var DOG_SHOCK_SRC = "Sprites/Dog/dog_incorrect.png";
var DOG_IDLE_SRC = "Sprites/Dog/dog_idle.png";
var FUR_PILE_SRC = "Sprites/Dog/dog_fur_pile.png";

var PENGUIN_TARGET_SRC = "Sprites/penguin_title_icon.png";
var PENGUIN_SLEEP_SRC = "Sprites/Penguin/penguin_action.png";
var PENGUIN_DROWSY_SRC = "Sprites/Penguin/penguin_action_warn.png";
var PENGUIN_SQUEAK_SRC = "Sprites/Penguin/penguin_correct.png";
var PENGUIN_ANGRY_SRC = "Sprites/Penguin/penguin_incorrect.png";
var PENGUIN_IDLE_SRC = "Sprites/Penguin/penguin_idle.png";

var RACCOON_TARGET_SRC = "Sprites/raccoon_title_icon.png";
var RACCOON_WARN_SRC = "Sprites/Raccoon/raccoon_action_warn.png";
var RACCOON_SQUEAK_SRC = "Sprites/Raccoon/raccoon_correct.png";
var RACCOON_STOP_SRC = "Sprites/Raccoon/raccoon_incorrect.png";
var RACCOON_IDLE_SRC = "Sprites/Raccoon/raccoon_idle.png";



var MOLE_STATE_IDLE = 0;
var MOLE_STATE_SQUEAK = 1;
var MOLE_STATE_ANGRY = 2;



class Mole extends ProcessTreeNode
{
    constructor(index, gameController, visualElement)
    {
        super(gameController);

        this.gameController = gameController;

        // Set this mole's index (for selecting other moles).
        this.index = index;

        // This mole is the target.
        this.isCorrect = false;

        // The percentage of the max time for this turn that pressing the incorrect animal will incur.
        this.pressPenalty = 0.1;

        
        // Flag for the dog's special interaction effect.
        // If hidden, do not change sprites or play animations that would change sprites.
        this.isHidden = false;

        // Flag for the raccoon's special interaction effect.
        // If moving, do not react to button presses.
        this.isMoving = false;

        // General purpose timer.
        this.timer = 0;

        // Has this mole used its special interaction this turn yet?
        this.hasUsedInteraction = false;

        // State flag for internal behaviours of the derived mole.
        this.state = MOLE_STATE_IDLE;

        // Create an explicit lambda function of this mole's onClick() function, with the mole bind to it.
        // This must be done to bind a class method to an onclick signal of a button.
        this.clickCallback = () => { this.onClick(); };

        this.setHole(visualElement, false);
    }


    getSqueakDuration()
    {
        return MOLE_RELATIVE_SQUEAK_TIME * this.gameController.turnDuration;
    }

    getAngryDuration()
    {
        return MOLE_RELATIVE_ANGRY_TIME * this.gameController.turnDuration;
    }


    // Set how much this mole is out of its hole.
    setOutAmount(out)
    {
        this.visualElement.style.transform = "translateY(" + ((1.0 - out) * 100) + "%)";
    }


    // Method to check whether or not this mole is ready for the next turn to be set up.
    // Children classes should overwrite this method to implement the appropriate halting behaviour.
    isBusy()
    {
        return this.isMoving || (this.state != MOLE_STATE_IDLE);
    }

    // Method to check whether or not this mole can be pressed on.
    // Children classes should overwrite this method to implement the appropriate hit test behaviour.
    isHittable()
    {
        // Cannot be hit if this mole is moving, or the game controller is either transitioning between turns, or in a game over state.
        return !(this.isMoving || (this.gameController.turnTransition != TURN_TRANSITION_NONE) || this.gameController.gameOver);
    }

    // Method to hide the mole for the dog's special interaction.
    hide()
    {
        this.isHidden = true;
        this.updateSprite();
    }

    // Method to unhide the mole from the dog's special interaction.
    unhide()
    {
        this.isHidden = false;
        this.updateSprite();
    }

    // Callback to receive the end of turn signal.
    onTurnEnd()
    {
    }

    // Callback to receive the start of turn signal.
    onTurnStart()
    {
        this.hasUsedInteraction = false;
    }


    // Callback to receive being clicked on.
    onClick()
    {
        if (this.isHittable())
        {
            if (this.isHidden)
            {
                this.unhide();
            }
            if (!this.isCorrect)
            {
                this.state = MOLE_STATE_ANGRY;
                this.timer = 0;
                this.updateSprite();
                this.gameController.penalize(this.pressPenalty);
            }
            else
            {
                this.state = MOLE_STATE_SQUEAK;
                this.timer = 0;
                this.updateSprite();
                // We are done and can move to the next turn.
                this.gameController.nextTurn();
            }
        }
        // Unhide the animal if it is clicked on after the game is over.
        else if (this.gameController.gameOver && this.isHidden)
        {
            this.unhide();
        }
    }



    // Helper method to get the source url for the current sprite for this mole based on its state.
    // Children classes should overwrite this method to implement the appropriate sprite animations.
    getSpriteSrc()
    {
        // If this mole is hiding, show the fur pile instead.
        if (this.isHidden) return FUR_PILE_SRC;
        else return "";
    }

    // Method to get the source url for the target sprite for this mole.
    // Children classes should overwrite this method to display the correct sprite as the click target.
    getTargetSpriteSrc() { return UNKNOWN_TARGET_SPRITE_SRC; }

    // Update the image being used as a sprite for this mole.
    updateSprite()
    {
        this.visualElement.src = this.getSpriteSrc();
        // Trigger document reflow to immediately update the sprite.
        this.visualElement.offsetHeight;
    }


    // Set this mole's visual element (the thing that renders the mole on page).
    setHole(visualElement, unbind=true)
    {
        if (unbind)
        {
            if (this.visualElement != null)
            {
                this.visualElement.onClick = null;
                this.visualElement.src = "";
            }
        }
        this.visualElement = visualElement;
        if (this.visualElement != null)
        {
            this.visualElement.onclick = this.clickCallback;
            this.updateSprite();
        }
    }


    tick(delta)
    {
        switch (this.state)
        {
            case MOLE_STATE_SQUEAK:
                this.timer += delta;
                if (this.isCorrect && this.timer > this.gameController.getActualDuration(MOLE_RELATIVE_ANGRY_TIME))
                {
                    this.state = MOLE_STATE_IDLE;
                    this.timer = 0;
                    this.updateSprite();
                }
                break;

            case MOLE_STATE_ANGRY:
                {
                    this.timer += delta;
                    if (this.timer > this.gameController.getActualDuration(MOLE_RELATIVE_ANGRY_TIME))
                    {
                        this.state = MOLE_STATE_IDLE;
                        this.timer = 0;
                        this.updateSprite();
                    }
                }
                break;
        }
    }
}
