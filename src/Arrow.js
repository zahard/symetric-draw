



Arrow = function(cxt,type,tile)
{
    this.cxt = cxt;
    this.tile = tile;
    this.type = type;

    this.width = 64;
    this.height = 64;


    this.clickCallbacks = [];

    if (type === 'left')
    {
        this.x = 5;
        this.y = 5;
    }
    else
    {
        this.x = 900 - 64 - 5;
        this.y = 5;
    }
}

Arrow.prototype = 
{
    active: false,

    draw: function()
    {   
        var tileX = (this.type === 'left') ? 0 : 1;
        var tileY = (this.active) ? 0 : 1;

        this.cxt.drawImage(this.tile,
            tileX * 64, tileY * 64,
            64, 64,
            this.x, this.y,
            this.width,  this.height
        )
    },

    click: function()
    {
        if (this.clickCallbacks.length > 0)
        {
            for (var i = 0; i < this.clickCallbacks.length; i++)
            {
                this.clickCallbacks[i].call(this,this);
            }
        }   
    },

    onclick: function(f)
    {
        this.clickCallbacks.push(f);
    },

    isClicked: function(mouse)
    {
        if (mouse.x >= this.x && mouse.x <= this.x + this.width && 
            mouse.y >= this.y && mouse.y <= this.y + this.height)
        {
            return true;
        }
        return false;
    },

    moveCenterTo: function(center)
    {
        var offsetFromCenter = 70;
        if(this.type == 'left')
        {
            this.x = center - this.width - offsetFromCenter;    
        }
        else if(this.type == 'right')
        {
            this.x = center + offsetFromCenter;    
        }
        
    }
};

GrabButton = function()
{
    this.x = 450;
    this.y = 50;
}

