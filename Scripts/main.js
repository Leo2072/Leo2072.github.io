randomiseTitleIcon()


// Return a shuffled copy of the given array.
function shuffleArray(arr)
{
    // Create a copy of the original.
    var shuffledArray = arr.slice();

    // Iterate from the end of the array to the start of it, swapping each element with another random element.
    for (var i = shuffledArray.length - 1; i > 0; --i)
    {
        // Get a random item to swap with.
        // Math.random() generates numbers within the range [0, 1).
        var swapTo = Math.floor(Math.random() * (i + 1));

        // Swap the 2 items.
        var temp = shuffledArray[i];
        shuffledArray[i] = shuffledArray[swapTo];
        shuffledArray[swapTo] = temp;
    }
    return shuffledArray;
}



var penaltySound = new Audio("Sounds/incorrect.mp3");
var correctSound = new Audio("Sounds/correct.mp3");

// rewind first so the sound restarts even if it's still playing from the last click
function playSound(sound)
{
    sound.currentTime = 0;
    sound.play();
}



// Keep track of where the player last tapped the screen.
var pointerClientX = 0;
var pointerClientY = 0;
document.addEventListener('pointerdown', (event) =>
{
    console.log(event.clientX);
    pointerClientX = event.clientX;
    pointerClientY = event.clientY;
});

// briefly show a floating indicator and flash the timer red when the player is penalized
function showPenalty(timerElement, percentagePenalty)
{
    playSound(penaltySound);

    var el = document.createElement("div");
    el.className = "penalty-text";

    el.style.left = pointerClientX + "px";
    el.style.top = pointerClientY + "px";

    el.textContent = "-" + Math.floor(percentagePenalty * 100) + "%";
    document.body.appendChild(el);

    // Replay penalty animation for the timerElement by
    // removing and reattaching the timer-penalty class, which plays the animation once..
    timerElement.classList.remove("timer-penalty");
    timerElement.offsetHeight;
    timerElement.classList.add("timer-penalty");

    setTimeout(() => el.remove(), 1000);
}





// Different turn transition states.
var TURN_TRANSITION_NONE = 0; // No turn transitions are happening.
var TURN_TRANSITION_END = 1; // The moles are returning into their holes.
var TURN_TRANSITION_START = 2; // The moles are moving out of their holes.

var MAX_TURN_TIME = 10;
var MIN_TURN_TIME = 2;
var TURN_TIME_DECAY_FACTOR = 1.1;

var UNKNOWN_TARGET_SPRITE_SRC = "Sprites/unknown_title_icon.png";


var REWARD_TIERS = [
    { minScore: 0, imgSrc: "Sprites/Rewards/DogSneeze.gif" },
    { minScore: 500, imgSrc: "Sprites/Rewards/DogSqueak.gif" },
    { minScore: 1000, imgSrc: "Sprites/Rewards/RaccoonStop.gif" },
    { minScore: 1500, imgSrc: "Sprites/Rewards/PenguinAggressive.gif" },
    { minScore: 2000, imgSrc: "Sprites/Rewards/RaccoonSqueak.gif" },
    { minScore: 2500, imgSrc: "Sprites/Rewards/PenguinSleep.gif" },
    { minScore: 3000, imgSrc: "Sprites/Rewards/DogStartled.gif" },
    { minScore: 3500, imgSrc: "Sprites/Rewards/RaccoonMove.gif" },
    { minScore: 4000, imgSrc: "Sprites/Rewards/FurPile.gif" },
];


