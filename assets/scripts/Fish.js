

cc.Class({
    extends: cc.Component,

    properties: {
  
        pickRadius: 0,
      
        game: {
            default: null,
            serializable: false
        }
    },

    onLoad: function () {
        this.enabled = false;
        this.xSpeed = 100;
        this.moving = false;
    },

    // use this for initialization
    init: function (game) {
        this.game = game;
        this.enabled = true;
        this.node.opacity = 255;
    },

    reuse (game) {
        this.init(game);
    },

    getPlayerDistance: function () {
    
        var playerPos = this.game.player.getCenterPos();
       
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function() {
        
        cc.log('finsh:onPicked');
        var pos = this.node.getPosition();
      
        this.game.gainScore(pos);
       
        this.game.despawnFish(this.node);
    },

    // called every frame
    update: function (dt) {
        
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
    startMoving: function () {
        this.moving = true;
    },
    
    stopMoving: function () {
        this.moving = false;
    },
    
    getX: function(){
        return this.node.x;
    },
    getY: function(){
        return this.node.y;
    },
    
    resetPosition: function (){
        this.node.x = 2745;  
    },
});