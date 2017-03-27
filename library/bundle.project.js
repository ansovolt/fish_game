require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Background":[function(require,module,exports){
"use strict";
cc._RFpush(module, '91824BtPFNCi5xQ9z3t8Hfe', 'Background');
// scripts/Background.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.xSpeed = 100;
        this.moving = false;
    },

    startMoving: function startMoving() {
        this.moving = true;
    },

    stopMoving: function stopMoving() {
        this.moving = false;
    },

    getX: function getX() {
        return this.node.x;
    },
    getY: function getY() {
        return this.node.y;
    },

    resetPosition: function resetPosition() {
        this.node.x = 2745;
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.moving) {
            this.node.x -= this.xSpeed * dt;
        }
    }
});

cc._RFpop();
},{}],"Fish":[function(require,module,exports){
"use strict";
cc._RFpush(module, '642ef5bpGdB+KonbeesiNA+', 'Fish');
// scripts/Fish.js



cc.Class({
    'extends': cc.Component,

    properties: {

        pickRadius: 0,

        game: {
            'default': null,
            serializable: false
        }
    },

    onLoad: function onLoad() {
        this.enabled = false;
        this.xSpeed = 100;
        this.moving = false;
    },

    // use this for initialization
    init: function init(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },

    reuse: function reuse(game) {
        this.init(game);
    },

    getPlayerDistance: function getPlayerDistance() {

        var playerPos = this.game.player.getCenterPos();

        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {

        cc.log('finsh:onPicked');
        var pos = this.node.getPosition();

        this.game.gainScore(pos);

        this.game.despawnFish(this.node);
    },

    // called every frame
    update: function update(dt) {

        if (this.getPlayerDistance() < this.pickRadius) {

            this.onPicked();
            return;
        }

        // var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        // var minOpacity = 50;
        // this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));

        if (this.moving) {
            this.node.x -= this.xSpeed * dt;
        }
    },
    startMoving: function startMoving() {
        this.moving = true;
    },

    stopMoving: function stopMoving() {
        this.moving = false;
    },

    getX: function getX() {
        return this.node.x;
    },
    getY: function getY() {
        return this.node.y;
    },

    resetPosition: function resetPosition() {
        this.node.x = 2745;
    }
});

cc._RFpop();
},{}],"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '0486fOqHrJN+6c5PQg5FHh9', 'Game');
// scripts/Game.js

var Player = require('Player');
var Background = require('Background');
var ScoreFX = require('ScoreFX');
var Fish = require('Fish');
var RockMonster = require('RockMonster');

var Game = cc.Class({
    'extends': cc.Component,

    properties: {

        scoreFXPrefab: {
            'default': null,
            type: cc.Prefab
        },
        fishPrefab: {
            'default': null,
            type: cc.Prefab
        },
        rockMonsterPrefab: {
            'default': null,
            type: cc.Prefab
        },
        maxStarDuration: 0,
        minStarDuration: 0,

        ground: {
            'default': null,
            type: cc.Node
        },

        player: {
            'default': null,
            type: Player
        },

        bg: {
            'default': null,
            type: Background
        },

        scoreDisplay: {
            'default': null,
            type: cc.Label
        },

        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        },
        splash1Audio: {
            'default': null,
            url: cc.AudioClip
        },
        btnNode: {
            'default': null,
            type: cc.Node
        },
        gameOverNode: {
            'default': null,
            type: cc.Node
        },
        controlHintLabel: {
            'default': null,
            type: cc.Label
        },
        keyboardHint: {
            'default': '',
            multiline: true
        },
        touchHint: {
            'default': '',
            multiline: true
        }
    },

    // use this for initialization
    onLoad: function onLoad() {

        this.groundY = this.ground.y + this.ground.height / 2;
        this.groundX = this.node.x - this.node.width + this.player.node.width; //- cc.Canvas.width/2 + 20;

        this.timer = 0;
        this.starDuration = 0;

        // is showing menu or running game
        this.isRunning = false;

        // initialize control hint
        var hintText = cc.sys.isMobile ? this.touchHint : this.keyboardHint;
        this.controlHintLabel.string = hintText;
    },

    onStartGame: function onStartGame() {

        // this.resetScore();
        // set game state to running
        this.isRunning = true;
        // set button and gameover text out of screen
        this.btnNode.setPositionX(3000);
        this.gameOverNode.active = false;
        // reset player position and move speed
        this.player.startMoveAt(cc.p(this.groundX, this.groundY));

        console.log(this.groundX + ',' + this.groundY);

        cc.audioEngine.playEffect(this.splash1Audio, false);

        this.initScene();
    },

    initScene: function initScene() {

        cc.log("initScene");

        //start game timer
        this.startTimer();

        //reset background position
        this.bg.resetPosition();

        this.player.resetPosition();

        //place fish
        var lastFishX = 0;
        this.fishAr = [];
        for (var i = 0; i < 20; i++) {
            var fish = cc.instantiate(this.fishPrefab);
            var newFishPosition = this.getNewFishPosition(lastFishX);
            lastFishX = newFishPosition.x;
            fish.setPosition(newFishPosition);
            this.fishAr.push(fish);
            this.node.addChild(fish);
            fish.getComponent('Fish').init(this);
            fish.getComponent('Fish').startMoving();
        }

        //place rocks
        var lastRockMonsterX = 0;
        this.rockMonsterAr = [];
        for (var j = 0; j < 20; j++) {
            var rm = cc.instantiate(this.rockMonsterPrefab);
            var newPosition = this.getNewRockMonsterPosition(lastRockMonsterX);
            lastRockMonsterX = newPosition.x;
            rm.setPosition(newPosition);
            this.rockMonsterAr.push(rm);
            this.node.addChild(rm);
            rm.getComponent('RockMonster').init(this);
            rm.getComponent('RockMonster').startMoving();
        }

        this.bg.startMoving();
    },

    startTimer: function startTimer() {
        //this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.starDuration = 5;
        this.timer = 0;
    },

    despawnFish: function despawnFish(fish) {
        //this.scorePool.put(scoreFX);
    },

    getNewFishPosition: function getNewFishPosition(fromX) {

        var randX = fromX + 150 + cc.random0To1() * 200;
        var randY = this.groundY + cc.random0To1() * 100;

        return cc.p(randX, randY);
    },

    getNewRockMonsterPosition: function getNewRockMonsterPosition(fromX) {

        var randX = fromX + 350 + cc.random0To1() * 300;
        var randY = this.ground.y + 100; //- this.ground.hight / 2;

        return cc.p(randX, randY);
    },

    gainScore: function gainScore(pos) {

        cc.log('gainScore');

        this.score += 1;

        this.scoreDisplay.string = 'Score: ' + this.score.toString();

        var fx = this.spawnScoreFX();
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();

        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    resetScore: function resetScore() {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
    },

    spawnScoreFX: function spawnScoreFX() {
        var fx;
        if (this.scorePool.size() > 0) {
            fx = this.scorePool.get();
            return fx.getComponent('ScoreFX');
        } else {
            fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX');
            fx.init(this);
            return fx;
        }
    },

    despawnScoreFX: function despawnScoreFX(scoreFX) {
        this.scorePool.put(scoreFX);
    },

    // called every frame
    update: function update(dt) {
        if (!this.isRunning) return;

        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;

        //cc.log(this.bg.getX()+','+this.bg.getY());
    },

    gameOver: function gameOver() {

        cc.log('gameOver');

        this.gameOverNode.active = true;
        this.player.enabled = false;
        this.player.stopMove();
        //this.player.hide();
        //this.player.destroy();

        for (var i = 0; i < this.fishAr.length; i++) {
            var fish = this.fishAr[i];
            this.node.removeChild(fish);
            fish.getComponent('Fish').stopMoving();
            fish.destroy();
        }
        this.fishAr = [];

        for (var j = 0; j < this.rockMonsterAr.length; j++) {
            var rm = this.rockMonsterAr[j];
            this.node.removeChild(rm);
            rm.getComponent('RockMonster').stopMoving();
            rm.destroy();
        }
        this.rockMonsterAr = [];

        this.isRunning = false;
        this.btnNode.setPositionX(0);
        this.bg.stopMoving();
    }
});

cc._RFpop();
},{"Background":"Background","Fish":"Fish","Player":"Player","RockMonster":"RockMonster","ScoreFX":"ScoreFX"}],"Player":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'c10bbPdGYhDWaLoKLV38bHf', 'Player');
// scripts/Player.js

