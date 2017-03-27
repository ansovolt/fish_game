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