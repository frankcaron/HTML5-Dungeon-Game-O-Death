/* ==============================================
 * 
 * Frank Dungeon Crawler
 * 
 * A simple HTML5 proof-of-concept game based on the 
 * simple game example provided by
 * https://github.com/lostdecade/simple_canvas_game
 * 
 * Working on it
 * 
 * ============================================== */
 

/* ==============================================
 * 
 * GAME VARS AND OBJS
 * 
 * Defines the various objects and vars used for the game
 * 
 * ============================================== */

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};

//Initial hero position flag
var init = true;

//Timer
var timer = 0;

/* ==============================================
 * 
 * GAME CONTROLS
 * 
 * Describes the controls and listeners
 * 
 * ============================================== */

// Track The Mouse
addEventListener('mousemove', function(e) {
        var mousePos = getMousePos(canvas, e);
        
       	//Move the hero to match the mouse
		hero.x = mousePos.x - heroImage.width/2;
		hero.y = mousePos.y - heroImage.height/2;
        
      }, false);
      
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

/* ==============================================
 * 
 * GAME LOGIC
 * 
 * Describes the main game event and subsequent logic
 * 
 * ============================================== */



// Reset the game when the player catches a monster
var reset = function () {
	//Reset the hero's position if on the first run
	if (init) {
		hero.x = canvas.width / 2;
		hero.y = canvas.height / 2;
		init = false;
	}

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {

	// Hit Detection
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}
};

/* ==============================================
 * 
 * RENDERING
 * 
 * Describes the game rendering functions
 * 
 * ============================================== */

var renderUI = function () {
	ctx.fillStyle = "#000000";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + monstersCaught, 32, 32);
	ctx.fillText("Timer: " + Math.floor(timer), 32, 64);
}

var renderActors = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}
}

// Draw everything
var render = function () {
	// Actors
	renderActors();

	// UI
	renderUI();
	
};

/* ==============================================
 * 
 * GAME BOOTSTRAP
 * 
 * Describes the main game event and subsequent logic
 * 
 * ============================================== */

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	timer = timer + 0.01;
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
setInterval(main, 1); // Execute as fast as possible