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

// Obstacle image
var obstacleReady = false;
var obstacleImage = new Image();
obstacleImage.onload = function () {
	obstacleReady = true;
};
obstacleImage.src = "images/obstacle.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;
var obst = {};

// Handle keyboard controls
var keysDown = {};

// Hero position helpers
var init = true;
var blocked = false;
var placedObst = false;

// Timer
var timer = 0;
var lastCatch = 0;
var thisCatch = 0;

//XP
var baseXP = 10;
var xp = 0;
var level = 0;
var xpTill = level*4 + 100;

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
        
        if (!blocked) {
       		//Move the hero to match the mouse
			hero.x = mousePos.x - heroImage.width/2;
			hero.y = mousePos.y - heroImage.height/2;
		} else {

			document.write("Game Over<br />");
			document.write("<br />Level: " + level);
			document.write("<br />Kills: " + monstersCaught);
		}
        
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
	
	//Reset Obst
	placedObst = false;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
	
	while (!placedObst) {
		
		// Throw the monster somewhere on the screen randomly
		obst.x = 32 + (Math.random() * (canvas.width - 64));
		obst.y = 32 + (Math.random() * (canvas.height - 64));
	
		if (
			hero.x <= (obst.x + 32)
			&& obst.x <= (hero.x + 32)
			&& hero.y <= (obst.y + 32)
			&& obst.y <= (hero.y + 32)
		) {
			placedObst = false;
		} else { placedObst = true; }
	}
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
		thisCatch = Math.floor(timer);
		xpTill -= Math.floor(xp + ((lastCatch - thisCatch + baseXP) * (level/2 + 1)));
		if (xpTill <= 0) {
			level++;
			xpTill = level*2 + 100;
		}
		lastCatch = thisCatch;
		reset();
	} else if (
		hero.x <= (obst.x + 32)
		&& obst.x <= (hero.x + 32)
		&& hero.y <= (obst.y + 32)
		&& obst.y <= (hero.y + 32)
	) {
		blocked = true;
	} else { blocked = false; }
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
	ctx.font = "16px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + monstersCaught, 32, 10);
	ctx.fillText("Timer: " + Math.floor(timer), 32, 30);
	ctx.fillText("Level: " + level, 32, 50);
	ctx.fillText("Next: " + xpTill, 32, 70);
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
	
	if (obstacleReady) {
		ctx.drawImage(obstacleImage, obst.x, obst.y);
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