cc.Class({
    'extends': cc.Component,

    properties: {

        jumpHeight: 0,

        jumpDuration: 0,

        squashDuration: 0,

        maxMoveSpeed: 0,

        accel: 0,

        jumpAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.enabled = false;

        this.accLeft = false;
        this.accRight = false;

        this.xSpeed = 0;
        // screen boundaries
        this.minPosX = -this.node.parent.width / 2;
        this.maxPosX = this.node.parent.width / 2;

        this.jumpAction = this.setJumpAction();

        this.setInputControl();
    },

    setInputControl: function setInputControl() {
        var self = this;
        //add keyboard input listener to jump, turnLeft and turnRight
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // set a flag when key pressed
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            // unset a flag when key released
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);

        // touch input
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function onTouchBegan(touch, event) {
                var touchLoc = touch.getLocation();
                if (touchLoc.x >= cc.winSize.width / 2) {
                    self.accLeft = false;
                    self.accRight = true;
                } else {
                    self.accLeft = true;
                    self.accRight = false;
                }
                // don't capture the event
                return true;
            },
            onTouchEnded: function onTouchEnded(touch, event) {
                self.accLeft = false;
                self.accRight = false;
            }
        }, self.node);
    },

    setJumpAction: function setJumpAction() {

        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());

        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());

        var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);

        var callback = cc.callFunc(this.playJumpSound, this);

        return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
    },

    playJumpSound: function playJumpSound() {

        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    getCenterPos: function getCenterPos() {

        cc.log('player:getCenterPos');
        var centerPos = cc.p(this.node.x, this.node.y + this.node.height / 2);
        return centerPos;
    },

    startMoveAt: function startMoveAt(pos) {
        this.enabled = true;
        this.xSpeed = 0;
        this.node.setPosition(pos);
        this.node.runAction(this.setJumpAction());
    },

    resetPosition: function resetPosition() {},

    stopMove: function stopMove() {
        this.node.stopAllActions();
    },

    // called every frame
    update: function update(dt) {

        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }

        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        this.node.x += this.xSpeed * dt;

        // limit player position inside screen
        if (this.node.x > this.node.parent.width / 2) {
            this.node.x = this.node.parent.width / 2;
            this.xSpeed = 0;
        } else if (this.node.x < -this.node.parent.width / 2) {
            this.node.x = -this.node.parent.width / 2;
            this.xSpeed = 0;
        }
    }
});

