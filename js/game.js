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
var ctx_alt = canvas.getContext("2d");
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

// Hero images
var hero1Ready = false;
var hero2Ready = false;
var hero1Image = new Image();
var hero2Image = new Image();
hero1Image.onload = function () { hero1Ready = true; };
hero2Image.onload = function () { hero2Ready = true; };
hero1Image.src = "images/hero_1.png";
hero2Image.src = "images/hero_2.png";


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
var classType = 1;
var monster = {};
var monstersCaught = 0;
var obst = {};
var special = {};

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
var special_warrior_circleMaxRadius = 32;
var renderObstakillFlag = false;
var obstakill_alpha = 1.0;
var obstakill_circleMaxRadius = 32;
var obsTempX;
var obsTempY;

//Reset function
var initGame = function () {
	hero = {
		speed: 256 // movement in pixels per second
	};
	classType = 1;
	monster = {};
	monstersCaught = 0;
	obst = {};
	special = {};
	
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
	special_warrior_circleMaxRadius = 32;
	renderObstakillFlag = false;
	obstakill_alpha = 1.0;
	obstakill_circleMaxRadius = 32;
	
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
       	switch(classType)
		{
			case 1:
				hero.x = mousePos.x - hero1Image.width/2;
				hero.y = mousePos.y - hero1Image.height/2;
				break;
			case 2:
				hero.x = mousePos.x - hero2Image.width/2;
				hero.y = mousePos.y - hero2Image.height/2;
				break;
		}
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
	if (!gameStarted && !characterSelected && !gameOver) { 
		gameStarted = true; 
	} else if (gameStarted && !characterSelected && !gameOver) {
		detectClickedToon(e);
	} else if (!gameOver) {
	//If you click while the game is going, do your special move
		performSpecial();
	} 

	//If you click after a game over, restart the game.
	if (gameOver) {  
		initGame();
	}
}, false);

//Detect clicked toon for character select screen
var detectClickedToon = function(e) {
	var mousePosTemp = getMousePos(canvas, e);
	if (
		mousePosTemp.y <= (243)
		&& mousePosTemp.y >= (192)
	) {
		classType = 1;
		characterSelected = true;
	} else if (	
		mousePosTemp.y <= (281)
		&& mousePosTemp.y >= (254)
	) {
		classType = 2;
		characterSelected = true;
	}
};
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

//Hit Detection - Special move and obstacle
var detectSpecialHit = function () {
	//Determine if there is overlap between the special and an object
	//Object has 32 pixel width/height
	//Overlap between sphere will be its current
	var distanceFromSpecialToObst = (obst.x - special.x)*(obst.x - special.x) + (obst.y - special.y)*(obst.y - special.y);
	distanceFromSpecialToObst = Math.sqrt(distanceFromSpecialToObst);
	if (special_warrior_circleMaxRadius >= distanceFromSpecialToObst) { 
		killObstacle();
	} 
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
	//Compute XP based on timer
	thisCatch = Math.floor(timer);
	xpAwarded = Math.floor(xp + (((lastCatch - thisCatch)*10 + baseXP) * (level/2 + 1)));
	if (xpAwarded < 0) { xpAwarded = 1; }
		
	//Increment XP	
	xp += xpAwarded;
	xpTill -= xpAwarded;
	lastCatch = thisCatch;
	
	//Render XP
	renderXPFlag = true;
	
	//Perform level up
	levelUp();
};

//Perform a special move
var performSpecial = function () {
  	renderSpecialFlag = true;
}

//Remove the obstacle from the playboard
var killObstacle = function () {
	//Capture current position
	obsTempX = obst.x;
	obsTempY = obst.y;
	
	//Kill current obst
	obst.x = 9000;
	obst.y = 9000;
	
	//Render
	renderObstakillFlag = true;
}

