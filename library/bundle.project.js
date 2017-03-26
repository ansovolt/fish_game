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

        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
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
var Star = require('Star');
var Fish = require('Fish');

var Game = cc.Class({
    'extends': cc.Component,

    properties: {

        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        scoreFXPrefab: {
            'default': null,
            type: cc.Prefab
        },
        fishPrefab: {
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

        // store last star's x position
        this.currentStar = null;
        this.currentStarX = 0;

        this.timer = 0;
        this.starDuration = 0;

        // is showing menu or running game
        this.isRunning = false;

        // initialize control hint
        var hintText = cc.sys.isMobile ? this.touchHint : this.keyboardHint;
        this.controlHintLabel.string = hintText;

        // initialize star and score pool
        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreFX');
    },

    onStartGame: function onStartGame() {

        // this.resetScore();
        // set game state to running
        this.isRunning = true;
        // set button and gameover text out of screen
        this.btnNode.setPositionX(3000);
        this.gameOverNode.active = false;
        // reset player position and move speed
        this.player.startMoveAt(cc.p(0, this.groundY));
        // spawn star
        this.spawnNewStar();
        cc.audioEngine.playEffect(this.splash1Audio, false);

        this.initScene();

        this.bg.startMoving();
    },

    initScene: function initScene() {

        //place fish
        this.fishAr = [];
        for (var i = 0; i < 1; i++) {
            var fish = cc.instantiate(this.fishPrefab);
            fish.setPosition(this.getNewFishPosition());
            this.fishAr.push(fish);
            this.node.addChild(fish);
            fish.getComponent('Fish').init(this);
        }

        //place rocks
    },

    spawnNewStar: function spawnNewStar() {
        // var newStar = null;

        // if (this.starPool.size() > 0) {
        //     newStar = this.starPool.get(this); // this will be passed to Star's reuse method
        // } else {
        //     newStar = cc.instantiate(this.starPrefab);
        // }

        // this.node.addChild(newStar);

        // newStar.setPosition(this.getNewStarPosition());
        // // pass Game instance to star
        // newStar.getComponent('Star').init(this);
        // start star timer and store star reference
        this.startTimer();
        //this.currentStar = newStar;
    },

    despawnStar: function despawnStar(star) {
        this.starPool.put(star);
        this.spawnNewStar();
    },

    startTimer: function startTimer() {

        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        // if there's no star, set a random x pos
        // if (!this.currentStar) {
        //     this.currentStarX = cc.randomMinus1To1() * this.node.width/2;
        // }
        // var randX = 0;

        // var randY = this.groundY + cc.random0To1() * this.player.jumpHeight + 50;

        // var maxX = this.node.width/2;
        // if (this.currentStarX >= 0) {
        //     randX = -cc.random0To1() * maxX;
        // } else {
        //     randX = cc.random0To1() * maxX;
        // }
        // this.currentStarX = randX;

        // return cc.p(randX, randY);
    },

    getNewFishPosition: function getNewFishPosition() {

        var randX = 0;
        var randY = this.groundY + cc.random0To1() * this.player.jumpHeight + 50;

        // var maxX = this.node.width/2;
        // if (this.currentStarX >= 0) {
        //     randX = -cc.random0To1() * maxX;
        // } else {
        //     randX = cc.random0To1() * maxX;
        // }
        // this.currentStarX = randX;

        return cc.p(randX, randY);
    },

    gainScore: function gainScore(pos) {
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
    },

    gameOver: function gameOver() {
        this.gameOverNode.active = true;
        this.player.enabled = false;
        this.player.stopMove();

        for (var i = 0; i < this.fishAr.length; i++) {
            this.fishAr[i].destroy;
        }
        this.fishAr = undefined;

        this.isRunning = false;
        this.btnNode.setPositionX(0);
        this.bg.stopMoving();
    }
});

cc._RFpop();
},{"Background":"Background","Fish":"Fish","Player":"Player","ScoreFX":"ScoreFX","Star":"Star"}],"Player":[function(require,module,exports){
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
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RFpush(module, '21890Xr4RBJlqTJhmXJ/f5s', 'Star');
// scripts/Star.js

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

        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
});

