
window.onload = function()
{
	window.game = new Game(900,640);

	//Fix android browsers bug
	setTimeout(function(){
		//game.onResize();
	},100)
}

function Game(width, height)
{
	Registry.add('app',this);

	this.width = width;
	this.height = height;

	this.wrapper = $('wrapper');
	
	this.offsetTop = this.wrapper.offsetTop;
	this.offsetLeft = this.wrapper.offsetLeft;

	this.layers = {
		back:    new Layer( $('back'), width, height, 1),
		statics: new Layer( $('statics'), width, height, 2),
		effect:  new Layer( $('effect'), width, height, 3),
		grab:    new Layer( $('grab'), width, height, 5),
		boxes:   new Layer( $('boxes'), width, height, 4),
		controls:  new Layer( $('controls'), width, height, 8)
	};
	
	//Iages and tiles used in game
	this.images = {
		back: $('img-back'),
		grab: $('img-grab'),
		box: $('img-box'),
		arrows: $('img-arrows'),
		magnet: $('img-magnet'),
		wood: $('img-wood'),
		metal: $('img-metal')
	};

	//YOU CAN KEEP LINKS TO SOUND HERE
	this.sounds = {
		//zap: $('audio-electro')
	};
	

	this.grab = new Grab(this.layers.grab, this.images.grab, 550);

	this.grab.lightnings = [
		new Lightning( this.layers.effect,{x:0,y:0},{x:1,y:1}),
		new Lightning( this.layers.effect,{x:0,y:0},{x:1,y:1})
	];
	
	var leftArrow = new Arrow( this.layers.controls, 'left',  this.images.arrows);
	leftArrow.onclick(function(arrow) {
		if (this.grab.active)
		{
			this.grab.stop();
		}
		else
		{
			this.grab.moveLeft();	
		}

		return;

		if (this.grab.speed >= 0)
		{
			this.grab.moveLeft();
		}
		else
		{
			this.grab.stop();
		}
	}.bind(this));

	var rightArrow = new Arrow( this.layers.controls, 'right',  this.images.arrows);
	rightArrow.onclick(function(arrow) {
		if (this.grab.active)
		{
			this.grab.stop();
		}
		else
		{
			this.grab.moveRight();	
		}

		return;
		
		if (this.grab.speed <= 0)
		{
			this.grab.moveRight();
		} 
		else 
		{
			this.grab.stop();	
		}

	}.bind(this));

	this.clickables.push(
		Registry.add('l_arrow', leftArrow),
		Registry.add('r_arrow', rightArrow),
		Registry.add('grab', this.grab)
	);

	this.updateArrowsPosition();

	this.addBoxes();

	this.addListeners();	

	this.drawBackground();

	this.draw();

	this.drawBoxes();

	this.animate();

}