cc._RFpop();
},{}],"RockMonster":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'cc71bzS5WBOO7gp+UNpF2ke', 'RockMonster');
// scripts/RockMonster.js

cc.Class({
    "extends": cc.Component,

    properties: {

        pickRadius: 0,

        game: {
            "default": null,
            serializable: false
        }
    },

    onLoad: function onLoad() {
        this.enabled = false;
        this.xSpeed = 100;
        this.moving = false;
    },

    // use this for initialization
    init: function init(game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },

    reuse: function reuse(game) {
        this.init(game);
    },

    getPlayerDistance: function getPlayerDistance() {

        var playerPos = this.game.player.getCenterPos();

        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        var pos = this.node.getPosition();

        this.game.gainScore(pos);

        this.game.despawnStar(this.node);
    },

    // called every frame
    update: function update(dt) {

        if (this.getPlayerDistance() < this.pickRadius) {

            this.onPicked();
            return;
        }

        // var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        // var minOpacity = 50;
        // this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));

        if (this.moving) {
            this.node.x -= this.xSpeed * dt;
        }
    },
    startMoving: function startMoving() {
        this.moving = true;
    },

    stopMoving: function stopMoving() {
        this.moving = false;
    },

    getX: function getX() {
        return this.node.x;
    },
    getY: function getY() {
        return this.node.y;
    },

    resetPosition: function resetPosition() {
        this.node.x = 2745;
    }
});

cc._RFpop();
},{}],"ScoreAnim":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'b1f9e88YHdGr7qD17shtr2w', 'ScoreAnim');
// scripts/ScoreAnim.js

cc.Class({
    "extends": cc.Component,

    init: function init(scoreFX) {
        this.scoreFX = scoreFX;
    },

    hideFX: function hideFX() {
        this.scoreFX.despawn();
    }
});

cc._RFpop();
},{}],"ScoreFX":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'dd18c67pr9OM5wJb/yY6Onf', 'ScoreFX');
// scripts/ScoreFX.js

cc.Class({
    'extends': cc.Component,

    properties: {
        anim: {
            'default': null,
            type: cc.Animation
        }
    },

    init: function init(game) {
        this.game = game;
        this.anim.getComponent('ScoreAnim').init(this);
    },

    despawn: function despawn() {
        this.game.despawnScoreFX(this.node);
    },

    play: function play() {
        this.anim.play('score_pop');
    }
});

