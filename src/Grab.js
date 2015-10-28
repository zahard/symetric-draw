
Grab = function(cxt, tile, x)
{
    this.tile = tile;
    this.cxt = cxt;

    this.x = x;
    this.y = 0;

    this.width = 120;
    this.height = 75;
    
    this.speed = 0;
    this.step = 1;

    this.grabSpeed = 3;

    this.grabLimit = this.y + this.height;

    this.prevFrame = 0;

    this.isMagnetOn = false;

    this.magnetTarget = null;

    this.arrowOffset = 70;
}

Grab.prototype.isClicked = function(mouse)
{
    var w = this.width/2 - 20;
    var h = this.height - 20;
    var x =  this.x;
    var y =  this.y;
    
    if (mouse.x >= x - w && mouse.x <= x + w &&
        mouse.y >= y  && mouse.y <= y + h )
    {
        return true;
    }
    return false;
};

Grab.prototype.click = function(mouse)
{
    if (! this.isMagnetOn)
    {
        this.activateMagnet();
    } else {
        this.deactivateMagnet(); 
    }
};

Grab.prototype.activateMagnet = function()
{
    this.isMagnetOn = true;
    this.draw();

    Registry.get('app').activateMagnet(this);
}

Grab.prototype.deactivateMagnet = function()
{
    this.isMagnetOn = false;

    if (this.magnetTarget)
    {
        this.magnetTarget.onMagnetRelease()
        this.setTarget(null);
    }

    this.drawLightnings();
    this.draw();

    Registry.get('app').deactivateMagnet(this);
}

Grab.prototype.setTarget = function(target){
    this.magnetTarget = target;
    if (target)
    {
        target.onMagnetGrab();
    }
}

Grab.prototype.getTarget = function(){
    return this.magnetTarget;
}

Grab.prototype.drawLightnings = function(mouse)
{
    Registry.get('app').layers.effect.empty();

    if (this.magnetTarget == null)
    {
        return;
    }

    var now = new Date().getTime();

    //Move with 0.5 sec interval like chained mech
    if(now - this.prevFrame < 1000/20)
    {
        return false;
    }
    else
    {
        this.prevFrame = now;    
    }


    var l1 = this.lightnings[0];
    var l2 = this.lightnings[1];
    var point = {
        x: this.magnetTarget.x,
        y: this.magnetTarget.y, 
        d:300,
        r:5
    };

    l1.pa = {
        x: this.x - 40,
        y: this.y + 40,
        d:-300,r:5
    }

    l2.pa = {
        x: this.x + 40,
        y: this.y + 40,
        d:-300,r:5
    }

    l1.pb = point;
    l2.pb = point;

    l1.boom();
    l2.boom();
}

Grab.prototype.draw = function() {
    this.cxt.empty();
    this.cxt.drawImage(
        this.tile,
        this.x - this.width / 2, this.y,
        this.width, this.height
    );

    var mag = Registry.get('app').images.magnet;

    var tileX = this.isMagnetOn ? 0 : 1;
    this.cxt.drawImage(mag,
        tileX * 128, 0,
        128, 128,
        this.x - 32, this.y + 2,
        64, 64
    )
};

Grab.prototype.update = function() {

    var needUpdate = false;

    if (this.active)
    {
        needUpdate = true;
        var x = this.x + this.speed;
       
        if( x <= this.width / 2 +  this.arrowOffset || x >= 900 - this.width / 2 -  this.arrowOffset)
        {
            this.stop();
            needUpdate = false;
        }
        this.x = x;

        Registry.get('app').updateArrowsPosition();    
    }

    if (this.isMagnetOn && this.magnetTarget !== null)
    {
        //Update magnet target
        this.dragTarget();

        //check if magent not went too far
        if( this.x - this.width/2  - this.magnetTarget.x > 40 ||
            this.x + this.width/2  - this.magnetTarget.x < -40
         )
        {
            this.deactivateMagnet();
        }
    }

    return needUpdate;
}; 

Grab.prototype.dragTarget = function()
{
    var target = this.magnetTarget;
    if (!target)
    {
        return;
    }


    var augmentX = 0;
    var augmentY = 0;

    //Pull up box
    if (target.y - target.size/2 - this.grabSpeed >= this.grabLimit) 
    {
        augmentY -= this.grabSpeed;
    }

    //Move box to side with grabber
    if (this.speed)
    {
        augmentX += this.speed;
    }

    //Pull box to the center of grabber
    if (target.x + augmentX != this.x)
    {   
        
        augmentX += (this.x - target.x > 0) ? 1: -1;
    }

    if (augmentX != 0 || augmentY != 0)
    {
        Registry.get('app').moveBox(target,augmentX,augmentY);
    }

};

Grab.prototype.setSpeed = function(speed) {
    this.speed = speed;
};

Grab.prototype.moveLeft = function() {
    this.active = true;
    this.setSpeed(-this.step);

     Registry.get('app').activateArrow('left')
};

Grab.prototype.moveRight = function() {
    this.active = true;
    this.setSpeed(this.step);

    Registry.get('app').activateArrow('right')
};

Grab.prototype.stop = function() {
    this.active = false;
    this.setSpeed(0);

    Registry.get('app').activateArrow()

};