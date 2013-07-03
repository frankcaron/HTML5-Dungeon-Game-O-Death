/* ==============================================
 * 
 * Frank Dungeon Crawler
 * 
 * A simple HTML5 proof-of-concept game based on the 
 * simple game example provided by
 * https://github.com/lostdecade/simple_canvas_game
 * 
 * Working on it. All rights reserved, 2013.
 * 
 * ============================================== */
 
/* ==============================================
 * 
 * GAME OBJS
 * 
 * Defines the various objects used for the game
 * 
 * ============================================== */

//JSLint Placation
/*global document,window,Image,addEventListener,getMousePos,resetObstacle,renderXP,setInterval,clearInterval*/

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
canvas.style.position = "absolute";
canvas.style.top = (window.innerHeight - canvas.height) / 2 + "px";
canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () { bgReady = true; };
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () { heroReady = true; };
heroImage.src = "images/hero.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () { monsterReady = true; };
monsterImage.src = "images/monster.png";

// Obstacle image
var obstacleReady = false;
var obstacleImage = new Image();
obstacleImage.onload = function () { obstacleReady = true; };
obstacleImage.src = "images/obstacle.png";

/* ==============================================
 * 
 * GAME VARS
 * 
 * Defines the various vars used for the game
 * 
 * ============================================== */

var hero = {
	speed: 256 // movement in pixels per second
};
var classType = 0;
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
var then = Date.now();

//XP
var baseXP = 25;
var xp = 0;
var level = 0;
var xpTill = level*4 + 100;
var xpToLevel = level*4 + 100;
var xpAwarded = 0;
var xpBarWidth = 0;

//Game
var gameId;
var gameOver = false;
var gameStarted = false;
var characterSelected = false;

//Reset function
var initGame = function () {
	hero = {
		speed: 256 // movement in pixels per second
	};
	classType = 0;
	monster = {};
	monstersCaught = 0;
	obst = {};

	// Handle keyboard controls
	keysDown = {};

	// Hero position helpers
	init = true;
	blocked = false;
	placedObst = false;

	// Timer
	timer = 0;
	lastCatch = 0;
	thisCatch = 0;

	//XP
	baseXP = 25;
	xp = 0;
	level = 0;
	xpTill = level*4 + 100;
	xpAwarded = 0;
	xpBarWidth = 0;

	//Game
	gameOver = false;
	gameStarted = false;
	characterSelected = false;
	
	//Start Game
	reset();
	then = Date.now();
	gameId = setInterval(main, 1); // Execute as fast as possible
};

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
			//End game
			renderGameEnd();
		}
        
      }, false);
      