/* Set up game. */
class GameController extends ProcessTreeNode
{
    constructor()
    {
        super();

        this.rootElement = document.getElementById("game-bound");
        this.scoreElement = document.getElementById("score-display");
        this.targetElement = document.getElementById("target-icon");
        this.timerElement = document.getElementById("timer-display");

        this.rewardScreenElement = document.getElementById("reward-screen");
        this.rewardTitleElement = document.getElementById("reward-title");
        this.rewardImageElement = document.getElementById("reward-image");

        this.gameSlots = [];
        for (var slot of document.getElementsByClassName("animal-button"))
        {
            this.gameSlots.push(slot);
        }
        this.moles = [];

        // Flag to check if the game is over.
        this.gameOver = false;

        // Flag to check if the game is in a transition between turns.
        this.turnTransition = TURN_TRANSITION_NONE;

        // General purpose timer.
        this.timer = 0;

        // Current game score.
        this.score = 0;
        // The total amount of time for this turn of the game.
        this.turnDuration = 0;

        // Current number of turn of the game.
        this.turn = 0;
    }

    // Check if there is currently a turn going on.
    isInTurn()
    {
        return (!this.gameOver && (this.turnTransition == TURN_TRANSITION_NONE));
    }

    getTurnTime()
    {
        return MIN_TURN_TIME + (MAX_TURN_TIME - MIN_TURN_TIME) * Math.pow(TURN_TIME_DECAY_FACTOR, 1 - this.turn);
    }

    // Convert a duration relative to the turn duration into an actual time in seconds.
    getActualDuration(turnRelativeTime)
    {
        return turnRelativeTime * this.turnDuration;
    }

    getTurnScore()
    {
        // Gain anywhere from 50 to 150 points based on how much time has elapsed this turn.
        return (50 + 100 * (1 - (this.timer / this.turnDuration)));
    }

    // Set up the moles. Return true if successful.
    setUpMoles()
    {
        if (this.gameSlots.length != 3)
        {
            console.log("Project needs exactly 3 buttons, but has a different number");
            return false;
        }

        // Assign each mole to a random slot.
        this.moles = [
            new Penguin(0, this, this.gameSlots[0]),
            new Raccoon(1, this, this.gameSlots[1]),
            new Dog(2, this, this.gameSlots[2]),
        ];
        return true;
    }


    // Start the game.
    startGame()
    {
        this.scoreElement.textContent = "Score: " + Math.floor(this.score);
        this.targetElement.src = UNKNOWN_TARGET_SPRITE_SRC;

        for (var mole of this.moles)
        {
            mole.updateSprite();
        }

        this.timer = 0;
        this.turnDuration = this.getTurnTime();
        this.turnTransition = TURN_TRANSITION_END;
    }


    // Start end of turn processing.
    nextTurn()
    {
        // Update score.
        playSound(correctSound);
        this.score += this.getTurnScore();
        this.scoreElement.textContent = "Score: " + Math.floor(this.score);

        // Callback for the moles.
        for (var mole of this.moles)
        {
            mole.onTurnEnd();
        }

        this.timer = 0;
        this.turnTransition = TURN_TRANSITION_END;
    }


    penalize(percentagePenalty)
    {
        this.timer += this.getActualDuration(percentagePenalty);
        showPenalty(this.timerElement, percentagePenalty);
    }


