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
var xp_alpha = 1.0;
var ding_alpha = 1.0;

//Game
var gameId;
var gameOver = false;
var gameStarted = false;
var characterSelected = false;

//Effects
var renderDingFlag = false;
var renderSpecialFlag = false;
var renderXPFlag = false;
var special_alpha = 1.0;
var special_noclass_circleMaxRadius = 32;

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
	xp_alpha = 1.0;
	ding_alpha = 1.0;

	//Game
	gameOver = false;
	gameStarted = false;
	characterSelected = false;
	
	//Effects
	renderDingFlag = false;
	renderSpecialFlag = false;
	renderXPFlag = false;
	special_alpha = 1.0;
	special_noclass_circleMaxRadius = 32;
	
	//Start Game
	reset();
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
	) { 
		blocked = true; 
		gameOver = true; 
	} else { blocked = false; }
};

//Process the level up
var levelUp = function () {
	if (xpTill <= 0) {
		level += 1;
		xpTill = level*2 + 100;
		xpToLevel = level*2 + 100;
		xp = 0;
		
		//Render Ding	
		renderDingFlag = true;
	}
};

//Award XP
var awardXP = function () {
	thisCatch = Math.floor(timer);
	xpAwarded = Math.floor(xp + (((lastCatch - thisCatch)*10 + baseXP) * (level/2 + 1)));
	if (xpAwarded < 0) { xpAwarded = 1; }
		
	//Increment XP	
	xp += xpAwarded;
	xpTill -= xpAwarded;
	lastCatch = thisCatch;
	
	//Render XP
	renderXPFlag = true;
	
	//Process level up math
	levelUp();
};

//Perform a special move
var performSpecial = function () {
  	renderSpecialFlag = true;
}

// Update game objects
var update = function (modifier) {
	// Hit Detection
	if (gameStarted && !gameOver) {
		if ( detectMonsterCatch() ) {
			monstersCaught += 1;	
			awardXP();
			reset();
		} else { detectPlayerHit(); }
	}
};

/* ==============================================
 * 
 * RENDERING
 * 
 * Describes the game rendering functions
 * 
 * ============================================== */
 
 //Clear the screen
var renderClear = function() {
	ctx.fillStyle="#FFFFFF";
	ctx.fillRect(0,0,canvas.width,canvas.height);
}
 
//Render \ special move
var renderSpecial = function () {
	switch(classType)
	{
		case 1:
  			//Class 1
  			alert("lol, you idiot");
  			break;
		default:
  			renderSpecial_NoClass();
  			break;
  	}
};

//Render no class special move
var renderSpecial_NoClass = function() {
	    ctx.beginPath();
      	ctx.arc(hero.x + 16, hero.y + 16, special_noclass_circleMaxRadius, 0, 2 * Math.PI, false);
      	ctx.lineWidth = 5;
      	ctx.strokeStyle = "rgba(255, 0, 0, " + special_alpha + ")";
      	ctx.stroke();
    	special_noclass_circleMaxRadius = special_noclass_circleMaxRadius + 5;
    	special_alpha = special_alpha - 0.10 ; // decrease opacity (fade out)
        if (special_alpha < 0) {
            renderSpecialFlag = false;
            special_alpha = 1.0;
            special_noclass_circleMaxRadius = 32;
        }
}; 
 
//Render level up flash
var renderLevelUpFlash = function () {
    ctx.fillStyle = "rgba(255, 255, 255, " + ding_alpha + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle="rgba(0,0,0, " + ding_alpha + ")";
	ctx.font = "22px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("DING!", canvas.width/2 - 25, canvas.height/2);
    ding_alpha = ding_alpha - 0.05; // decrease opacity (fade out)
    if (ding_alpha < 0) {
    	renderDingFlag = false;
    	ding_alpha = 1.0;
    } 
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
	ctx.fillStyle = "rgba(255, 0, 0, " + xp_alpha + ")";
	ctx.font = "12px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("XP " + xpAwarded, hero.x + 4, hero.y + 40);
	xp_alpha = xp_alpha - 0.05; // decrease opacity (fade out)
	if (xp_alpha < 0) {
		renderXPFlag = false;
		xp_alpha = 1.0;
	}
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

//Render the game effects if necessary
var renderEffects = function () {

	if (renderDingFlag) {
		renderLevelUpFlash();
	}
	if (renderSpecialFlag) {
		renderSpecial();
	}
	if (renderXPFlag) {
		renderXP();
	}
	
}
//Render menus
var renderMenus = function() {
	if (!gameStarted) {
		renderStartScreen();
	}
	if (gameOver) {
		renderGameEnd();
	}
}

// Render the game
var render = function () {
	if (!gameStarted || gameOver) {
		renderClear();
		renderMenus();
	} else {
		renderActors();
		renderUI();
		renderEffects();
	}
};

/* ==============================================
 * 
 * GAME AND RENDER LOOPS
 * 
 * Describes the main game event and subsequent logic
 * 
 * ============================================== */

//The main game loop
var mainloop = function() {

	//Capture date to throttle the game logic updates
	var now = Date.now();
	var delta = now - then;
	
	//Process the game logic
	update(delta / 1000);
	
	//Update the in-game timer
	timer = timer + 0.01;
	
	//Render the visuals
	render();
	
	//Update the time for game logic throttling
	then = now;

};

//Animation functions
var animFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		null ;

var recursiveAnim = function() {
	mainloop();
	animFrame( recursiveAnim );
};

/* ==============================================
 * 
 * GAME BOOTSTRAP
 * 
 * Describes the main game event and subsequent logic
 * 
 * ============================================== */

//Start the main loop and initialize the game vars
animFrame( recursiveAnim );
initGame();


