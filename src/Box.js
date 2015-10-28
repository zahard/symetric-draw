

function Box(x,y,size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.half = size/2;
    this.width = size;
    this.height = size;

    this.tile = Registry.get('app').images.box;

    this.speedY = 0;
    this.accY = 2;
    this.maxSpeed = 18;

    this.isFalling = true;

    this.angle = 0;
}

Box.prototype.draw = function()
{
    var cxt  = Registry.get('app').layers.boxes;

    if(this.falling)
    {
        var offset = this.speedY * 2;
        cxt.save();
        cxt.setProperties({
            'globalAlpha': 0.1,
            'fillStyle': '#fff'
        });

        cxt.fillRect(
            this.x - this.size/2, this.y - this.size/2 - offset,
            this.size,this.size + offset
        );

        cxt.drawImage(this.tile,
            0,0,100,100,
            this.x - this.size/2, this.y - this.size/2 - offset,
            this.size,this.size + offset
        );
        
        cxt.restore();
    }

    cxt.save();
    if(this.angle != 0 )
    {
        cxt.translate( this.pointOfSpin.x, this.pointOfSpin.y );

        cxt.rotate( this.rad(this.angle) );
        cxt.drawImage(this.tile,
            0,0,100,100,
           - this.size +  this.diff, -this.size,
            this.size,this.size
        );
    } else {
        cxt.drawImage(this.tile,
            0,0,100,100,
            this.x - this.size/2, this.y - this.size/2,
            this.size,this.size
        );
    }

    cxt.restore();
}

Box.prototype.rad = function(angle){
    return (Math.PI/180)*angle;
}


Box.prototype.update = function()
{
    var update = false;
    if (this.isFalling)
    {
        this.speedY += this.accY;
        if (this.speedY >this.maxSpeed)
        {
            this.speedY = this.maxSpeed;
        }

        Registry.get('app').moveBox(this, 0, this.speedY)

        update = true;
    }

    if (this.isMagniting)
    {
        return true;
    }

    if (this.isSpinning)
    {
        if (this.angle != this.endAngle)
        {
            this.angle += this.angleStep;
        }
        else
        {
            this.isSpinning = false;
            this.angle = 0;
            this.x = this.finalPos.x;
            this.y = this.finalPos.y;
            this.isFalling = true;
        }

        return true;
    }

    return update;
}

Box.prototype.startSpin = function(box)
{
    this.isSpinning = true;

    point = {};
    this.finalPos = {};

    var al = this.x - this.width/2;
    var bl = box.x - box.width/2;

    var ar = this.x + this.width/2;
    var br = box.x + box.width/2;

    l_diff = bl - al;
    r_diff = ar - br;
    console.log(l_diff,r_diff)

    if (l_diff > r_diff){
        
        point.x = bl - 3;

        this.angle = 360;
        this.endAngle = 270;
        this.angleStep = -10;
        
        this.finalPos.x = bl - this.width/2 - 3;
        this.finalPos.y= this.y + l_diff;

        this.diff = this.width - l_diff;

    }else{
        point.x = br+3;
        this.angle = 0;
        this.endAngle = 90;
        this.angleStep = 10;

        this.finalPos.x = br + this.width/2 + 3;
        this.finalPos.y= this.y + r_diff;
        this.diff = r_diff;
    }
    point.y = box.y - box.height/2 + 1;

    this.pointOfSpin = point;



}

Box.prototype.onMagnetGrab = function()
{
    this.isMagniting = true;
    this.isFalling = false;
}

Box.prototype.onMagnetRelease = function()
{
    this.isMagniting = false;
    this.isFalling = true;
}