Game.prototype = {

	activePoint: {
		x:0, y:0
	},

	MOUSE_HOLDED: false,

	up:true,

	clickables: [],

	animate: function()
	{
		if (this.update())
		{
			this.draw();
		}

		if(this.grab.isMagnetOn)
		{
			this.grab.drawLightnings();
		}

		if (this.boxUpdates())
		{
			this.drawBoxes();
		}

		setTimeout(function(){
			this.animate();
		}.bind(this), 1000/60);
	},

	click: function()
	{
		var obj;
		for(var i = 0; i < this.clickables.length; i++)
		{
			obj = Registry.get(this.clickables[i]);
			if (obj.isClicked(this.activePoint))
			{
				obj.click();
			}
		}
		
	},


	update: function()
	{

		var needRedraw = false;

		if(this.grab.update())
		{
			needRedraw = true;
		}

		return needRedraw;
	},


	activateMagnet: function(grab) {
		var target = this.findMagnetTarget(grab);
		if(target)
		{
			grab.setTarget(target);	
		}
		else{
			setTimeout(function(){
				if(!grab.getTarget())
				{
					grab.deactivateMagnet();
				}
			},100);
			
		}
	},

	deactivateMagnet: function(grab) {
	    
	},

	findMagnetTarget: function(grab)
	{
		var inBeam = [], box;
		for (var i =0; i< this.boxes.length;i++)
		{
			box = Registry.get(this.boxes[i]);
			if (box.x > grab.x - grab.width / 2 && box.x < grab.x + grab.width / 2)
			{
				inBeam.push(box);
			}
		}

		if (inBeam.length)
		{
			inBeam.sort(function(a,b){
				if(a.y == b.y)
				{
					return 0;
				}
				return a.y > b.y ? 1 : -1;
			});

			return inBeam[0];
		}

		return null;
	},

	draw: function()
	{

		this.drawArrows();

		this.drawGrab();

	},

	drawGrab: function()
	{
		this.grab.draw();
	},

	drawBackground: function()
	{
		
		this.layers.back.drawImage(
			this.images.back,
			0,0,
			//300,168,
			// /0,0,
			this.width, this.height
		);

		this.drawPlatforms();

	},


	drawPlatforms: function()
	{
		this.platforms = [];

		this.platforms.push(
			Registry.add(new Platform('wood',400, 450,400))
			//Registry.add(new Platform('wood',150 , 10,400)),
			//Registry.add(new Platform('metal',200 , 10,120))
		);

		for(var i = 0; i < this.platforms.length; i++)
		{
			Registry.get(this.platforms[i]).draw();
		}

	},

	drawArrows: function()
	{
		this.layers.controls.empty();
		
		Registry.get('l_arrow').draw();
		Registry.get('r_arrow').draw();

	},

	updateArrowsPosition: function()
	{
		var center = this.grab.x;

		Registry.get('l_arrow').moveCenterTo(center);
		Registry.get('r_arrow').moveCenterTo(center);

	},

	drawBox: function()
	{
		this.layers.boxes.empty();
		this.layers.boxes.drawImage(
			this.images.box,
			0,0,
			100,100,
			this.boxX,this.boxY,
			100,100
		);
	},

	drawTile: function(x,y,tile)
	{
		this.layers.squares.drawImage(
			this.images.tiles,
			100 * tile.color, 0,
			100, 100,
			x, y,
			55, 55
		);
	},

	activateArrow: function(type)
	{
		if (type == 'left')
		{
			Registry.get('l_arrow').active = true;
   			Registry.get('r_arrow').active = false;	
		} 
		else if(type == 'right')
		{
			Registry.get('l_arrow').active = false;
   			Registry.get('r_arrow').active = true;	
		}
		else
		{
			Registry.get('l_arrow').active = false;
   			Registry.get('r_arrow').active = false;	
		}

		this.drawArrows();
	},

	addBoxes: function()
	{
		this.boxes = [];
		this.boxes.push(
			Registry.add(new Box(150,500,100)),
			Registry.add(new Box(150,150,70)),
			Registry.add(new Box(600,150,70)),
			Registry.add(new Box(690,150,100))
		);
	},

	boxUpdates: function()
	{
		var needRedraw = false;
		for (var i =0; i< this.boxes.length;i++)
		{
			if (Registry.get(this.boxes[i]).update())
			{
				needRedraw = true;
			}
		}

		return needRedraw;
	},

	drawBoxes: function()
	{
		this.layers.boxes.empty();

		for (var i =0; i< this.boxes.length;i++)
		{
			Registry.get(this.boxes[i]).draw();
		}
	},

	moveBox: function(box,dx,dy)
	{
	    var old_x = box.x;
	    var old_y = box.y;

	    box.x += dx;
	    box.y += dy;
	    

	  	var collision = false;
	  	var moveToFit = {x:0,y:0};

	  	//Препятствия
	  	var obstacles = this.boxes.concat(this.platforms)

	  	for (var i =0; i < obstacles.length; i++)
	  	{
	  		var b = Registry.get(obstacles[i]);
	  		if(box === b)
	  		{
	  			continue;
	  		}

			// box.x box.y box.halfSize
	  		if (this.checkCollision(box,b,dx,dy))
	  		{
	  			collision = true;

	  			// If box was falling check maybe box fall to another box
	  			// and needs to be updated with correct state
				if (dy > 0)
	  			{
	  				moveToFit.y = (b.y - b.height/2) - (old_y + box.height/2);
	  				box.isFalling = false;

	  				//Check maybe box should fall from corner

	  				if (this.checkForSpin(box,b))
	  				{
	  					box.startSpin(b);
	  					console.log('spin',moveToFit)
	  				}

	  			}

	  		}
	  	}

	  	//floor
	  	if (box.y + box.height/2 > 600)
  		{
  			collision = true;
  			moveToFit.y = 600 - (old_y + box.height/2);
  			box.isFalling = false;
  		}


	  	if (collision)
	  	{
	  		box.x = old_x;
			box.y = old_y;

			//If we can we move it as much closer to collistion as we can
	  		if( moveToFit.x || moveToFit.y )
	  		{
	  			this.moveBox(box,moveToFit.x, moveToFit.y);
	  		}
	  	}

	},

	checkCollision: function(box1,box2) 
	{	
		if (box1.x - box1.width/2 < box2.x + box2.width/2 &&
	        box1.x + box1.width/2 > box2.x - box2.width/2 &&
	        box1.y - box1.height/2 < box2.y + box2.height/2 &&
	        box1.y + box1.height/2 > box2.y - box2.height/2)
        {
        	return true;
        }

	  	return false;
	},

	checkForSpin: function(box,b)
	{
		if(
			box.x < b.x - b.width/2 ||
			box.x > b.x + b.width/2 
		) 
		{
			return true;
		}

		return false;
	},

	addListeners: function()
	{	
		
		this.wrapper.addEventListener('mousedown',function(e) {
			this.updateActivePoint(e);
			
		}.bind(this));

		//Touch events
		this.wrapper.addEventListener('touchstart',function(e) {
			this.updateActivePoint(e.touches[0]);
		}.bind(this));


		window.addEventListener('resize', function(){
			this.onResize();
		}.bind(this), false);

		window.addEventListener('orientationchange', function(){
			this.onResize();
		}.bind(this), false);

		//Fullscren button click
		this.wrapper.addEventListener('click',function(e){
			
		}.bind(this));

	},

	updateActivePoint: function(e)
	{
		//Calculate ratio to allow resize canvas and keep track right mouse position related canvas
		var ratioX = this.wrapper.clientWidth / this.width;
		var ratioY = this.wrapper.clientHeight / this.height;
		this.activePoint.x =  Math.floor( (e.pageX - this.offsetLeft) / ratioX);
		this.activePoint.y =  Math.floor( (e.pageY - this.offsetTop)  / ratioY);
		this.click();
	},

	onResize: function()
	{

		
		this.offsetTop = this.wrapper.offsetTop;
		this.offsetLeft = this.wrapper.offsetLeft;

	},

};