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