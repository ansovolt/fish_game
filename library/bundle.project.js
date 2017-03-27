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
    "extends": cc.Component,

    properties: {

        jumpHeight: 0,

        jumpDuration: 0,

        squashDuration: 0,

        maxMoveSpeed: 0,

        accel: 0,

        jumpAudio: {
            "default": null,
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IgMi5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9CYWNrZ3JvdW5kLmpzIiwiYXNzZXRzL3NjcmlwdHMvRmlzaC5qcyIsImFzc2V0cy9zY3JpcHRzL0dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9QbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9Sb2NrTW9uc3Rlci5qcyIsImFzc2V0cy9zY3JpcHRzL1Njb3JlQW5pbS5qcyIsImFzc2V0cy9zY3JpcHRzL1Njb3JlRlguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNJO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDSTtBQUNJO0FBQ0E7QUFDQTtBQUNSO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0o7QUFDUTtBQUNBO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNZO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUTtBQUNJO0FBQ1o7QUFDQTtBQUVJO0FBQ0k7QUFBUjtBQUNBO0FBRUk7QUFDSTtBQUFSO0FBQ0E7QUFFSTtBQUNJO0FBQVI7QUFFSTtBQUNJO0FBQVI7QUFDQTtBQUVJO0FBQ0k7QUFBUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBRVE7QUFDQTtBQUFSO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFDQTtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBQ0E7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUNBO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFDQTtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBRVE7QUFDSTtBQUNBO0FBQVo7QUFFUTtBQUNJO0FBQ0E7QUFBWjtBQUVRO0FBQ0k7QUFDQTtBQUFaO0FBQ0E7QUFDQTtBQUNBO0FBRUk7QUFBSjtBQUVRO0FBQ0E7QUFBUjtBQUdRO0FBQ0E7QUFEUjtBQUNBO0FBR1E7QUFEUjtBQUNBO0FBR1E7QUFDQTtBQURSO0FBQ0E7QUFJSTtBQUZKO0FBQ0E7QUFDQTtBQUlRO0FBRlI7QUFJUTtBQUNBO0FBRlI7QUFJUTtBQUZSO0FBSVE7QUFGUjtBQUlRO0FBRlI7QUFJUTtBQUZSO0FBQ0E7QUFPSTtBQUxKO0FBT1E7QUFMUjtBQUNBO0FBT1E7QUFMUjtBQUNBO0FBT1E7QUFMUjtBQU9RO0FBTFI7QUFDQTtBQU9RO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFMWjtBQUNBO0FBQ0E7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QTtBQUdJO0FBQ0k7QUFEUjtBQUNBO0FBR0k7QUFDSTtBQURSO0FBQ0E7QUFHSTtBQUNJO0FBRFI7QUFHSTtBQUNJO0FBRFI7QUFDQTtBQUdJO0FBQ0k7QUFEUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNJO0FBQ0o7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNJO0FBQ0o7QUFDSTtBQUNJO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMTAwO1xuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBzdGFydE1vdmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgfSxcbiAgICBcbiAgICBzdG9wTW92aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgfSxcbiAgICBcbiAgICBnZXRYOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlLng7XG4gICAgfSxcbiAgICBnZXRZOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlLnk7XG4gICAgfSxcbiAgICBcbiAgICByZXNldFBvc2l0aW9uOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgdGhpcy5ub2RlLnggPSAyNzQ1OyAgXG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMubW92aW5nKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCAtPSB0aGlzLnhTcGVlZCAqIGR0O1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiXG5cbmNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gIFxuICAgICAgICBwaWNrUmFkaXVzOiAwLFxuICAgICAgXG4gICAgICAgIGdhbWU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICBzZXJpYWxpemFibGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnhTcGVlZCA9IDEwMDtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgaW5pdDogZnVuY3Rpb24gKGdhbWUpIHtcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgfSxcblxuICAgIHJldXNlIChnYW1lKSB7XG4gICAgICAgIHRoaXMuaW5pdChnYW1lKTtcbiAgICB9LFxuXG4gICAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICAgICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0Q2VudGVyUG9zKCk7XG4gICAgICAgXG4gICAgICAgIHZhciBkaXN0ID0gY2MucERpc3RhbmNlKHRoaXMubm9kZS5wb3NpdGlvbiwgcGxheWVyUG9zKTtcbiAgICAgICAgcmV0dXJuIGRpc3Q7XG4gICAgfSxcblxuICAgIG9uUGlja2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgXG4gICAgICAgIGNjLmxvZygnZmluc2g6b25QaWNrZWQnKTtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMubm9kZS5nZXRQb3NpdGlvbigpO1xuICAgICAgXG4gICAgICAgIHRoaXMuZ2FtZS5nYWluU2NvcmUocG9zKTtcbiAgICAgICBcbiAgICAgICAgdGhpcy5nYW1lLmRlc3Bhd25GaXNoKHRoaXMubm9kZSk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgIFxuICAgICAgICAvLyB2YXIgb3BhY2l0eVJhdGlvID0gMSAtIHRoaXMuZ2FtZS50aW1lci90aGlzLmdhbWUuc3RhckR1cmF0aW9uO1xuICAgICAgICAvLyB2YXIgbWluT3BhY2l0eSA9IDUwO1xuICAgICAgICAvLyB0aGlzLm5vZGUub3BhY2l0eSA9IG1pbk9wYWNpdHkgKyBNYXRoLmZsb29yKG9wYWNpdHlSYXRpbyAqICgyNTUgLSBtaW5PcGFjaXR5KSk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5tb3ZpbmcpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54IC09IHRoaXMueFNwZWVkICogZHQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfSxcbiAgICBzdGFydE1vdmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgfSxcbiAgICBcbiAgICBzdG9wTW92aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgfSxcbiAgICBcbiAgICBnZXRYOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlLng7XG4gICAgfSxcbiAgICBnZXRZOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlLnk7XG4gICAgfSxcbiAgICBcbiAgICByZXNldFBvc2l0aW9uOiBmdW5jdGlvbiAoKXtcbiAgICAgICAgdGhpcy5ub2RlLnggPSAyNzQ1OyAgXG4gICAgfSxcbn0pOyIsImNvbnN0IFBsYXllciA9IHJlcXVpcmUoJ1BsYXllcicpO1xuY29uc3QgQmFja2dyb3VuZCA9IHJlcXVpcmUoJ0JhY2tncm91bmQnKTtcbmNvbnN0IFNjb3JlRlggPSByZXF1aXJlKCdTY29yZUZYJyk7XG5jb25zdCBGaXNoID0gcmVxdWlyZSgnRmlzaCcpO1xuY29uc3QgUm9ja01vbnN0ZXIgPSByZXF1aXJlKCdSb2NrTW9uc3RlcicpO1xuXG52YXIgR2FtZSA9IGNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBcblxuICAgICAgICBzY29yZUZYUHJlZmFiOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIGZpc2hQcmVmYWI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgcm9ja01vbnN0ZXJQcmVmYWI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgbWF4U3RhckR1cmF0aW9uOiAwLFxuICAgICAgICBtaW5TdGFyRHVyYXRpb246IDAsXG4gICAgICBcbiAgICAgICAgZ3JvdW5kOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgXG4gICAgICAgIHBsYXllcjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IFBsYXllclxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYmc6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBCYWNrZ3JvdW5kXG4gICAgICAgIH0sXG4gICAgICBcbiAgICAgICAgc2NvcmVEaXNwbGF5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICAgICAgfSxcbiAgICAgXG4gICAgICAgIHNjb3JlQXVkaW86IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9LFxuICAgICAgICBzcGxhc2gxQXVkaW86IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9LFxuICAgICAgICBidG5Ob2RlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBnYW1lT3Zlck5vZGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xIaW50TGFiZWw6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuICAgICAgICBrZXlib2FyZEhpbnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxuICAgICAgICAgICAgbXVsdGlsaW5lOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHRvdWNoSGludDoge1xuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICBtdWx0aWxpbmU6IHRydWVcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgXG4gICAgICAgIHRoaXMuZ3JvdW5kWSA9IHRoaXMuZ3JvdW5kLnkgKyB0aGlzLmdyb3VuZC5oZWlnaHQvMjtcbiAgICAgICAgdGhpcy5ncm91bmRYID0gdGhpcy5ub2RlLnggLSB0aGlzLm5vZGUud2lkdGggKyB0aGlzLnBsYXllci5ub2RlLndpZHRoIDsvLy0gY2MuQ2FudmFzLndpZHRoLzIgKyAyMDtcblxuICAgICBcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gMDtcblxuICAgICAgICAvLyBpcyBzaG93aW5nIG1lbnUgb3IgcnVubmluZyBnYW1lXG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBjb250cm9sIGhpbnRcbiAgICAgICAgdmFyIGhpbnRUZXh0ID0gY2Muc3lzLmlzTW9iaWxlID8gdGhpcy50b3VjaEhpbnQgOiB0aGlzLmtleWJvYXJkSGludDtcbiAgICAgICAgdGhpcy5jb250cm9sSGludExhYmVsLnN0cmluZyA9IGhpbnRUZXh0O1xuXG4gICAgfSxcblxuICAgIG9uU3RhcnRHYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgXG4gICAgICAgIC8vIHRoaXMucmVzZXRTY29yZSgpO1xuICAgICAgICAvLyBzZXQgZ2FtZSBzdGF0ZSB0byBydW5uaW5nXG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gc2V0IGJ1dHRvbiBhbmQgZ2FtZW92ZXIgdGV4dCBvdXQgb2Ygc2NyZWVuXG4gICAgICAgIHRoaXMuYnRuTm9kZS5zZXRQb3NpdGlvblgoMzAwMCk7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXJOb2RlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvLyByZXNldCBwbGF5ZXIgcG9zaXRpb24gYW5kIG1vdmUgc3BlZWRcbiAgICAgICAgdGhpcy5wbGF5ZXIuc3RhcnRNb3ZlQXQoY2MucCh0aGlzLmdyb3VuZFgsIHRoaXMuZ3JvdW5kWSkpO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5ncm91bmRYKycsJyt0aGlzLmdyb3VuZFkpO1xuICAgICAgICBcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNwbGFzaDFBdWRpbywgZmFsc2UpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbml0U2NlbmUoKTtcbiAgICAgICAgXG4gICAgICAgXG4gICAgfSxcblxuXG4gICAgaW5pdFNjZW5lOiBmdW5jdGlvbigpe1xuICAgICAgICBcbiAgICAgICAgY2MubG9nKFwiaW5pdFNjZW5lXCIpO1xuICAgICAgICBcbiAgICAgICAgLy9zdGFydCBnYW1lIHRpbWVyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgICBcbiAgICAgICAgLy9yZXNldCBiYWNrZ3JvdW5kIHBvc2l0aW9uXG4gICAgICAgIHRoaXMuYmcucmVzZXRQb3NpdGlvbigpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5wbGF5ZXIucmVzZXRQb3NpdGlvbigpO1xuICAgICAgICBcbiAgICAgICAgLy9wbGFjZSBmaXNoXG4gICAgICAgIHZhciBsYXN0RmlzaFggPSAwO1xuICAgICAgICB0aGlzLmZpc2hBciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspe1xuICAgICAgICAgICAgdmFyIGZpc2ggPSBjYy5pbnN0YW50aWF0ZSh0aGlzLmZpc2hQcmVmYWIpO1xuICAgICAgICAgICAgdmFyIG5ld0Zpc2hQb3NpdGlvbiA9IHRoaXMuZ2V0TmV3RmlzaFBvc2l0aW9uKGxhc3RGaXNoWCk7XG4gICAgICAgICAgICBsYXN0RmlzaFggPSBuZXdGaXNoUG9zaXRpb24ueDtcbiAgICAgICAgICAgIGZpc2guc2V0UG9zaXRpb24obmV3RmlzaFBvc2l0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuZmlzaEFyLnB1c2goZmlzaCk7XG4gICAgICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQoZmlzaCk7XG4gICAgICAgICAgICBmaXNoLmdldENvbXBvbmVudCgnRmlzaCcpLmluaXQodGhpcyk7XG4gICAgICAgICAgICBmaXNoLmdldENvbXBvbmVudCgnRmlzaCcpLnN0YXJ0TW92aW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAvL3BsYWNlIHJvY2tzXG4gICAgICAgIHZhciBsYXN0Um9ja01vbnN0ZXJYID0gMDtcbiAgICAgICAgdGhpcy5yb2NrTW9uc3RlckFyID0gW107XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjA7IGorKyl7XG4gICAgICAgICAgICB2YXIgcm0gPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnJvY2tNb25zdGVyUHJlZmFiKTtcbiAgICAgICAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHRoaXMuZ2V0TmV3Um9ja01vbnN0ZXJQb3NpdGlvbihsYXN0Um9ja01vbnN0ZXJYKTtcbiAgICAgICAgICAgIGxhc3RSb2NrTW9uc3RlclggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgICAgICAgcm0uc2V0UG9zaXRpb24obmV3UG9zaXRpb24pO1xuICAgICAgICAgICAgdGhpcy5yb2NrTW9uc3RlckFyLnB1c2gocm0pO1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKHJtKTtcbiAgICAgICAgICAgIHJtLmdldENvbXBvbmVudCgnUm9ja01vbnN0ZXInKS5pbml0KHRoaXMpO1xuICAgICAgICAgICAgcm0uZ2V0Q29tcG9uZW50KCdSb2NrTW9uc3RlcicpLnN0YXJ0TW92aW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJnLnN0YXJ0TW92aW5nKCk7XG4gICAgICAgIFxuICAgIH0sXG5cblxuXG5cbiAgICBzdGFydFRpbWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vdGhpcy5zdGFyRHVyYXRpb24gPSB0aGlzLm1pblN0YXJEdXJhdGlvbiArIGNjLnJhbmRvbTBUbzEoKSAqICh0aGlzLm1heFN0YXJEdXJhdGlvbiAtIHRoaXMubWluU3RhckR1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5zdGFyRHVyYXRpb24gPSA1O1xuICAgICAgICB0aGlzLnRpbWVyID0gMDtcbiAgICB9LFxuXG5cbiAgICBkZXNwYXduRmlzaCAoZmlzaCkge1xuICAgICAgICAvL3RoaXMuc2NvcmVQb29sLnB1dChzY29yZUZYKTtcbiAgICB9LFxuXG4gICAgZ2V0TmV3RmlzaFBvc2l0aW9uOiBmdW5jdGlvbiAoZnJvbVgpIHtcblxuICAgICAgICB2YXIgcmFuZFggPSBmcm9tWCArIDE1MCArIGNjLnJhbmRvbTBUbzEoKSAqIDIwMDtcbiAgICAgICAgdmFyIHJhbmRZID0gdGhpcy5ncm91bmRZICsgY2MucmFuZG9tMFRvMSgpICogMTAwIDtcblxuICAgICAgICByZXR1cm4gY2MucChyYW5kWCwgcmFuZFkpO1xuICAgIH0sXG4gICAgXG4gICAgZ2V0TmV3Um9ja01vbnN0ZXJQb3NpdGlvbjogZnVuY3Rpb24gKGZyb21YKSB7XG5cbiAgICAgICAgdmFyIHJhbmRYID0gZnJvbVggKyAzNTAgKyBjYy5yYW5kb20wVG8xKCkgKiAzMDA7XG4gICAgICAgIHZhciByYW5kWSA9IHRoaXMuZ3JvdW5kLnkgKyAxMDAgOyAvLy0gdGhpcy5ncm91bmQuaGlnaHQgLyAyO1xuXG4gICAgICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XG4gICAgfSxcblxuICAgIGdhaW5TY29yZTogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICBcbiAgICAgICAgY2MubG9nKCdnYWluU2NvcmUnKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuc2NvcmUgKz0gMTtcbiAgICAgICBcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gJ1Njb3JlOiAnICsgdGhpcy5zY29yZS50b1N0cmluZygpO1xuICAgICAgIFxuICAgICAgICB2YXIgZnggPSB0aGlzLnNwYXduU2NvcmVGWCgpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQoZngubm9kZSk7XG4gICAgICAgIGZ4Lm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgICAgZngucGxheSgpO1xuICAgICAgICBcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gJ1Njb3JlOiAnICsgdGhpcy5zY29yZS50b1N0cmluZygpO1xuICAgIH0sXG5cbiAgICBzcGF3blNjb3JlRlg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZ4O1xuICAgICAgICBpZiAodGhpcy5zY29yZVBvb2wuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgZnggPSB0aGlzLnNjb3JlUG9vbC5nZXQoKTtcbiAgICAgICAgICAgIHJldHVybiBmeC5nZXRDb21wb25lbnQoJ1Njb3JlRlgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZ4ID0gY2MuaW5zdGFudGlhdGUodGhpcy5zY29yZUZYUHJlZmFiKS5nZXRDb21wb25lbnQoJ1Njb3JlRlgnKTtcbiAgICAgICAgICAgIGZ4LmluaXQodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gZng7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzcGF3blNjb3JlRlggKHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZVBvb2wucHV0KHNjb3JlRlgpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbikge1xuICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZXIgKz0gZHQ7XG4gICAgICAgIFxuICAgICAgICAvL2NjLmxvZyh0aGlzLmJnLmdldFgoKSsnLCcrdGhpcy5iZy5nZXRZKCkpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfSxcblxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFxuICAgICAgICBjYy5sb2coJ2dhbWVPdmVyJyk7XG4gICAgICAgIFxuICAgICAgIHRoaXMuZ2FtZU92ZXJOb2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgdGhpcy5wbGF5ZXIuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgIHRoaXMucGxheWVyLnN0b3BNb3ZlKCk7XG4gICAgICAgLy90aGlzLnBsYXllci5oaWRlKCk7XG4gICAgICAgLy90aGlzLnBsYXllci5kZXN0cm95KCk7XG4gICBcbiAgIFxuICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5maXNoQXIubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICB2YXIgZmlzaCA9IHRoaXMuZmlzaEFyW2ldO1xuICAgICAgICAgICB0aGlzLm5vZGUucmVtb3ZlQ2hpbGQoZmlzaCk7XG4gICAgICAgICAgIGZpc2guZ2V0Q29tcG9uZW50KCdGaXNoJykuc3RvcE1vdmluZygpO1xuICAgICAgICAgICBmaXNoLmRlc3Ryb3koKTtcbiAgICAgICB9XG4gICAgICAgdGhpcy5maXNoQXIgPSBbXTsgXG4gICAgICAgXG4gICAgICAgXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5yb2NrTW9uc3RlckFyLmxlbmd0aDsgaisrKXtcbiAgICAgICAgICAgdmFyIHJtID0gdGhpcy5yb2NrTW9uc3RlckFyW2pdO1xuICAgICAgICAgICB0aGlzLm5vZGUucmVtb3ZlQ2hpbGQocm0pO1xuICAgICAgICAgICBybS5nZXRDb21wb25lbnQoJ1JvY2tNb25zdGVyJykuc3RvcE1vdmluZygpO1xuICAgICAgICAgICBybS5kZXN0cm95KCk7XG4gICAgICAgfVxuICAgICAgIHRoaXMucm9ja01vbnN0ZXJBciA9IFtdOyBcbiAgICBcbiAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICAgICAgIHRoaXMuYnRuTm9kZS5zZXRQb3NpdGlvblgoMCk7XG4gICAgICAgdGhpcy5iZy5zdG9wTW92aW5nKCk7XG4gICAgICAgXG4gICAgfVxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgXG4gICAgICAgIGp1bXBIZWlnaHQ6IDAsXG4gICAgICAgXG4gICAgICAgIGp1bXBEdXJhdGlvbjogMCxcbiAgICAgICBcbiAgICAgICAgc3F1YXNoRHVyYXRpb246IDAsXG4gICAgICAgXG4gICAgICAgIG1heE1vdmVTcGVlZDogMCxcbiAgICAgIFxuICAgICAgICBhY2NlbDogMCxcbiAgICAgXG4gICAgICAgIGp1bXBBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICBcbiAgICAgICAgdGhpcy5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgIFxuICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG4gICAgICAgIC8vIHNjcmVlbiBib3VuZGFyaWVzXG4gICAgICAgIHRoaXMubWluUG9zWCA9IC10aGlzLm5vZGUucGFyZW50LndpZHRoLzI7XG4gICAgICAgIHRoaXMubWF4UG9zWCA9IHRoaXMubm9kZS5wYXJlbnQud2lkdGgvMjtcblxuICAgICAgXG4gICAgICAgIHRoaXMuanVtcEFjdGlvbiA9IHRoaXMuc2V0SnVtcEFjdGlvbigpO1xuXG4gICAgICAgXG4gICAgICAgIHRoaXMuc2V0SW5wdXRDb250cm9sKCk7XG4gICAgfSxcblxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vYWRkIGtleWJvYXJkIGlucHV0IGxpc3RlbmVyIHRvIGp1bXAsIHR1cm5MZWZ0IGFuZCB0dXJuUmlnaHRcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLktFWUJPQVJELFxuICAgICAgICAgICAgLy8gc2V0IGEgZmxhZyB3aGVuIGtleSBwcmVzc2VkXG4gICAgICAgICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHVuc2V0IGEgZmxhZyB3aGVuIGtleSByZWxlYXNlZFxuICAgICAgICAgICAgb25LZXlSZWxlYXNlZDogZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG5cbiAgICAgICAgLy8gdG91Y2ggaW5wdXRcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLlRPVUNIX09ORV9CWV9PTkUsXG4gICAgICAgICAgICBvblRvdWNoQmVnYW46IGZ1bmN0aW9uKHRvdWNoLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3VjaExvYyA9IHRvdWNoLmdldExvY2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoTG9jLnggPj0gY2Mud2luU2l6ZS53aWR0aC8yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRvbid0IGNhcHR1cmUgdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Ub3VjaEVuZGVkOiBmdW5jdGlvbih0b3VjaCwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG4gICAgfSxcblxuICAgIHNldEp1bXBBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgXG4gICAgICAgIHZhciBqdW1wVXAgPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbk91dCgpKTtcbiAgICAgXG4gICAgICAgIHZhciBqdW1wRG93biA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLCAtdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbkluKCkpO1xuICAgICAgXG4gICAgICAgIHZhciBzcXVhc2ggPSBjYy5zY2FsZVRvKHRoaXMuc3F1YXNoRHVyYXRpb24sIDEsIDAuNik7XG4gICAgICAgIHZhciBzdHJldGNoID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAxLjIpO1xuICAgICAgICB2YXIgc2NhbGVCYWNrID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAxKTtcbiAgICAgIFxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYy5jYWxsRnVuYyh0aGlzLnBsYXlKdW1wU291bmQsIHRoaXMpO1xuICAgICAgIFxuICAgICAgICByZXR1cm4gY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShzcXVhc2gsIHN0cmV0Y2gsIGp1bXBVcCwgc2NhbGVCYWNrLCBqdW1wRG93biwgY2FsbGJhY2spKTtcbiAgICB9LFxuXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sIGZhbHNlKTtcbiAgICAgICAgXG4gICAgfSxcblxuICAgIGdldENlbnRlclBvczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2VudGVyUG9zID0gY2MucCh0aGlzLm5vZGUueCwgdGhpcy5ub2RlLnkgKyB0aGlzLm5vZGUuaGVpZ2h0LzIpO1xuICAgICAgICByZXR1cm4gY2VudGVyUG9zO1xuICAgIH0sXG5cbiAgICBzdGFydE1vdmVBdDogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG4gICAgICAgIHRoaXMubm9kZS5zZXRQb3NpdGlvbihwb3MpO1xuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKHRoaXMuc2V0SnVtcEFjdGlvbigpKTtcbiAgICB9LFxuXG4gICAgcmVzZXRQb3NpdGlvbjogZnVuY3Rpb24gKCl7XG4gICAgICAgIFxuICAgIH0sXG5cbiAgICBzdG9wTW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIGlmICggTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQgKSB7XG4gICAgICAgICAgICAvLyBpZiBzcGVlZCByZWFjaCBsaW1pdCwgdXNlIG1heCBzcGVlZCB3aXRoIGN1cnJlbnQgZGlyZWN0aW9uXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgIFxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuXG4gICAgICAgIC8vIGxpbWl0IHBsYXllciBwb3NpdGlvbiBpbnNpZGUgc2NyZWVuXG4gICAgICAgIGlmICggdGhpcy5ub2RlLnggPiB0aGlzLm5vZGUucGFyZW50LndpZHRoLzIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm9kZS54IDwgLXRoaXMubm9kZS5wYXJlbnQud2lkdGgvMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSAtdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgXG4gICAgICAgIHBpY2tSYWRpdXM6IDAsXG4gICAgICBcbiAgICAgICAgZ2FtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMTAwO1xuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBpbml0OiBmdW5jdGlvbiAoZ2FtZSkge1xuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcbiAgICB9LFxuXG4gICAgcmV1c2UgKGdhbWUpIHtcbiAgICAgICAgdGhpcy5pbml0KGdhbWUpO1xuICAgIH0sXG5cbiAgICBnZXRQbGF5ZXJEaXN0YW5jZTogZnVuY3Rpb24gKCkge1xuICAgIFxuICAgICAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRDZW50ZXJQb3MoKTtcbiAgICAgICBcbiAgICAgICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xuICAgICAgICByZXR1cm4gZGlzdDtcbiAgICB9LFxuXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5ub2RlLmdldFBvc2l0aW9uKCk7XG4gICAgICBcbiAgICAgICAgdGhpcy5nYW1lLmdhaW5TY29yZShwb3MpO1xuICAgICAgIFxuICAgICAgICB0aGlzLmdhbWUuZGVzcGF3blN0YXIodGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmdldFBsYXllckRpc3RhbmNlKCkgPCB0aGlzLnBpY2tSYWRpdXMpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5vblBpY2tlZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgIC8vIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyL3RoaXMuZ2FtZS5zdGFyRHVyYXRpb247XG4gICAgICAgIC8vIHZhciBtaW5PcGFjaXR5ID0gNTA7XG4gICAgICAgIC8vIHRoaXMubm9kZS5vcGFjaXR5ID0gbWluT3BhY2l0eSArIE1hdGguZmxvb3Iob3BhY2l0eVJhdGlvICogKDI1NSAtIG1pbk9wYWNpdHkpKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLm1vdmluZykge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggLT0gdGhpcy54U3BlZWQgKiBkdDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9LFxuICAgIHN0YXJ0TW92aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICB9LFxuICAgIFxuICAgIHN0b3BNb3Zpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB9LFxuICAgIFxuICAgIGdldFg6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGUueDtcbiAgICB9LFxuICAgIGdldFk6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGUueTtcbiAgICB9LFxuICAgIFxuICAgIHJlc2V0UG9zaXRpb246IGZ1bmN0aW9uICgpe1xuICAgICAgICB0aGlzLm5vZGUueCA9IDI3NDU7ICBcbiAgICB9LFxufSk7IiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIGluaXQgKHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZUZYID0gc2NvcmVGWDtcbiAgICB9LFxuXG4gICAgaGlkZUZYOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVGWC5kZXNwYXduKCk7XG4gICAgfSxcbn0pOyIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5BbmltYXRpb25cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0IChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuYW5pbS5nZXRDb21wb25lbnQoJ1Njb3JlQW5pbScpLmluaXQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlc3Bhd24gKCkge1xuICAgICAgICB0aGlzLmdhbWUuZGVzcGF3blNjb3JlRlgodGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0ucGxheSgnc2NvcmVfcG9wJyk7XG4gICAgfVxufSk7XG4iXX0=