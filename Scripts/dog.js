var DOG_STATE_INHALE = 3;
var DOG_STATE_SNEEZE = 4;


var DOG_SNEEZE_CHANCE = 0.5;
var DOG_RELATIVE_INHALE_DURATION = 0.1;
var DOG_RELATIVE_SNEEZE_DURATION = 0.1;


class Dog extends Mole
{
    constructor(index, gameController, visualElement)
    {
        super(index, gameController, visualElement);
    }


    getTargetSpriteSrc() { return DOG_TARGET_SRC; }


    getSpriteSrc()
    {
        // Try to see if the parent class says anything about handling this.
        var spriteSrc = super.getSpriteSrc();
        if (spriteSrc != "") return spriteSrc;

        // If not, assign sprite based on state.
        switch (this.state)
        {
            case MOLE_STATE_IDLE:
                return DOG_IDLE_SRC;
                break;
            case DOG_STATE_INHALE:
                return DOG_INHALE_SRC;
                break;
            case DOG_STATE_SNEEZE:
                return DOG_SNEEZE_SRC;
                break;
            case MOLE_STATE_SQUEAK:
                return DOG_SQUEAK_SRC;
                break;
            case MOLE_STATE_ANGRY:
                return DOG_SHOCK_SRC;
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
            case DOG_STATE_INHALE:
                {
                    this.timer += delta;
                    if (this.timer > this.gameController.getActualDuration(DOG_RELATIVE_INHALE_DURATION))
                    {
                        this.state = DOG_STATE_SNEEZE;
                        this.timer = 0;
                        this.updateSprite();

                        // Cover the other animals in dog fur.
                        for (var i = 0; i < this.gameController.moles.length; ++i)
                        {
                            if (i != this.index)
                            {
                                this.gameController.moles[i].hide();
                            }
                        }
                    }
                }
                break;
            case DOG_STATE_SNEEZE:
                {
                    this.timer += delta;
                    if (this.timer > this.gameController.getActualDuration(DOG_RELATIVE_SNEEZE_DURATION))
                    {
                        this.state = MOLE_STATE_IDLE;
                        this.timer = 0;
                        this.updateSprite();
                    }
                }
                break;
        }
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

            var sneeze = Math.random() < DOG_SNEEZE_CHANCE;
            if (sneeze)
            {
                this.state = DOG_STATE_INHALE;
                this.timer = 0;
                this.updateSprite();
            }

            if (!this.isCorrect)
            {
                // Only enter an angry state if this will not sneeze.
                if (!sneeze)
                {
                    this.state = MOLE_STATE_ANGRY;
                    this.timer = 0;
                    this.updateSprite();
                }
                this.gameController.timer += this.gameController.turnDuration * this.pressPenalty;
            }
            else
            {
                // Only enter a squeak if this will not sneeze
                if (!sneeze)
                {
                    this.state = MOLE_STATE_SQUEAK;
                    this.timer = 0;
                    this.updateSprite();
                }

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
}
