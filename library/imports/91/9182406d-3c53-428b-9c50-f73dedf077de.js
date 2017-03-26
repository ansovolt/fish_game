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