//Get the mouse's current position
function getMousePos (canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

//Track mousedown on gameover
addEventListener('mousedown', function (e) {
	
	//If you click before the game has started, start the game.
	if (!gameStarted && !gameOver) { 
		gameStarted = true; 
	} else if (!gameOver) {
	//If you click while the game is going, do your special move
		performSpecial();
	}
	
	//If you click after a game over, restart the game.
	if (gameOver) {  
		initGame();
	}
}, false);

/* ==============================================
 * 
 * GAME LOGIC
 * 
 * Describes the main game event and subsequent logic
 * 
 * ============================================== */
 

//Reset the hero if necessary
var resetHeroIfNecessary = function () {
	if (init) {
		hero.x = canvas.width / 2;
		hero.y = canvas.height / 2;
		init = false;
	}
};

//Reset the monster
var resetMonster = function () {
	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

//Reset the obstacle
var resetObstacle = function () {

	placedObst = false;
	
	while (!placedObst) {
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

// Reset the game when the player catches a monster
var reset = function () {

	//Reset the hero's position if on the first run
	resetHeroIfNecessary();
	
	//Reset the monster
	resetMonster();
	
	//Place an obstacle
	resetObstacle();
	
};

//Hit Detection - Player and gold
var detectMonsterCatch = function () {
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) { return true; } 
	return false;
};

//Hit Detection - Player and obstacle
var detectPlayerHit = function () {
	if (
		hero.x <= (obst.x + 32)
		&& obst.x <= (hero.x + 32)
		&& hero.y <= (obst.y + 32)
		&& obst.y <= (hero.y + 32)
	) { blocked = true; } else { blocked = false; }
};

//Process the level up
var levelUp = function () {
	if (xpTill <= 0) {
		level += 1;
		xpTill = level*2 + 100;
		xpToLevel = level*2 + 100;
		xp = 0;
		renderLevelUpFlash();
	}
};

//Award XP
var awardXP = function () {
	thisCatch = Math.floor(timer);
	xpAwarded = Math.floor(xp + (((lastCatch - thisCatch)*10 + baseXP) * (level/2 + 1)));
	if (xpAwarded < 0) { xpAwarded = 1; }
	
	renderXP();	
	xp += xpAwarded;
	xpTill -= xpAwarded;
	lastCatch = thisCatch;
	
	//Process level up math
	levelUp();
};

//Perform a special move
var performSpecial = function () {
	switch(classType)
	{
		case 1:
  			//Class 1
  			break;
		default:
  			//No class
  			renderLevelUpFlash();
	}
}

// Update game objects
var update = function (modifier) {
	// Hit Detection
	if ( detectMonsterCatch() ) {
		monstersCaught += 1;	
		awardXP();
		reset();
	} else { detectPlayerHit(); }
};

/* ==============================================
 * 
 * RENDERING
 * 
 * Describes the game rendering functions
 * 
 * ============================================== */
 
//Render level up flash
var renderLevelUpFlash = function () {
	var alpha = 1.0,   // full opacity
    fadeBox = setInterval(function () {
    
    	//White Flash
        ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        //Text
        ctx.fillStyle="rgba(0,0,0, " + alpha + ")";
		ctx.font = "22px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("DING!", canvas.width/2 - 25, canvas.height/2);
        
        
        alpha = alpha - 0.01; // decrease opacity (fade out)
        if (alpha < 0) {
            clearInterval(fadeBox);
        }
    }, 1); 
};

//Render the XP bar
var renderXPBar = function () {

	xpBarWidth = xp / xpToLevel;
	xpBarWidth = Math.floor(xpBarWidth * (canvas.width - 40));
	
	if (xpBarWidth > canvas.width - 40) { xpBarWidth = canvas.width - 40; }
	
	ctx.fillStyle="rgba(161,230,173,0.8)";
	ctx.fillRect(20, canvas.height - 20, xpBarWidth, 10);
	
	ctx.fillStyle="rgba(161,230,173,0.8)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("" + level, 10, canvas.height - 22);
 	
};

//Render the combo counter
var renderComboCounter = function () {
	ctx.fillStyle="rgba(161,230,173,0.8)";
	ctx.fillRect(20, 20, canvas.width - 40, 10);
};

//Render the UI
var renderUI = function () {
	
	//Timer
	ctx.fillStyle="rgba(161,230,173,0.8)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("" + Math.floor(timer), canvas.width/2 - 10, 40);
	
	//Combo
	renderComboCounter();

	//XP
	renderXPBar();
	
	//Score
	ctx.fillStyle="rgba(161,230,173,0.8)";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("" + monstersCaught, canvas.width - 20, canvas.height - 22);
};

//Render the game actors
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
};

//Render the XP indicator
var renderXP = function () {	
	var alpha = 1.0,   // full opacity
    fadeInt = setInterval(function () {
        ctx.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
        ctx.font = "12px Helvetica";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
        ctx.fillText("XP " + xpAwarded, hero.x + 4, hero.y + 40);
        alpha = alpha - 0.01; // decrease opacity (fade out)
        if (alpha < 0) {
            clearInterval(fadeInt);
        }
    }, 1); 
};

//Render the game over screen
var renderGameEnd = function () {

	ctx.fillStyle="rgba(0,0,0,0.01)";
	ctx.fillRect((canvas.width - 295)/2,(canvas.height - 195)/2,300,150);
	
	ctx.fillStyle="#DADADA";
	ctx.fillRect((canvas.width - 300)/2,(canvas.height - 200)/2,300,150);

	ctx.fillStyle = "#000000";
	ctx.font = "26px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Game Over", canvas.width/2 - 70, canvas.height/2 - 80);

	ctx.fillStyle = "#000000";
	ctx.font = "16px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + monstersCaught, canvas.width/2 - 25, canvas.height/2 - 45);
	ctx.fillText("Level: " + level, canvas.width/2 - 25, canvas.height/2 - 25);
	
	ctx.fillStyle = "#FF0000";
	ctx.font = "italic 16px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Click to retry", canvas.width/2 - 45, canvas.height/2 + 20);
	
	gameOver = true;
	cleanIntervals();
	
};

//Render the game start screen
var renderStartScreen = function () {

	ctx.fillStyle="rgba(0,0,0,0.01)";
	ctx.fillRect((canvas.width - 295)/2,(canvas.height - 295)/2,300,250);
	
	ctx.fillStyle="#DADADA";
	ctx.fillRect((canvas.width - 300)/2,(canvas.height - 300)/2,300,250);

	ctx.fillStyle = "#000000";
	ctx.font = "26px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Frank's Dungeon", canvas.width/2 - 95, canvas.height/2 - 120);
	ctx.fillText("Game O' Death", canvas.width/2 - 85, canvas.height/2 - 90);
	
	ctx.fillStyle = "#000000";
	ctx.font = "16px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	
	ctx.fillText("Gather gold; dodge death.", canvas.width/2 - 85, canvas.height/2 - 40);
	ctx.fillText("Move fast, ding more.", canvas.width/2 - 70, canvas.height/2 - 15);
	ctx.fillText("Level up to awesome.", canvas.width/2 - 70, canvas.height/2 + 10);
	
	ctx.fillStyle = "#FF0000";
	ctx.font = "italic 16px Helvetica";
	
	ctx.fillText("Click to start", canvas.width/2 - 40, canvas.height/2 + 60);
	
};

//Render the character select  screen
var renderSelectScreen = function() {

	ctx.fillStyle="rgba(0,0,0,0.01)";
	ctx.fillRect((canvas.width - 295)/2,(canvas.height - 295)/2,300,250);
	
	ctx.fillStyle="#DADADA";
	ctx.fillRect((canvas.width - 300)/2,(canvas.height - 300)/2,300,250);

	ctx.fillStyle = "#000000";
	ctx.font = "26px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Choose Your Toon", canvas.width/2 - 95, canvas.height/2 - 120);
	
	
};

//Clean up all the timers and constantly-running re-renderers
var cleanIntervals = function () {
	clearInterval(fadeInt);
	clearInterval(fadeBox);
	clearInterval(gameId);
}

// Render the game
var render = function () {
	renderActors();
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
	if (gameStarted) {
		var now = Date.now();
		var delta = now - then;

		update(delta / 1000);
		timer = timer + 0.01;
		render();

		then = now;
	
		if (gameOver) { clearInterval(gameId); }
	} else {
		renderStartScreen();
	}
};

//First Run
initGame();