cc._RFpop();
},{}]},{},["Background","Fish","Game","Player","ScoreAnim","ScoreFX","Star"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IgMi5hcHAvQ29udGVudHMvUmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9CYWNrZ3JvdW5kLmpzIiwiYXNzZXRzL3NjcmlwdHMvRmlzaC5qcyIsImFzc2V0cy9zY3JpcHRzL0dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9QbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9TY29yZUFuaW0uanMiLCJhc3NldHMvc2NyaXB0cy9TY29yZUZYLmpzIiwiYXNzZXRzL3NjcmlwdHMvU3Rhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQTtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDSTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBQ0E7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ0E7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDQTtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDWTtBQUNBO0FBQ1o7QUFDQTtBQUNRO0FBQ0E7QUFDQTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSjtBQUNJO0FBQ0o7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDUTtBQUNBO0FBQ1I7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNBO0FBR1E7QUFDQTtBQURSO0FBSVE7QUFDQTtBQUZSO0FBQ0E7QUFJUTtBQUZSO0FBQ0E7QUFJUTtBQUNBO0FBRlI7QUFDQTtBQUlRO0FBQ0E7QUFGUjtBQUNBO0FBSUk7QUFGSjtBQUNBO0FBQ0E7QUFJUTtBQUZSO0FBSVE7QUFDQTtBQUZSO0FBSVE7QUFGUjtBQUlRO0FBQ0E7QUFGUjtBQUlRO0FBRlI7QUFJUTtBQUZSO0FBQ0E7QUFLSTtBQUhKO0FBQ0E7QUFNUTtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUpaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRSTtBQU5KO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRUTtBQU5SO0FBQ0E7QUFDQTtBQVFJO0FBQ0k7QUFDQTtBQU5SO0FBQ0E7QUFRSTtBQU5KO0FBUVE7QUFDQTtBQU5SO0FBQ0E7QUFRSTtBQU5KO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBUUk7QUFOSjtBQVFRO0FBQ0E7QUFOUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRUTtBQU5SO0FBQ0E7QUFRSTtBQUNJO0FBTlI7QUFRUTtBQU5SO0FBUVE7QUFDQTtBQUNBO0FBQ0E7QUFOUjtBQVFRO0FBTlI7QUFDQTtBQVFJO0FBQ0k7QUFDQTtBQU5SO0FBQ0E7QUFRSTtBQUNJO0FBQ0E7QUFDSTtBQUNBO0FBTlo7QUFRWTtBQUNBO0FBQ0E7QUFOWjtBQUNBO0FBQ0E7QUFRSTtBQUNJO0FBTlI7QUFDQTtBQUNBO0FBUUk7QUFDSTtBQU5SO0FBUVE7QUFDSztBQUNBO0FBTmI7QUFRUTtBQU5SO0FBQ0E7QUFRSTtBQUNHO0FBQ0E7QUFDQTtBQU5QO0FBU087QUFDSTtBQVBYO0FBU087QUFQUDtBQVNPO0FBQ0E7QUFDQTtBQVBQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0k7QUFDSjtBQUNJO0FBQ0o7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ1E7QUFDQTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ0E7QUFDUjtBQUVRO0FBQVI7QUFHUTtBQURSO0FBQ0E7QUFHSTtBQUNJO0FBRFI7QUFHUTtBQUNJO0FBRFo7QUFHWTtBQUNJO0FBQ0k7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUFNO0FBRVY7QUFDSTtBQUNBO0FBQ0E7QUFBTTtBQUE5QjtBQUNBO0FBR1k7QUFDSTtBQUNJO0FBQ0E7QUFDSTtBQUNBO0FBQU07QUFFVjtBQUNJO0FBQ0E7QUFBTTtBQUE5QjtBQUNBO0FBQ0E7QUFDQTtBQUdRO0FBQ0k7QUFDQTtBQUNJO0FBQ0E7QUFDSTtBQUNBO0FBRHBCO0FBR29CO0FBQ0E7QUFEcEI7QUFDQTtBQUdnQjtBQURoQjtBQUdZO0FBQ0k7QUFDQTtBQURoQjtBQUNBO0FBQ0E7QUFDQTtBQUdJO0FBREo7QUFHUTtBQURSO0FBR1E7QUFEUjtBQUdRO0FBQ0E7QUFDQTtBQURSO0FBR1E7QUFEUjtBQUdRO0FBRFI7QUFDQTtBQUdJO0FBREo7QUFHUTtBQURSO0FBQ0E7QUFHSTtBQUNJO0FBQ0E7QUFEUjtBQUNBO0FBR0k7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQURSO0FBQ0E7QUFHSTtBQUNJO0FBRFI7QUFDQTtBQUNBO0FBR0k7QUFESjtBQUdRO0FBQ0k7QUFEWjtBQUdZO0FBRFo7QUFDQTtBQUdRO0FBRFI7QUFHWTtBQURaO0FBQ0E7QUFJUTtBQUZSO0FBQ0E7QUFJUTtBQUNJO0FBQ0E7QUFGWjtBQUlZO0FBQ0E7QUFGWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0k7QUFDSjtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0k7QUFDSjtBQUNJO0FBQ0k7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0k7QUFDSjtBQUNJO0FBQ0o7QUFDUTtBQUNSO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNSO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ0E7QUFDQTtBQUNJO0FBQ0o7QUFDUTtBQUNSO0FBQ1k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNBO0FBQ0E7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMTAwO1xuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBzdGFydE1vdmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vdmluZyA9IHRydWU7XG4gICAgfSxcbiAgICBcbiAgICBzdG9wTW92aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICAgaWYgKHRoaXMubW92aW5nKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCAtPSB0aGlzLnhTcGVlZCAqIGR0O1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgXG4gICAgICAgIHBpY2tSYWRpdXM6IDAsXG4gICAgICBcbiAgICAgICAgZ2FtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIGluaXQ6IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gMjU1O1xuICAgIH0sXG5cbiAgICByZXVzZSAoZ2FtZSkge1xuICAgICAgICB0aGlzLmluaXQoZ2FtZSk7XG4gICAgfSxcblxuICAgIGdldFBsYXllckRpc3RhbmNlOiBmdW5jdGlvbiAoKSB7XG4gICAgXG4gICAgICAgIHZhciBwbGF5ZXJQb3MgPSB0aGlzLmdhbWUucGxheWVyLmdldENlbnRlclBvcygpO1xuICAgICAgIFxuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG5cbiAgICBvblBpY2tlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgIFxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKHBvcyk7XG4gICAgICAgXG4gICAgICAgIHRoaXMuZ2FtZS5kZXNwYXduU3Rhcih0aGlzLm5vZGUpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGxheWVyRGlzdGFuY2UoKSA8IHRoaXMucGlja1JhZGl1cykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm9uUGlja2VkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICBcbiAgICAgICAgdmFyIG9wYWNpdHlSYXRpbyA9IDEgLSB0aGlzLmdhbWUudGltZXIvdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcbiAgICAgICAgdmFyIG1pbk9wYWNpdHkgPSA1MDtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8gKiAoMjU1IC0gbWluT3BhY2l0eSkpO1xuICAgIH0sXG59KTsiLCJjb25zdCBQbGF5ZXIgPSByZXF1aXJlKCdQbGF5ZXInKTtcbmNvbnN0IEJhY2tncm91bmQgPSByZXF1aXJlKCdCYWNrZ3JvdW5kJyk7XG5jb25zdCBTY29yZUZYID0gcmVxdWlyZSgnU2NvcmVGWCcpO1xuY29uc3QgU3RhciA9IHJlcXVpcmUoJ1N0YXInKTtcbmNvbnN0IEZpc2ggPSByZXF1aXJlKCdGaXNoJyk7XG5cbnZhciBHYW1lID0gY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIFxuICAgICAgICBzdGFyUHJlZmFiOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3JlRlhQcmVmYWI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgZmlzaFByZWZhYjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuICAgICAgICBtYXhTdGFyRHVyYXRpb246IDAsXG4gICAgICAgIG1pblN0YXJEdXJhdGlvbjogMCxcbiAgICAgIFxuICAgICAgICBncm91bmQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICBcbiAgICAgICAgcGxheWVyOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogUGxheWVyXG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBiZzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEJhY2tncm91bmRcbiAgICAgICAgfSxcbiAgICAgIFxuICAgICAgICBzY29yZURpc3BsYXk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuICAgICBcbiAgICAgICAgc2NvcmVBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH0sXG4gICAgICAgIHNwbGFzaDFBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bk5vZGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIGdhbWVPdmVyTm9kZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgY29udHJvbEhpbnRMYWJlbDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgICAgIGtleWJvYXJkSGludDoge1xuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICBtdWx0aWxpbmU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgdG91Y2hIaW50OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIG11bHRpbGluZTogdHJ1ZVxuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICBcbiAgICAgICAgdGhpcy5ncm91bmRZID0gdGhpcy5ncm91bmQueSArIHRoaXMuZ3JvdW5kLmhlaWdodC8yO1xuXG5cblxuICAgICAgICAvLyBzdG9yZSBsYXN0IHN0YXIncyB4IHBvc2l0aW9uXG4gICAgICAgIHRoaXMuY3VycmVudFN0YXIgPSBudWxsO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyWCA9IDA7XG5cbiAgICAgXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG5cbiAgICAgICAgLy8gaXMgc2hvd2luZyBtZW51IG9yIHJ1bm5pbmcgZ2FtZVxuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgY29udHJvbCBoaW50XG4gICAgICAgIHZhciBoaW50VGV4dCA9IGNjLnN5cy5pc01vYmlsZSA/IHRoaXMudG91Y2hIaW50IDogdGhpcy5rZXlib2FyZEhpbnQ7XG4gICAgICAgIHRoaXMuY29udHJvbEhpbnRMYWJlbC5zdHJpbmcgPSBoaW50VGV4dDtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHN0YXIgYW5kIHNjb3JlIHBvb2xcbiAgICAgICAgdGhpcy5zdGFyUG9vbCA9IG5ldyBjYy5Ob2RlUG9vbCgnU3RhcicpO1xuICAgICAgICB0aGlzLnNjb3JlUG9vbCA9IG5ldyBjYy5Ob2RlUG9vbCgnU2NvcmVGWCcpO1xuICAgIH0sXG5cbiAgICBvblN0YXJ0R2FtZTogZnVuY3Rpb24gKCkge1xuICAgICAgIFxuICAgICAgICAvLyB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgICAgLy8gc2V0IGdhbWUgc3RhdGUgdG8gcnVubmluZ1xuICAgICAgICB0aGlzLmlzUnVubmluZyA9IHRydWU7XG4gICAgICAgIC8vIHNldCBidXR0b24gYW5kIGdhbWVvdmVyIHRleHQgb3V0IG9mIHNjcmVlblxuICAgICAgICB0aGlzLmJ0bk5vZGUuc2V0UG9zaXRpb25YKDMwMDApO1xuICAgICAgICB0aGlzLmdhbWVPdmVyTm9kZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8gcmVzZXQgcGxheWVyIHBvc2l0aW9uIGFuZCBtb3ZlIHNwZWVkXG4gICAgICAgIHRoaXMucGxheWVyLnN0YXJ0TW92ZUF0KGNjLnAoMCwgdGhpcy5ncm91bmRZKSk7XG4gICAgICAgIC8vIHNwYXduIHN0YXJcbiAgICAgICAgdGhpcy5zcGF3bk5ld1N0YXIoKTtcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNwbGFzaDFBdWRpbywgZmFsc2UpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5pbml0U2NlbmUoKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYmcuc3RhcnRNb3ZpbmcoKTtcbiAgICB9LFxuXG5cbiAgICBpbml0U2NlbmU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy9wbGFjZSBmaXNoXG4gICAgICAgIHRoaXMuZmlzaEFyID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTsgaSsrKXtcbiAgICAgICAgICAgIHZhciBmaXNoID0gY2MuaW5zdGFudGlhdGUodGhpcy5maXNoUHJlZmFiKTtcbiAgICAgICAgICAgIGZpc2guc2V0UG9zaXRpb24odGhpcy5nZXROZXdGaXNoUG9zaXRpb24oKSk7XG4gICAgICAgICAgICB0aGlzLmZpc2hBci5wdXNoKGZpc2gpO1xuICAgICAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKGZpc2gpO1xuICAgICAgICAgICAgZmlzaC5nZXRDb21wb25lbnQoJ0Zpc2gnKS5pbml0KHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvL3BsYWNlIHJvY2tzXG4gICAgICAgIFxuICAgIH0sXG5cblxuICAgIHNwYXduTmV3U3RhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIHZhciBuZXdTdGFyID0gbnVsbDtcbiAgICAgXG4gICAgICAgIC8vIGlmICh0aGlzLnN0YXJQb29sLnNpemUoKSA+IDApIHtcbiAgICAgICAgLy8gICAgIG5ld1N0YXIgPSB0aGlzLnN0YXJQb29sLmdldCh0aGlzKTsgLy8gdGhpcyB3aWxsIGJlIHBhc3NlZCB0byBTdGFyJ3MgcmV1c2UgbWV0aG9kXG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICBuZXdTdGFyID0gY2MuaW5zdGFudGlhdGUodGhpcy5zdGFyUHJlZmFiKTtcbiAgICAgICAgLy8gfVxuICAgICAgXG4gICAgICAgIC8vIHRoaXMubm9kZS5hZGRDaGlsZChuZXdTdGFyKTtcbiAgICAgICBcbiAgICAgICAgLy8gbmV3U3Rhci5zZXRQb3NpdGlvbih0aGlzLmdldE5ld1N0YXJQb3NpdGlvbigpKTtcbiAgICAgICAgLy8gLy8gcGFzcyBHYW1lIGluc3RhbmNlIHRvIHN0YXJcbiAgICAgICAgLy8gbmV3U3Rhci5nZXRDb21wb25lbnQoJ1N0YXInKS5pbml0KHRoaXMpO1xuICAgICAgICAvLyBzdGFydCBzdGFyIHRpbWVyIGFuZCBzdG9yZSBzdGFyIHJlZmVyZW5jZVxuICAgICAgICB0aGlzLnN0YXJ0VGltZXIoKTtcbiAgICAgICAgLy90aGlzLmN1cnJlbnRTdGFyID0gbmV3U3RhcjtcbiAgICB9LFxuXG4gICAgZGVzcGF3blN0YXIgKHN0YXIpIHtcbiAgICAgICAgdGhpcy5zdGFyUG9vbC5wdXQoc3Rhcik7XG4gICAgICAgIHRoaXMuc3Bhd25OZXdTdGFyKCk7XG4gICAgfSxcblxuICAgIHN0YXJ0VGltZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgXG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgIH0sXG5cbiAgICBnZXROZXdTdGFyUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gaWYgdGhlcmUncyBubyBzdGFyLCBzZXQgYSByYW5kb20geCBwb3NcbiAgICAgICAgLy8gaWYgKCF0aGlzLmN1cnJlbnRTdGFyKSB7XG4gICAgICAgIC8vICAgICB0aGlzLmN1cnJlbnRTdGFyWCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpICogdGhpcy5ub2RlLndpZHRoLzI7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gdmFyIHJhbmRYID0gMDtcbiAgICAgICBcbiAgICAgICAgLy8gdmFyIHJhbmRZID0gdGhpcy5ncm91bmRZICsgY2MucmFuZG9tMFRvMSgpICogdGhpcy5wbGF5ZXIuanVtcEhlaWdodCArIDUwO1xuICAgICAgIFxuICAgICAgICAvLyB2YXIgbWF4WCA9IHRoaXMubm9kZS53aWR0aC8yO1xuICAgICAgICAvLyBpZiAodGhpcy5jdXJyZW50U3RhclggPj0gMCkge1xuICAgICAgICAvLyAgICAgcmFuZFggPSAtY2MucmFuZG9tMFRvMSgpICogbWF4WDtcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICAgIHJhbmRYID0gY2MucmFuZG9tMFRvMSgpICogbWF4WDtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyB0aGlzLmN1cnJlbnRTdGFyWCA9IHJhbmRYO1xuICAgICAgXG4gICAgICAgIC8vIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XG4gICAgfSxcbiAgICBcbiAgICBnZXROZXdGaXNoUG9zaXRpb246IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgcmFuZFggPSAwO1xuICAgICAgICB2YXIgcmFuZFkgPSB0aGlzLmdyb3VuZFkgKyBjYy5yYW5kb20wVG8xKCkgKiB0aGlzLnBsYXllci5qdW1wSGVpZ2h0ICsgNTA7XG4gICAgICAgXG4gICAgICAgIC8vIHZhciBtYXhYID0gdGhpcy5ub2RlLndpZHRoLzI7XG4gICAgICAgIC8vIGlmICh0aGlzLmN1cnJlbnRTdGFyWCA+PSAwKSB7XG4gICAgICAgIC8vICAgICByYW5kWCA9IC1jYy5yYW5kb20wVG8xKCkgKiBtYXhYO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgcmFuZFggPSBjYy5yYW5kb20wVG8xKCkgKiBtYXhYO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIHRoaXMuY3VycmVudFN0YXJYID0gcmFuZFg7XG4gICAgICBcbiAgICAgICAgcmV0dXJuIGNjLnAocmFuZFgsIHJhbmRZKTtcbiAgICB9LFxuXG4gICAgZ2FpblNjb3JlOiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHRoaXMuc2NvcmUgKz0gMTtcbiAgICAgICBcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gJ1Njb3JlOiAnICsgdGhpcy5zY29yZS50b1N0cmluZygpO1xuICAgICAgIFxuICAgICAgICB2YXIgZnggPSB0aGlzLnNwYXduU2NvcmVGWCgpO1xuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQoZngubm9kZSk7XG4gICAgICAgIGZ4Lm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgICAgZngucGxheSgpO1xuICAgICAgICBcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNjb3JlID0gMDtcbiAgICAgICAgdGhpcy5zY29yZURpc3BsYXkuc3RyaW5nID0gJ1Njb3JlOiAnICsgdGhpcy5zY29yZS50b1N0cmluZygpO1xuICAgIH0sXG5cbiAgICBzcGF3blNjb3JlRlg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZ4O1xuICAgICAgICBpZiAodGhpcy5zY29yZVBvb2wuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgZnggPSB0aGlzLnNjb3JlUG9vbC5nZXQoKTtcbiAgICAgICAgICAgIHJldHVybiBmeC5nZXRDb21wb25lbnQoJ1Njb3JlRlgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZ4ID0gY2MuaW5zdGFudGlhdGUodGhpcy5zY29yZUZYUHJlZmFiKS5nZXRDb21wb25lbnQoJ1Njb3JlRlgnKTtcbiAgICAgICAgICAgIGZ4LmluaXQodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gZng7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZGVzcGF3blNjb3JlRlggKHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZVBvb2wucHV0KHNjb3JlRlgpO1xuICAgIH0sXG5cbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWVcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbikge1xuICAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZXIgKz0gZHQ7XG4gICAgfSxcblxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgdGhpcy5nYW1lT3Zlck5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICB0aGlzLnBsYXllci5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgdGhpcy5wbGF5ZXIuc3RvcE1vdmUoKTtcbiAgIFxuICAgXG4gICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZpc2hBci5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgIHRoaXMuZmlzaEFyW2ldLmRlc3Ryb3k7XG4gICAgICAgfVxuICAgICAgIHRoaXMuZmlzaEFyID0gdW5kZWZpbmVkOyBcbiAgICBcbiAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICAgICAgIHRoaXMuYnRuTm9kZS5zZXRQb3NpdGlvblgoMCk7XG4gICAgICAgdGhpcy5iZy5zdG9wTW92aW5nKCk7XG4gICAgfVxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgXG4gICAgICAgIGp1bXBIZWlnaHQ6IDAsXG4gICAgICAgXG4gICAgICAgIGp1bXBEdXJhdGlvbjogMCxcbiAgICAgICBcbiAgICAgICAgc3F1YXNoRHVyYXRpb246IDAsXG4gICAgICAgXG4gICAgICAgIG1heE1vdmVTcGVlZDogMCxcbiAgICAgIFxuICAgICAgICBhY2NlbDogMCxcbiAgICAgXG4gICAgICAgIGp1bXBBdWRpbzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICBcbiAgICAgICAgdGhpcy5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgIFxuICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG4gICAgICAgIC8vIHNjcmVlbiBib3VuZGFyaWVzXG4gICAgICAgIHRoaXMubWluUG9zWCA9IC10aGlzLm5vZGUucGFyZW50LndpZHRoLzI7XG4gICAgICAgIHRoaXMubWF4UG9zWCA9IHRoaXMubm9kZS5wYXJlbnQud2lkdGgvMjtcblxuICAgICAgXG4gICAgICAgIHRoaXMuanVtcEFjdGlvbiA9IHRoaXMuc2V0SnVtcEFjdGlvbigpO1xuXG4gICAgICAgXG4gICAgICAgIHRoaXMuc2V0SW5wdXRDb250cm9sKCk7XG4gICAgfSxcblxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vYWRkIGtleWJvYXJkIGlucHV0IGxpc3RlbmVyIHRvIGp1bXAsIHR1cm5MZWZ0IGFuZCB0dXJuUmlnaHRcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLktFWUJPQVJELFxuICAgICAgICAgICAgLy8gc2V0IGEgZmxhZyB3aGVuIGtleSBwcmVzc2VkXG4gICAgICAgICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkubGVmdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIHVuc2V0IGEgZmxhZyB3aGVuIGtleSByZWxlYXNlZFxuICAgICAgICAgICAgb25LZXlSZWxlYXNlZDogZnVuY3Rpb24oa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2goa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkucmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG5cbiAgICAgICAgLy8gdG91Y2ggaW5wdXRcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLlRPVUNIX09ORV9CWV9PTkUsXG4gICAgICAgICAgICBvblRvdWNoQmVnYW46IGZ1bmN0aW9uKHRvdWNoLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciB0b3VjaExvYyA9IHRvdWNoLmdldExvY2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoTG9jLnggPj0gY2Mud2luU2l6ZS53aWR0aC8yKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRvbid0IGNhcHR1cmUgdGhlIGV2ZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25Ub3VjaEVuZGVkOiBmdW5jdGlvbih0b3VjaCwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG4gICAgfSxcblxuICAgIHNldEp1bXBBY3Rpb246IGZ1bmN0aW9uICgpIHtcbiAgXG4gICAgICAgIHZhciBqdW1wVXAgPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbk91dCgpKTtcbiAgICAgXG4gICAgICAgIHZhciBqdW1wRG93biA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLCAtdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbkluKCkpO1xuICAgICAgXG4gICAgICAgIHZhciBzcXVhc2ggPSBjYy5zY2FsZVRvKHRoaXMuc3F1YXNoRHVyYXRpb24sIDEsIDAuNik7XG4gICAgICAgIHZhciBzdHJldGNoID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAxLjIpO1xuICAgICAgICB2YXIgc2NhbGVCYWNrID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAxKTtcbiAgICAgIFxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYy5jYWxsRnVuYyh0aGlzLnBsYXlKdW1wU291bmQsIHRoaXMpO1xuICAgICAgIFxuICAgICAgICByZXR1cm4gY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShzcXVhc2gsIHN0cmV0Y2gsIGp1bXBVcCwgc2NhbGVCYWNrLCBqdW1wRG93biwgY2FsbGJhY2spKTtcbiAgICB9LFxuXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgZ2V0Q2VudGVyUG9zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjZW50ZXJQb3MgPSBjYy5wKHRoaXMubm9kZS54LCB0aGlzLm5vZGUueSArIHRoaXMubm9kZS5oZWlnaHQvMik7XG4gICAgICAgIHJldHVybiBjZW50ZXJQb3M7XG4gICAgfSxcblxuICAgIHN0YXJ0TW92ZUF0OiBmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKHBvcyk7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5zZXRKdW1wQWN0aW9uKCkpO1xuICAgIH0sXG5cbiAgICBzdG9wTW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcbiAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIGlmICggTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQgKSB7XG4gICAgICAgICAgICAvLyBpZiBzcGVlZCByZWFjaCBsaW1pdCwgdXNlIG1heCBzcGVlZCB3aXRoIGN1cnJlbnQgZGlyZWN0aW9uXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgIFxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuXG4gICAgICAgIC8vIGxpbWl0IHBsYXllciBwb3NpdGlvbiBpbnNpZGUgc2NyZWVuXG4gICAgICAgIGlmICggdGhpcy5ub2RlLnggPiB0aGlzLm5vZGUucGFyZW50LndpZHRoLzIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm9kZS54IDwgLXRoaXMubm9kZS5wYXJlbnQud2lkdGgvMikge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSAtdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiY2MuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcblxuICAgIGluaXQgKHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZUZYID0gc2NvcmVGWDtcbiAgICB9LFxuXG4gICAgaGlkZUZYOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVGWC5kZXNwYXduKCk7XG4gICAgfSxcbn0pOyIsImNjLkNsYXNzKHtcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5BbmltYXRpb25cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0IChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuYW5pbS5nZXRDb21wb25lbnQoJ1Njb3JlQW5pbScpLmluaXQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlc3Bhd24gKCkge1xuICAgICAgICB0aGlzLmdhbWUuZGVzcGF3blNjb3JlRlgodGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0ucGxheSgnc2NvcmVfcG9wJyk7XG4gICAgfVxufSk7XG4iLCJjYy5DbGFzcyh7XG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICBcbiAgICAgICAgcGlja1JhZGl1czogMCxcbiAgICAgIFxuICAgICAgICBnYW1lOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgc2VyaWFsaXphYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgaW5pdDogZnVuY3Rpb24gKGdhbWUpIHtcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgfSxcblxuICAgIHJldXNlIChnYW1lKSB7XG4gICAgICAgIHRoaXMuaW5pdChnYW1lKTtcbiAgICB9LFxuXG4gICAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICAgICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0Q2VudGVyUG9zKCk7XG4gICAgICAgXG4gICAgICAgIHZhciBkaXN0ID0gY2MucERpc3RhbmNlKHRoaXMubm9kZS5wb3NpdGlvbiwgcGxheWVyUG9zKTtcbiAgICAgICAgcmV0dXJuIGRpc3Q7XG4gICAgfSxcblxuICAgIG9uUGlja2VkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMubm9kZS5nZXRQb3NpdGlvbigpO1xuICAgICAgXG4gICAgICAgIHRoaXMuZ2FtZS5nYWluU2NvcmUocG9zKTtcbiAgICAgICBcbiAgICAgICAgdGhpcy5nYW1lLmRlc3Bhd25TdGFyKHRoaXMubm9kZSk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgIFxuICAgICAgICB2YXIgb3BhY2l0eVJhdGlvID0gMSAtIHRoaXMuZ2FtZS50aW1lci90aGlzLmdhbWUuc3RhckR1cmF0aW9uO1xuICAgICAgICB2YXIgbWluT3BhY2l0eSA9IDUwO1xuICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IG1pbk9wYWNpdHkgKyBNYXRoLmZsb29yKG9wYWNpdHlSYXRpbyAqICgyNTUgLSBtaW5PcGFjaXR5KSk7XG4gICAgfSxcbn0pO1xuIl19