// Update game objects
var update = function (modifier) {
	// Hit Detection
	if (gameStarted && characterSelected && !gameOver) {
		if ( detectMonsterCatch() ) {
			monstersCaught += 1;	
			awardXP();
			reset();
		} else { 
			detectSpecialHit();
			detectPlayerHit(); 
		}
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
 
//Render kill obstacle
var renderObstaKill = function () {
	
	//Kill special
	killSpecialRender();
	
	//Draw Explosion
	ctx.beginPath();
	ctx.arc(obsTempX + 16, obsTempY + 16, obstakill_circleMaxRadius, 0, 2 * Math.PI, false);
	ctx.lineWidth = 5;
	ctx.strokeStyle = "rgba(97, 97, 97, " + obstakill_alpha + ")";
	ctx.stroke();
	obstakill_circleMaxRadius = obstakill_circleMaxRadius + 5;
	obstakill_alpha = obstakill_alpha - 0.05 ; // decrease opacity (fade out)
	if (obstakill_alpha < 0) {
		renderObstakillFlag = false;
		obstakill_alpha = 1.0;
		obstakill_circleMaxRadius = 32;
	}
}
 
//Render \ special move
var renderSpecial = function () {
	switch(classType)
	{
		case 1:
  			//Class 1
  			renderSpecial_Warrior();
  			break;
		case 2:
  			//Class 2
  			break;
  	}
};

//Kills a special in mid-render if a mob dies
var killSpecialRender = function () {
	renderSpecialFlag = false;
    special_alpha = 1.0;
    special_warrior_circleMaxRadius = 32;
    special = {};
}

//Render no class special move
//Outward pulsing circle, player as blast radius
var renderSpecial_Warrior = function() {
		
		//Update stats
		special.x = hero.x;
		special.y = hero.y;
		special.width = 5;
		special.radius = special_warrior_circleMaxRadius;

		//Draw the circle
	    ctx.beginPath();
      	ctx.arc(hero.x + 16, hero.y + 16, special_warrior_circleMaxRadius, 0, 2 * Math.PI, false);
      	ctx.lineWidth = 5;
      	ctx.strokeStyle = "rgba(255, 0, 0, " + special_alpha + ")";
      	ctx.stroke();
    	special_warrior_circleMaxRadius = special_warrior_circleMaxRadius + 10;
    	special_alpha = special_alpha - 0.10 ; // decrease opacity (fade out)
        if (special_alpha < 0) {
            renderSpecialFlag = false;
            special_alpha = 1.0;
            special_warrior_circleMaxRadius = 32;
            special = {};
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
	if (bgReady) { ctx.drawImage(bgImage, 0, 0); }
	if (hero1Ready && hero2Ready) { 
		switch(classType)
		{
			case 1:
  				//Class 1
  				ctx.drawImage(hero1Image, hero.x, hero.y);
  				break;
  			case 2:
  				//Class 2
  				ctx.drawImage(hero2Image, hero.x, hero.y);
  				break;
  		}
	}
	if (monsterReady) { ctx.drawImage(monsterImage, monster.x, monster.y); }
	if (obstacleReady) { ctx.drawImage(obstacleImage, obst.x, obst.y); }
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
	ctx.fillText("Click to kill.", canvas.width/2 - 30, canvas.height/2 + 10);
	
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
	ctx.fillText("Choose Your Toon", canvas.width/2 - 110, canvas.height/2 - 120);
	
	ctx.font = "16px Helvetica";
	
	
	
	
	if (hero1Ready) { 
		ctx.drawImage(hero1Image, canvas.width/2 - 90, canvas.height/2 - 50); 
		ctx.fillText("Warrior", canvas.width/2 - 40, canvas.height/2 - 40);
	}
	if (hero2Ready) { 
		ctx.drawImage(hero2Image, canvas.width/2 - 90, canvas.height/2 + 10); 
		ctx.fillText("Mage", canvas.width/2 - 40, canvas.height/2 + 20);
	}
	
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
	if (renderObstakillFlag) {
		renderObstaKill();
	}
};

//Render menus
var renderMenus = function() {
	if (!gameStarted && !characterSelected) {
		renderStartScreen();
	}
	if (gameStarted && !characterSelected) {
		renderSelectScreen();
	}
	if (gameOver) {
		renderGameEnd();
	}
};

// Render the game
var render = function () {
	//If the game hasn't started or is over, clear the screen and render the menus...
	if (!gameStarted || !characterSelected || gameOver) {
		renderClear();
		renderMenus();
	//Otherwise, render the game
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