cc._RFpop();
},{}]},{},["Background","Fish","Game","Player","RockMonster","ScoreAnim","ScoreFX"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IgMi5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9CYWNrZ3JvdW5kLmpzIiwiYXNzZXRzL3NjcmlwdHMvRmlzaC5qcyIsImFzc2V0cy9zY3JpcHRzL0dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9QbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9Sb2NrTW9uc3Rlci5qcyIsImFzc2V0cy9zY3JpcHRzL1Njb3JlQW5pbS5qcyIsImFzc2V0cy9zY3JpcHRzL1Njb3JlRlguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNJO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDSTtBQUNJO0FBQ0E7QUFDQTtBQUNSO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0o7QUFDUTtBQUNBO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNZO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUTtBQUNJO0FBQ1o7QUFDQTtBQUVJO0FBQ0k7QUFBUjtBQUNBO0FBRUk7QUFDSTtBQUFSO0FBQ0E7QUFFSTtBQUNJO0FBQVI7QUFFSTtBQUNJO0FBQVI7QUFDQTtBQUVJO0FBQ0k7QUFBUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBRVE7QUFDQTtBQUFSO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFDQTtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBQ0E7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUNBO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFDQTtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBQ0E7QUFDQTtBQUNBO0FBRUk7QUFBSjtBQUVRO0FBQ0E7QUFBUjtBQUdRO0FBQ0E7QUFEUjtBQUNBO0FBR1E7QUFEUjtBQUNBO0FBR1E7QUFDQTtBQURSO0FBQ0E7QUFJSTtBQUZKO0FBQ0E7QUFDQTtBQUlRO0FBRlI7QUFJUTtBQUNBO0FBRlI7QUFJUTtBQUZSO0FBSVE7QUFGUjtBQUlRO0FBRlI7QUFJUTtBQUZSO0FBQ0E7QUFPSTtBQUxKO0FBT1E7QUFMUjtBQUNBO0FBT1E7QUFMUjtBQUNBO0FBT1E7QUFMUjtBQU9RO0FBTFI7QUFDQTtBQU9RO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMWjtBQUNBO0FBQ0E7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STtBQUFaO0FBQ0E7QUFHSTtBQUNJO0FBRFI7QUFDQTtBQUdJO0FBQ0k7QUFEUjtBQUNBO0FBR0k7QUFDSTtBQURSO0FBR0k7QUFDSTtBQURSO0FBQ0E7QUFHSTtBQUNJO0FBRFI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDSTtBQUNKO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDSTtBQUNKO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDSTtBQUNJO0FBQ0E7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnhTcGVlZCA9IDEwMDtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgc3RhcnRNb3Zpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgc3RvcE1vdmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIH0sXG4gICAgXG4gICAgZ2V0WDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZS54O1xuICAgIH0sXG4gICAgZ2V0WTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZS55O1xuICAgIH0sXG4gICAgXG4gICAgcmVzZXRQb3NpdGlvbjogZnVuY3Rpb24gKCl7XG4gICAgICAgIHRoaXMubm9kZS54ID0gMjc0NTsgIFxuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIGlmICh0aGlzLm1vdmluZykge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggLT0gdGhpcy54U3BlZWQgKiBkdDtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiIsIlxuXG5jYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICBcbiAgICAgICAgcGlja1JhZGl1czogMCxcbiAgICAgIFxuICAgICAgICBnYW1lOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgc2VyaWFsaXphYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy54U3BlZWQgPSAxMDA7XG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIGluaXQ6IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgIH0sXG5cbiAgICByZXVzZSAoZ2FtZSkge1xuICAgICAgICB0aGlzLmluaXQoZ2FtZSk7XG4gICAgfSxcblxuICAgIGdldFBsYXllckRpc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG4gICAgXG4gICAgICAgIHZhciBwbGF5ZXJQb3MgPSB0aGlzLmdhbWUucGxheWVyLmdldENlbnRlclBvcygpO1xuICAgICAgIFxuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG5cbiAgICBvblBpY2tlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIFxuICAgICAgICBjYy5sb2coJ2ZpbnNoOm9uUGlja2VkJyk7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgIFxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKHBvcyk7XG4gICAgICAgXG4gICAgICAgIHRoaXMuZ2FtZS5kZXNwYXduRmlzaCh0aGlzLm5vZGUpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGxheWVyRGlzdGFuY2UoKSA8IHRoaXMucGlja1JhZGl1cykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm9uUGlja2VkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICBcbiAgICAgICAgLy8gdmFyIG9wYWNpdHlSYXRpbyA9IDEgLSB0aGlzLmdhbWUudGltZXIvdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcbiAgICAgICAgLy8gdmFyIG1pbk9wYWNpdHkgPSA1MDtcbiAgICAgICAgLy8gdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8gKiAoMjU1IC0gbWluT3BhY2l0eSkpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMubW92aW5nKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCAtPSB0aGlzLnhTcGVlZCAqIGR0O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0sXG4gICAgc3RhcnRNb3Zpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgIH0sXG4gICAgXG4gICAgc3RvcE1vdmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIH0sXG4gICAgXG4gICAgZ2V0WDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZS54O1xuICAgIH0sXG4gICAgZ2V0WTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZS55O1xuICAgIH0sXG4gICAgXG4gICAgcmVzZXRQb3NpdGlvbjogZnVuY3Rpb24gKCl7XG4gICAgICAgIHRoaXMubm9kZS54ID0gMjc0NTsgIFxuICAgIH0sXG59KTsiLCJjb25zdCBQbGF5ZXIgPSByZXF1aXJlKCdQbGF5ZXInKTtcbmNvbnN0IEJhY2tncm91bmQgPSByZXF1aXJlKCdCYWNrZ3JvdW5kJyk7XG5jb25zdCBTY29yZUZYID0gcmVxdWlyZSgnU2NvcmVGWCcpO1xuY29uc3QgRmlzaCA9IHJlcXVpcmUoJ0Zpc2gnKTtcbmNvbnN0IFJvY2tNb25zdGVyID0gcmVxdWlyZSgnUm9ja01vbnN0ZXInKTtcblxudmFyIEdhbWUgPSBjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgXG5cbiAgICAgICAgc2NvcmVGWFByZWZhYjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuICAgICAgICBmaXNoUHJlZmFiOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIHJvY2tNb25zdGVyUHJlZmFiOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIG1heFN0YXJEdXJhdGlvbjogMCxcbiAgICAgICAgbWluU3RhckR1cmF0aW9uOiAwLFxuICAgICAgXG4gICAgICAgIGdyb3VuZDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgIFxuICAgICAgICBwbGF5ZXI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBQbGF5ZXJcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIGJnOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogQmFja2dyb3VuZFxuICAgICAgICB9LFxuICAgICAgXG4gICAgICAgIHNjb3JlRGlzcGxheToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgIFxuICAgICAgICBzY29yZUF1ZGlvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfSxcbiAgICAgICAgc3BsYXNoMUF1ZGlvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfSxcbiAgICAgICAgYnRuTm9kZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgZ2FtZU92ZXJOb2RlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBjb250cm9sSGludExhYmVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICAgICAgfSxcbiAgICAgICAga2V5Ym9hcmRIaW50OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIG11bHRpbGluZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICB0b3VjaEhpbnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICAgICAgbXVsdGlsaW5lOiB0cnVlXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgIFxuICAgICAgICB0aGlzLmdyb3VuZFkgPSB0aGlzLmdyb3VuZC55ICsgdGhpcy5ncm91bmQuaGVpZ2h0LzI7XG4gICAgICAgIHRoaXMuZ3JvdW5kWCA9IHRoaXMubm9kZS54IC0gdGhpcy5ub2RlLndpZHRoICsgdGhpcy5wbGF5ZXIubm9kZS53aWR0aCA7Ly8tIGNjLkNhbnZhcy53aWR0aC8yICsgMjA7XG5cbiAgICAgXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG5cbiAgICAgICAgLy8gaXMgc2hvd2luZyBtZW51IG9yIHJ1bm5pbmcgZ2FtZVxuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgY29udHJvbCBoaW50XG4gICAgICAgIHZhciBoaW50VGV4dCA9IGNjLnN5cy5pc01vYmlsZSA/IHRoaXMudG91Y2hIaW50IDogdGhpcy5rZXlib2FyZEhpbnQ7XG4gICAgICAgIHRoaXMuY29udHJvbEhpbnRMYWJlbC5zdHJpbmcgPSBoaW50VGV4dDtcblxuICAgIH0sXG5cbiAgICBvblN0YXJ0R2FtZTogZnVuY3Rpb24gKCkge1xuICAgICAgIFxuICAgICAgICAvLyB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgICAgLy8gc2V0IGdhbWUgc3RhdGUgdG8gcnVubmluZ1xuICAgICAgICB0aGlzLmlzUnVubmluZyA9IHRydWU7XG4gICAgICAgIC8vIHNldCBidXR0b24gYW5kIGdhbWVvdmVyIHRleHQgb3V0IG9mIHNjcmVlblxuICAgICAgICB0aGlzLmJ0bk5vZGUuc2V0UG9zaXRpb25YKDMwMDApO1xuICAgICAgICB0aGlzLmdhbWVPdmVyTm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8gcmVzZXQgcGxheWVyIHBvc2l0aW9uIGFuZCBtb3ZlIHNwZWVkXG4gICAgICAgIHRoaXMucGxheWVyLnN0YXJ0TW92ZUF0KGNjLnAodGhpcy5ncm91bmRYLCB0aGlzLmdyb3VuZFkpKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZ3JvdW5kWCsnLCcrdGhpcy5ncm91bmRZKTtcbiAgICAgICAgXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5zcGxhc2gxQXVkaW8sIGZhbHNlKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdFNjZW5lKCk7XG4gICAgICAgIFxuICAgICAgIFxuICAgIH0sXG5cblxuICAgIGluaXRTY2VuZTogZnVuY3Rpb24oKXtcbiAgICAgICAgXG4gICAgICAgIGNjLmxvZyhcImluaXRTY2VuZVwiKTtcbiAgICAgICAgXG4gICAgICAgIC8vc3RhcnQgZ2FtZSB0aW1lclxuICAgICAgICB0aGlzLnN0YXJ0VGltZXIoKTtcbiAgICAgICAgXG4gICAgICAgIC8vcmVzZXQgYmFja2dyb3VuZCBwb3NpdGlvblxuICAgICAgICB0aGlzLmJnLnJlc2V0UG9zaXRpb24oKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMucGxheWVyLnJlc2V0UG9zaXRpb24oKTtcbiAgICAgICAgXG4gICAgICAgIC8vcGxhY2UgZmlzaFxuICAgICAgICB2YXIgbGFzdEZpc2hYID0gMDtcbiAgICAgICAgdGhpcy5maXNoQXIgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMDsgaSsrKXtcbiAgICAgICAgICAgIHZhciBmaXNoID0gY2MuaW5zdGFudGlhdGUodGhpcy5maXNoUHJlZmFiKTtcbiAgICAgICAgICAgIHZhciBuZXdGaXNoUG9zaXRpb24gPSB0aGlzLmdldE5ld0Zpc2hQb3NpdGlvbihsYXN0RmlzaFgpO1xuICAgICAgICAgICAgbGFzdEZpc2hYID0gbmV3RmlzaFBvc2l0aW9uLng7XG4gICAgICAgICAgICBmaXNoLnNldFBvc2l0aW9uKG5ld0Zpc2hQb3NpdGlvbik7XG4gICAgICAgICAgICB0aGlzLmZpc2hBci5wdXNoKGZpc2gpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKGZpc2gpO1xuICAgICAgICAgICAgZmlzaC5nZXRDb21wb25lbnQoJ0Zpc2gnKS5pbml0KHRoaXMpO1xuICAgICAgICAgICAgZmlzaC5nZXRDb21wb25lbnQoJ0Zpc2gnKS5zdGFydE1vdmluZygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy9wbGFjZSByb2Nrc1xuICAgICAgICB2YXIgbGFzdFJvY2tNb25zdGVyWCA9IDA7XG4gICAgICAgIHRoaXMucm9ja01vbnN0ZXJBciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDIwOyBqKyspe1xuICAgICAgICAgICAgdmFyIHJtID0gY2MuaW5zdGFudGlhdGUodGhpcy5yb2NrTW9uc3RlclByZWZhYik7XG4gICAgICAgICAgICB2YXIgbmV3UG9zaXRpb24gPSB0aGlzLmdldE5ld1JvY2tNb25zdGVyUG9zaXRpb24obGFzdFJvY2tNb25zdGVyWCk7XG4gICAgICAgICAgICBsYXN0Um9ja01vbnN0ZXJYID0gbmV3UG9zaXRpb24ueDtcbiAgICAgICAgICAgIHJtLnNldFBvc2l0aW9uKG5ld1Bvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucm9ja01vbnN0ZXJBci5wdXNoKHJtKTtcbiAgICAgICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChybSk7XG4gICAgICAgICAgICBybS5nZXRDb21wb25lbnQoJ1JvY2tNb25zdGVyJykuaW5pdCh0aGlzKTtcbiAgICAgICAgICAgIHJtLmdldENvbXBvbmVudCgnUm9ja01vbnN0ZXInKS5zdGFydE1vdmluZygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iZy5zdGFydE1vdmluZygpO1xuICAgICAgICBcbiAgICB9LFxuXG5cblxuXG4gICAgc3RhcnRUaW1lcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvL3RoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gNTtcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgfSxcblxuXG4gICAgZGVzcGF3bkZpc2ggKGZpc2gpIHtcbiAgICAgICAgLy90aGlzLnNjb3JlUG9vbC5wdXQoc2NvcmVGWCk7XG4gICAgfSxcblxuICAgIGdldE5ld0Zpc2hQb3NpdGlvbjogZnVuY3Rpb24gKGZyb21YKSB7XG5cbiAgICAgICAgdmFyIHJhbmRYID0gZnJvbVggKyAxNTAgKyBjYy5yYW5kb20wVG8xKCkgKiAyMDA7XG4gICAgICAgIHZhciByYW5kWSA9IHRoaXMuZ3JvdW5kWSArIGNjLnJhbmRvbTBUbzEoKSAqIDEwMCA7XG5cbiAgICAgICAgcmV0dXJuIGNjLnAocmFuZFgsIHJhbmRZKTtcbiAgICB9LFxuICAgIFxuICAgIGdldE5ld1JvY2tNb25zdGVyUG9zaXRpb246IGZ1bmN0aW9uIChmcm9tWCkge1xuXG4gICAgICAgIHZhciByYW5kWCA9IGZyb21YICsgMzUwICsgY2MucmFuZG9tMFRvMSgpICogMzAwO1xuICAgICAgICB2YXIgcmFuZFkgPSB0aGlzLmdyb3VuZC55ICsgMTAwIDsgLy8tIHRoaXMuZ3JvdW5kLmhpZ2h0IC8gMjtcblxuICAgICAgICByZXR1cm4gY2MucChyYW5kWCwgcmFuZFkpO1xuICAgIH0sXG5cbiAgICBnYWluU2NvcmU6IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgXG4gICAgICAgIGNjLmxvZygnZ2FpblNjb3JlJyk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNjb3JlICs9IDE7XG4gICAgICAgXG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcbiAgICAgICBcbiAgICAgICAgdmFyIGZ4ID0gdGhpcy5zcGF3blNjb3JlRlgoKTtcbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKGZ4Lm5vZGUpO1xuICAgICAgICBmeC5ub2RlLnNldFBvc2l0aW9uKHBvcyk7XG4gICAgICAgIGZ4LnBsYXkoKTtcbiAgICAgICAgXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5zY29yZUF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIHJlc2V0U2NvcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcbiAgICB9LFxuXG4gICAgc3Bhd25TY29yZUZYOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmeDtcbiAgICAgICAgaWYgKHRoaXMuc2NvcmVQb29sLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIGZ4ID0gdGhpcy5zY29yZVBvb2wuZ2V0KCk7XG4gICAgICAgICAgICByZXR1cm4gZnguZ2V0Q29tcG9uZW50KCdTY29yZUZYJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmeCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuc2NvcmVGWFByZWZhYikuZ2V0Q29tcG9uZW50KCdTY29yZUZYJyk7XG4gICAgICAgICAgICBmeC5pbml0KHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIGZ4O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlc3Bhd25TY29yZUZYIChzY29yZUZYKSB7XG4gICAgICAgIHRoaXMuc2NvcmVQb29sLnB1dChzY29yZUZYKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUnVubmluZykgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLnRpbWVyID4gdGhpcy5zdGFyRHVyYXRpb24pIHtcbiAgICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgfVxuICAgICAgICB0aGlzLnRpbWVyICs9IGR0O1xuICAgICAgICBcbiAgICAgICAgLy9jYy5sb2codGhpcy5iZy5nZXRYKCkrJywnK3RoaXMuYmcuZ2V0WSgpKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICAgICAgY2MubG9nKCdnYW1lT3ZlcicpO1xuICAgICAgICBcbiAgICAgICB0aGlzLmdhbWVPdmVyTm9kZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgIHRoaXMucGxheWVyLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICB0aGlzLnBsYXllci5zdG9wTW92ZSgpO1xuICAgICAgIC8vdGhpcy5wbGF5ZXIuaGlkZSgpO1xuICAgICAgIC8vdGhpcy5wbGF5ZXIuZGVzdHJveSgpO1xuICAgXG4gICBcbiAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZmlzaEFyLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgdmFyIGZpc2ggPSB0aGlzLmZpc2hBcltpXTtcbiAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUNoaWxkKGZpc2gpO1xuICAgICAgICAgICBmaXNoLmdldENvbXBvbmVudCgnRmlzaCcpLnN0b3BNb3ZpbmcoKTtcbiAgICAgICAgICAgZmlzaC5kZXN0cm95KCk7XG4gICAgICAgfVxuICAgICAgIHRoaXMuZmlzaEFyID0gW107IFxuICAgICAgIFxuICAgICAgIFxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMucm9ja01vbnN0ZXJBci5sZW5ndGg7IGorKyl7XG4gICAgICAgICAgIHZhciBybSA9IHRoaXMucm9ja01vbnN0ZXJBcltqXTtcbiAgICAgICAgICAgdGhpcy5ub2RlLnJlbW92ZUNoaWxkKHJtKTtcbiAgICAgICAgICAgcm0uZ2V0Q29tcG9uZW50KCdSb2NrTW9uc3RlcicpLnN0b3BNb3ZpbmcoKTtcbiAgICAgICAgICAgcm0uZGVzdHJveSgpO1xuICAgICAgIH1cbiAgICAgICB0aGlzLnJvY2tNb25zdGVyQXIgPSBbXTsgXG4gICAgXG4gICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICB0aGlzLmJ0bk5vZGUuc2V0UG9zaXRpb25YKDApO1xuICAgICAgIHRoaXMuYmcuc3RvcE1vdmluZygpO1xuICAgICAgIFxuICAgIH1cbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIFxuICAgICAgICBqdW1wSGVpZ2h0OiAwLFxuICAgICAgIFxuICAgICAgICBqdW1wRHVyYXRpb246IDAsXG4gICAgICAgXG4gICAgICAgIHNxdWFzaER1cmF0aW9uOiAwLFxuICAgICAgIFxuICAgICAgICBtYXhNb3ZlU3BlZWQ6IDAsXG4gICAgICBcbiAgICAgICAgYWNjZWw6IDAsXG4gICAgIFxuICAgICAgICBqdW1wQXVkaW86IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgXG4gICAgICAgIHRoaXMuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICBcbiAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICAvLyBzY3JlZW4gYm91bmRhcmllc1xuICAgICAgICB0aGlzLm1pblBvc1ggPSAtdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICB0aGlzLm1heFBvc1ggPSB0aGlzLm5vZGUucGFyZW50LndpZHRoLzI7XG5cbiAgICAgIFxuICAgICAgICB0aGlzLmp1bXBBY3Rpb24gPSB0aGlzLnNldEp1bXBBY3Rpb24oKTtcblxuICAgICAgIFxuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgIH0sXG5cbiAgICBzZXRJbnB1dENvbnRyb2w6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL2FkZCBrZXlib2FyZCBpbnB1dCBsaXN0ZW5lciB0byBqdW1wLCB0dXJuTGVmdCBhbmQgdHVyblJpZ2h0XG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5LRVlCT0FSRCxcbiAgICAgICAgICAgIC8vIHNldCBhIGZsYWcgd2hlbiBrZXkgcHJlc3NlZFxuICAgICAgICAgICAgb25LZXlQcmVzc2VkOiBmdW5jdGlvbihrZXlDb2RlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmE6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmxlZnQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyB1bnNldCBhIGZsYWcgd2hlbiBrZXkgcmVsZWFzZWRcbiAgICAgICAgICAgIG9uS2V5UmVsZWFzZWQ6IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLnJpZ2h0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xuXG4gICAgICAgIC8vIHRvdWNoIGlucHV0XG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5UT1VDSF9PTkVfQllfT05FLFxuICAgICAgICAgICAgb25Ub3VjaEJlZ2FuOiBmdW5jdGlvbih0b3VjaCwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG91Y2hMb2MgPSB0b3VjaC5nZXRMb2NhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmICh0b3VjaExvYy54ID49IGNjLndpblNpemUud2lkdGgvMikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkb24ndCBjYXB0dXJlIHRoZSBldmVudFxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uVG91Y2hFbmRlZDogZnVuY3Rpb24odG91Y2gsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xuICAgIH0sXG5cbiAgICBzZXRKdW1wQWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gIFxuICAgICAgICB2YXIganVtcFVwID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIHRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XG4gICAgIFxuICAgICAgICB2YXIganVtcERvd24gPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgLXRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTtcbiAgICAgIFxuICAgICAgICB2YXIgc3F1YXNoID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAwLjYpO1xuICAgICAgICB2YXIgc3RyZXRjaCA9IGNjLnNjYWxlVG8odGhpcy5zcXVhc2hEdXJhdGlvbiwgMSwgMS4yKTtcbiAgICAgICAgdmFyIHNjYWxlQmFjayA9IGNjLnNjYWxlVG8odGhpcy5zcXVhc2hEdXJhdGlvbiwgMSwgMSk7XG4gICAgICBcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY2MuY2FsbEZ1bmModGhpcy5wbGF5SnVtcFNvdW5kLCB0aGlzKTtcbiAgICAgICBcbiAgICAgICAgcmV0dXJuIGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2Uoc3F1YXNoLCBzdHJldGNoLCBqdW1wVXAsIHNjYWxlQmFjaywganVtcERvd24sIGNhbGxiYWNrKSk7XG4gICAgfSxcblxuICAgIHBsYXlKdW1wU291bmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIFxuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuanVtcEF1ZGlvLCBmYWxzZSk7XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBnZXRDZW50ZXJQb3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgIGNjLmxvZygncGxheWVyOmdldENlbnRlclBvcycpO1xuICAgICAgICB2YXIgY2VudGVyUG9zID0gY2MucCh0aGlzLm5vZGUueCwgdGhpcy5ub2RlLnkgKyB0aGlzLm5vZGUuaGVpZ2h0LzIpO1xuICAgICAgICByZXR1cm4gY2VudGVyUG9zO1xuICAgIH0sXG5cbiAgICBzdGFydE1vdmVBdDogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG4gICAgICAgIHRoaXMubm9kZS5zZXRQb3NpdGlvbihwb3MpO1xuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKHRoaXMuc2V0SnVtcEFjdGlvbigpKTtcbiAgICB9LFxuXG4gICAgcmVzZXRQb3NpdGlvbjogZnVuY3Rpb24gKCl7XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBzdG9wTW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIGlmICggTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQgKSB7XG4gICAgICAgICAgICAvLyBpZiBzcGVlZCByZWFjaCBsaW1pdCwgdXNlIG1heCBzcGVlZCB3aXRoIGN1cnJlbnQgZGlyZWN0aW9uXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgIFxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuXG4gICAgICAgIC8vIGxpbWl0IHBsYXllciBwb3NpdGlvbiBpbnNpZGUgc2NyZWVuXG4gICAgICAgIGlmICggdGhpcy5ub2RlLnggPiB0aGlzLm5vZGUucGFyZW50LndpZHRoLzIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm9kZS54IDwgLXRoaXMubm9kZS5wYXJlbnQud2lkdGgvMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSAtdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgXG4gICAgICAgIHBpY2tSYWRpdXM6IDAsXG4gICAgICBcbiAgICAgICAgZ2FtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMTAwO1xuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBpbml0OiBmdW5jdGlvbiAoZ2FtZSkge1xuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcbiAgICB9LFxuXG4gICAgcmV1c2UgKGdhbWUpIHtcbiAgICAgICAgdGhpcy5pbml0KGdhbWUpO1xuICAgIH0sXG5cbiAgICBnZXRQbGF5ZXJEaXN0YW5jZTogZnVuY3Rpb24gKCkge1xuICAgIFxuICAgICAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRDZW50ZXJQb3MoKTtcbiAgICAgICBcbiAgICAgICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xuICAgICAgICByZXR1cm4gZGlzdDtcbiAgICB9LFxuXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5ub2RlLmdldFBvc2l0aW9uKCk7XG4gICAgICBcbiAgICAgICAgdGhpcy5nYW1lLmdhaW5TY29yZShwb3MpO1xuICAgICAgIFxuICAgICAgICB0aGlzLmdhbWUuZGVzcGF3blN0YXIodGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmdldFBsYXllckRpc3RhbmNlKCkgPCB0aGlzLnBpY2tSYWRpdXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5vblBpY2tlZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgIC8vIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyL3RoaXMuZ2FtZS5zdGFyRHVyYXRpb247XG4gICAgICAgIC8vIHZhciBtaW5PcGFjaXR5ID0gNTA7XG4gICAgICAgIC8vIHRoaXMubm9kZS5vcGFjaXR5ID0gbWluT3BhY2l0eSArIE1hdGguZmxvb3Iob3BhY2l0eVJhdGlvICogKDI1NSAtIG1pbk9wYWNpdHkpKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm1vdmluZykge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggLT0gdGhpcy54U3BlZWQgKiBkdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9LFxuICAgIHN0YXJ0TW92aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIHN0b3BNb3Zpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB9LFxuICAgIFxuICAgIGdldFg6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGUueDtcbiAgICB9LFxuICAgIGdldFk6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGUueTtcbiAgICB9LFxuICAgIFxuICAgIHJlc2V0UG9zaXRpb246IGZ1bmN0aW9uICgpe1xuICAgICAgICB0aGlzLm5vZGUueCA9IDI3NDU7ICBcbiAgICB9LFxufSk7IiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIGluaXQgKHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZUZYID0gc2NvcmVGWDtcbiAgICB9LFxuXG4gICAgaGlkZUZYOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVGWC5kZXNwYXduKCk7XG4gICAgfSxcbn0pOyIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5BbmltYXRpb25cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0IChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuYW5pbS5nZXRDb21wb25lbnQoJ1Njb3JlQW5pbScpLmluaXQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlc3Bhd24gKCkge1xuICAgICAgICB0aGlzLmdhbWUuZGVzcGF3blNjb3JlRlgodGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0ucGxheSgnc2NvcmVfcG9wJyk7XG4gICAgfVxufSk7XG4iXX0=