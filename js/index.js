// simon.js
// JavaScript version of the Simon memory game
// See here: https://en.wikipedia.org/wiki/Simon_(game)

var state = {}; // object to hold the game state
var dom = {}; // object to hold DOM nodes


state.path = []; // holds the randomly generated path
state.maxsteps = 16; // maximum number of steps in the game
state.playing = 0; // waiting. 1 is listening, 2 is player input
state.cur = 0;
state.steps = 0; // game not yet started, holds the step the player is on
state.strict = false; // strict mode is off
state.flashtime = 175; // central variable for timing of flash animation
state.tempo = 800; // pause between each step being given
state.lockout = true; // prevent clicks during sequence

dom.box = []; // array to hold the boxes that can be pressed
dom.box[0] = document.getElementById("box0");
dom.box[1] = document.getElementById("box1");
dom.box[2] = document.getElementById("box2");
dom.box[3] = document.getElementById("box3");

dom.audio = []; // array to hold the sound nodes
dom.audio[0] = document.getElementById("sound0");
dom.audio[1] = document.getElementById("sound1");
dom.audio[2] = document.getElementById("sound2");
dom.audio[3] = document.getElementById("sound3");

dom.boardcontainer = document.getElementById("boardcontainer");
dom.start = document.getElementById("start");
dom.strict = document.getElementById("strict");
dom.counter = document.getElementById("counter");

// Handle clicks in the colored button area
dom.boardcontainer.addEventListener("click", function (event)
{
    handle_click(event.target.id);
});

// Toggle strict mode
dom.strict.addEventListener("click", function () {
    state.strict = !state.strict;
    if (state.strict)
    {
        dom.strict.innerHTML = "Strict Off";
    }
    else
    {
        dom.strict.innerHTML = "Strict On";
    }
});

// Watch player clicks
var handle_click = function (clicked)
{
    if (state.lockout === true)
    {
        return;
    }
    let clicknum = parseInt(clicked.slice(3)); // number of the box clicked
    if (isNaN(clicknum)) // exit if it's a border, not a box
    {
        return;
    }
    // Check to see if that was the winning click
    if (state.path[state.cur] === clicknum && state.cur === (state.path.length -1))
    {
        state.lockout = true;
        button_press(clicknum);
        setTimeout(function () {
            victory_medley();
        }, 600);        
        counter.innerHTML = ":)";
    } // If the correct button was pressed but the game wasn't won
    else if (state.path[state.cur] === clicknum)
    {        
        button_press(clicknum);
        state.cur += 1;
        if (state.cur > state.steps)
        {
            state.lockout = true;
            state.cur = 0;
            state.steps += 1;
            setTimeout(function () {
                play_sequence();
            }, 1000);
        }
    } // Wrong button was pressed
    else 
    {
        state.lockout = true;
        dom.counter.innerHTML = "!!";
        button_press(0);
        button_press(1);
        button_press(2);
        button_press(3);
        state.cur = 0;
        if (state.strict)
        {
            create_path();
            state.steps = 0;
        }
        setTimeout(function () {
            play_sequence();
        }, 750);
    }   
};

// Listen for game start
dom.start.addEventListener("click", function (event) {
    setTimeout(function () {
        start();
    }, 200);
});

// Begin the game when start button is pressed
var start = function ()
{
    // Change start button to restart button
    if (dom.start.innerHTML === "Start")
    {
        dom.start.innerHTML = "Restart";
    }
    // reset everything
    state.cur = 0;
    state.steps = 0;
    // Create the sequence
    create_path();    
    // Play the first sound
    play_sequence();
};

// Play the current sequence
var play_sequence = function ()
{
    // Increase tempo at steps 5, 9, and 13
    if (state.steps > 3 && state.tempo > 670)
    {        
        state.tempo = 670;
        console.log("Tempo changed to " + state.tempo);
    }
    if (state.steps > 7 && state.tempo > 540)
    {
        state.tempo = 540;
        console.log("Tempo changed to " + state.tempo);
    }
    if (state.steps > 11 && state.tempo > 400)
    {
        state.tempo = 400; // fastest tempo
        console.log("Tempo changed to " + state.tempo);
    }

    let step_counter = state.steps + 1;
    if (state.steps < 9)
    {
        step_counter = "" + "0" + step_counter;
    }
    dom.counter.innerHTML = step_counter;
    state.lockout = true;
    for(let i = 0; i <= state.steps; i++)
    {
        setTimeout(function () {
            button_press(state.path[i]);
        }, i * state.tempo);
    }
    setTimeout(function () {
        state.lockout = false;
    }, state.steps * state.tempo);
};

// Reverts the color change to a box for flashing effect
var revert = function (boxnum)
{
    switch (boxnum)
    {
        case 0:
            dom.box[0].classList.remove("greenboxflash");
            dom.box[0].classList.add("greenbox");
            break;
        case 1:
            dom.box[1].classList.remove("redboxflash");
            dom.box[1].classList.add("redbox");
            break;
        case 2:
            dom.box[2].classList.remove("yellowboxflash");
            dom.box[2].classList.add("yellowbox");
            break;
        case 3:
            dom.box[3].classList.remove("blueboxflash");
            dom.box[3].classList.add("bluebox");
            break;
    }
}

// Activate a button, either because of click or computer running the pattern
var button_press = function (boxnum)
{
    dom.audio[boxnum].currentTime = 0; // prevents audio bugs at fast tempos
    dom.audio[boxnum].play();    
    switch (boxnum)
    {
        case 0:           
            dom.box[0].classList.remove("greenbox");
            dom.box[0].classList.add("greenboxflash");
            setTimeout(function ()
            {
                revert(0);
            }, state.flashtime);
            break;
        case 1:
            dom.box[1].classList.remove("redbox");
            dom.box[1].classList.add("redboxflash");
            setTimeout(function () {
                revert(1);
            }, state.flashtime);
            break;
        case 2:
            dom.box[2].classList.remove("yellowbox");
            dom.box[2].classList.add("yellowboxflash");
            setTimeout(function () {
                revert(2);
            }, state.flashtime);
            break;
        case 3:
            dom.box[3].classList.remove("bluebox");
            dom.box[3].classList.add("blueboxflash");
            setTimeout(function () {
                revert(3);
            }, state.flashtime);
            break;
    }
}

// Create a new random sequence of 20 button presses
var create_path = function ()
{
    state.path = [];
    for (let i = 0; i < state.maxsteps; i++)
    {
        state.path[i] = Math.floor(Math.random() * 4);
    }
    // Log the sequence once, for resting/debugging/cheating
    for (let j = 0; j < state.path.length; j++)
    {
        switch (state.path[j]) {
            case 0:
                console.log("" + (j + 1) + ": Green");
                break;
            case 1:
                console.log("" + (j + 1) + ": Red");
                break;
            case 2:
                console.log("" + (j + 1) + ": Yellow");
                break;
            case 3:
                console.log("" + (j + 1) + ": Blue");
                break;
        }

    }
};

// Do a jingle upon victory
var victory_medley = function ()
{
    for (let i = 0; i < 60; i++)
    {
        let next_button = i % 4;
        if (next_button === 2)
        {
            next_button = 3;
        }
        else if (next_button === 3)
        {
            next_button = 2;
        }
        setTimeout(function () {
            button_press(next_button);
        }, 75 * i);
    }
};