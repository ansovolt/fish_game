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