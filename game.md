Realms of The Round Rectangle
============================
_Gather gold; dodge death. Move fast, ding more. Level up to awesome._

A simple time-sensitive rogue-like destined for mobile phones.

Features:
* Frenetic rogue-like gameplay
* Procedurally-generated levels make game infinitely replayable
* Simple controls, hardcore gameplay (in the vein of The Impossible Game)
* 4 base classes, 2 specializations per, unique ability and play mechanics for each
* Leaderboards

Done
----------------------------
* Create animationFrame render engine
* Create basic game framework
* Create XP system
* Convert XP fields into XP bar
* Create a "Ding" animation
* Create a special move and subsequent animation
* Create a class section mechanic
* Create menus, icons
* Create a fade between draws after collect

To Do
----------------------------
* Combo counter instead of timer (Create a burn-down timer and integrate it as a combo meter)
* Refine balancing for leveling curve
* Procedurally generate obstacles in a maze pattern, taken into account player level
* Level up heals you, spawns more boxes
* Create a unique move for the wizard
* Introduce concept of HP
* Create a specialization selection

Classes
----------------------------
  * Warrior (5 HP)
    * Berserker (2 HP, regain HP as long as combo maxed)
  	* Paladin (3 HP, double-click to heal 1 HP at cost of 0.5 combo counter)
  * Wizard (double-click to clear obstacles but reset combo counter, 2 HP)
  	* Necromancer (1 HP, resurrect on death if combo counter maxed)
  	* Tempomancer (double-click to freeze combo counter but lose 1 HP, 3 HP)
  * Cleric (3 HP, double-click to heal HP but reset combo counter)
  	* Druid (2 HP, transform shape by double-click; different move speeds)
  	* Blood Mage (2 HP, max combo counter by dying) 
  * Thief (Double points for gold, 1 HP)
	* Assassin (Double points, Randomly dodge death 40%, 1 HP)
	* Swashbuckler (Triple points for gold, 1 HP)

