function setDarkness(element, darknessValue)
{
    element.style.setProperty("--game-darkness", darknessValue.toString());
}


var PENGUIN_STATE_DROWSY = 3;
var PENGUIN_STATE_ASLEEP = 4;


var PENGUIN_RELATIVE_MIN_AWAKE_DURATION = 0.75;
var PENGUIN_RELATIVE_MAX_AWAKE_DURATION = 2;

var PENGUIN_RELATIVE_DROWSY_DURATION = 0.75;


class Penguin extends Mole
{
    constructor(index, gameController, visualElement)
    {
        super(index, gameController, visualElement);
        this.timeToNextDrowsy = Math.random();
    }


    getTargetSpriteSrc() { return PENGUIN_TARGET_SRC; }


    getRandomAwakeTime()
    {
        return this.gameController.getActualDuration(
            PENGUIN_RELATIVE_MIN_AWAKE_DURATION +
            Math.random() * (PENGUIN_RELATIVE_MAX_AWAKE_DURATION - PENGUIN_RELATIVE_MIN_AWAKE_DURATION)
        );
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
                return PENGUIN_IDLE_SRC;
                break;
            case PENGUIN_STATE_DROWSY:
                return PENGUIN_DROWSY_SRC;
                break;
            case PENGUIN_STATE_ASLEEP:
                return PENGUIN_SLEEP_SRC;
                break;
            case MOLE_STATE_SQUEAK:
                return PENGUIN_SQUEAK_SRC;
                break;
            case MOLE_STATE_ANGRY:
                return PENGUIN_ANGRY_SRC;
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
                    // Get drowsy as long as the game is active.
                    if (this.gameController.isInTurn())
                    {
                        this.timeToNextDrowsy -= delta;
                        if (this.timeToNextDrowsy < 0)
                        {
                            this.timeToNextDrowsy = 0;

                            this.state = PENGUIN_STATE_DROWSY;
                            this.timer = 0;
                            this.updateSprite();
                        }
                    }
                }
                break;

            case PENGUIN_STATE_DROWSY:
                {
                    this.timer += delta;
                    var drowsyDuration = this.gameController.getActualDuration(PENGUIN_RELATIVE_DROWSY_DURATION);
                    if (this.timer > drowsyDuration)
                    {
                        setDarkness(this.gameController.rootElement, 1);
                        this.state = PENGUIN_STATE_ASLEEP;
                        this.timer = 0;
                        this.updateSprite();
                    }
                    else
                    {
                        setDarkness(this.gameController.rootElement, this.timer / drowsyDuration);
                    }
                }
                break;
        }
    }



    isBusy()
    {
        // The penguin is busy if it is either moving, squeaking, and being angry.
        return this.isMoving || ((this.state == MOLE_STATE_SQUEAK) || (this.state == MOLE_STATE_ANGRY));
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
                // No getting angry if the penguin is drowsy or asleep.
                if (this.state == PENGUIN_STATE_DROWSY || this.state == PENGUIN_STATE_ASLEEP)
                {
                    this.state = MOLE_STATE_IDLE;
                    this.timer = 0;
                    // Wake up and brighten everything.
                    setDarkness(this.gameController.rootElement, 0);
                    this.updateSprite();
                    this.updateSprite();
                }
                else
                {
                    this.state = MOLE_STATE_ANGRY;
                    this.timer = 0;
                    this.updateSprite();
                    this.gameController.timer += this.gameController.turnDuration * this.pressPenalty;
                }
            }
            else
            {
                if (this.state == PENGUIN_STATE_DROWSY || this.state == PENGUIN_STATE_ASLEEP)
                {
                    setDarkness(this.gameController.rootElement, 0);
                }
                this.state = MOLE_STATE_SQUEAK;
                this.timer = 0;
                this.updateSprite();

                // We are done and can move to the next turn.
                this.gameController.nextTurn();
            }
            // Refresh wake time, basically.
            this.timeToNextDrowsy = Math.max(this.timeToNextDrowsy, this.getRandomAwakeTime());
        }
        // If the game is over, allow for some limited interactions.
        else if (this.gameController.gameOver)
        {
            // Can unhide after game over.
            if (this.isHidden)
            {
                this.unhide();
            }

            // Can wake up after game over.
            if (this.state == PENGUIN_STATE_DROWSY || this.state == PENGUIN_STATE_ASLEEP)
            {
                this.state = MOLE_STATE_IDLE;
                this.timer = 0;
                this.timeToNextDrowsy = this.getRandomAwakeTime();

                // Wake up and brighten everything.
                setDarkness(this.gameController.rootElement, 0);
                this.updateSprite();
            }
        }
    }
}