cc.Class({
    extends: cc.Component,

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
    onLoad: function () {
        this.xSpeed = 100;
        this.moving = false;
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

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.moving) {
            this.node.x -= this.xSpeed * dt;
        }
    },
});