    tick(delta)
    {
        super.tick(delta);

        if (!this.gameOver)
        {
            switch (this.turnTransition)
            {
                case TURN_TRANSITION_NONE:
                    {
                        this.timer += delta;
                        if (this.timer >= this.turnDuration)
                        {
                            this.timerElement.style.setProperty("--norm-fill", "0");
                            this.timer = this.turnDuration;
                            this.gameOver = true;

                            // Display game over.
                            {
                                // Get reward GIF.
                                var rewardImageSrc = "";
                                for (var reward of REWARD_TIERS)
                                {
                                    if (reward.minScore <= this.score)
                                    {
                                        rewardImageSrc = reward.imgSrc;
                                    }
                                    else break;
                                }
                                // Display reward screen.
                                this.rewardTitleElement.textContent = "You scored: " + Math.floor(this.score) + " Points!";
                                this.rewardImageElement.src = rewardImageSrc;
                                this.rewardScreenElement.style.visibility = "visible";
                                this.rewardScreenElement.style.animationName = "showRewards";
                                this.rewardScreenElement.style.animationDuration = "4s";
                            }
                        }
                        else
                        {
                            this.timerElement.style.setProperty("--norm-fill", (1 - this.timer / this.turnDuration).toString());
                        }
                    }
                    break;

                case TURN_TRANSITION_END:
                    {
                        // Only proceed with ending the turn if no moles are busy.
                        var busy = false;
                        for (var mole of this.moles)
                        {
                            if (mole.isBusy())
                            {
                                busy = true;
                                break;
                            }
                        }
                        if (!busy)
                        {
                            this.timer += delta;
                            if (this.timer >= this.getActualDuration(MOLE_RELATIVE_MOVE_TIME))
                            {
                                // Begin start of turn set up.
                                {
                                    // Move all moles into the hole.
                                    for (var mole of this.moles)
                                    {
                                        mole.setOutAmount(0);
                                    }

                                    // Randomise which mole is in which hole.
                                    var randomisedSlots = shuffleArray(this.gameSlots);
                                    for (var i = 0; i < this.moles.length; ++i)
                                    {
                                        this.moles[i].setHole(randomisedSlots[i], false);
                                    }

                                    // Increment turn counter.
                                    this.turn += 1;

                                    // Calculate the amount of time to have for the new turn.
                                    this.turnDuration = this.getTurnTime();

                                    this.targetElement.src = UNKNOWN_TARGET_SPRITE_SRC;
                                }
                                this.timer = 0;
                                this.turnTransition = TURN_TRANSITION_START;
                            }
                            else
                            {
                                for (var mole of this.moles)
                                {
                                    // Move the mole back into the hole based on transition time.
                                    mole.setOutAmount(1 - (this.timer / this.getActualDuration(MOLE_RELATIVE_MOVE_TIME)));
                                }
                            }
                        }
                    }
                    break;

                case TURN_TRANSITION_START:
                    {
                        this.timer += delta;
                        if (this.timer >= this.getActualDuration(MOLE_RELATIVE_MOVE_TIME))
                        {
                            // Finalise the start of turn setup.
                            {
                                // Move all moles out of the hole.
                                for (var mole of this.moles)
                                {
                                    mole.setOutAmount(1);
                                }

                                // Assign a random mole to click on and set the rest as incorrect.
                                for (var mole of this.moles)
                                {
                                    mole.isCorrect = false;
                                }
                                var targetMole = randomItemFromArray(this.moles);
                                targetMole.isCorrect = true;

                                // Chang the target and play a shake.
                                this.targetElement.src = targetMole.getTargetSpriteSrc();
                                this.targetElement.classList.remove("target-changed");
                                this.targetElement.offsetHeight;
                                this.targetElement.classList.add("target-changed");

                                // Callback for the moles.
                                for (var mole of this.moles)
                                {
                                    mole.onTurnStart();
                                }
                            }
                            this.timer = 0;
                            this.turnTransition = TURN_TRANSITION_NONE;
                        }
                        else
                        {
                            for (var mole of this.moles)
                            {
                                // Move the mole out of the hole based on transition time.
                                mole.setOutAmount(this.timer / this.getActualDuration(MOLE_RELATIVE_MOVE_TIME));
                            }
                            // Refill the timer bar.
                            var fill = parseFloat(this.timerElement.style.getPropertyValue("--norm-fill"));
                            this.timerElement.style.setProperty("--norm-fill", (fill + (1 - fill) * (this.timer / this.getActualDuration(MOLE_RELATIVE_MOVE_TIME))).toString());
                        }
                    }
                    break;
            }
        }
    }
}



// Start Game.
function beginGame()
{
    // Set up the game.
    var gameController = new GameController();

    // Try to set up the moles; exitting if fails.
    if (!gameController.setUpMoles()) return;

    gameController.startGame();
    
    // Set the gameController to be the root of the process tree (since it has no siblings).
    processTreeRoot = gameController;

    // Begin processing the process tree.
    startPerFrameProcessLoop();
}

window.addEventListener('load', () =>
{
    for (var animalButton of document.getElementsByClassName("animal-button"))
    {
        animalButton.onclick = beginGame;
    }
});