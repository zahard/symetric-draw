window.onload = function()
{
	window.game = new SymmetricDraw(640,640);

}


function SymmetricDraw(width, height)
{
	Registry.add('app',this);


	this.onShiftUp = this.onShiftUp.bind(this);

	this.width = width;
	this.height = height;

	this.wrapper = $('wrapper');
	this.editor = $('user-layout');
	this.controlBarLeft = $('controls-left');
	this.controlBarRight = $('controls-right');
	
	this.wrapper.style.width = width + 'px';
	this.wrapper.style.height = height + 'px';
	
	this.offsetTop = this.editor.offsetTop;
	this.offsetLeft = this.editor.offsetLeft;

	this.layerToClear = [];

	this.layers = {
		background:    new Layer( $('background'), width, height, 1),
		layout:    new Layer( $('layout'), width, height, 2),
		temp: new Layer( $('temp'), width, height, 10),
		hints: new Layer( $('hints'), width, height, 11)
	};

	this.actions = []
	var actionCanvas;
	for(var i=0;i<5;i++)
	{	
		actionCanvas = document.createElement('canvas');
		this.wrapper.appendChild(actionCanvas);
		this.actions.push(new Layer( actionCanvas, width, height, 3));
	}

	this.actionLayer = 0;

	this.layout = this.layers.layout;

	this.center = {
		x: Math.ceil(width/2),
		 y:Math.ceil(height/2)
	}

	this.layout.set('lineCap', 'round');
	this.options = {
		step:30,
		color: '#fff',
		lineWidth: 3,
		bgColor:'#777',
		guideColor:'#fff',
		guideShow: true
	};

	

	this.addListeners();

	this.buildControls();

	this.applyOptions('all');

	this.drawGuides();

}

SymmetricDraw.prototype = {
	activePoint: {
		x:0, y:0
	},

	MOUSE_HOLDED: false,

	buildColorPicker: function(title, optionName)
	{
		var self = this;

		var div = document.createElement('div');
		div.className = 'option';
		this.controlBarLeft.appendChild(div);

		var l = document.createElement('label');
		l.innerHTML = title;
		div.appendChild(l);

		var c = document.createElement('input');
		c.type = 'text';
		c.className = 'color';
		var onchangeCb = function(){
			self.setOption(optionName, '#'+c.value);
		}
		c.onchange  = onchangeCb;
		new jscolor.color(c, {onImmediateChange: onchangeCb }).fromString(this.options[optionName]);
		div.appendChild(c);
	},

	buildClear: function (argument)
	{
		var self = this;

		var div = document.createElement('div');
		div.className = 'option';
		this.controlBarLeft.appendChild(div);

		var b = document.createElement('div');
		b.className = 'button'
		b.innerHTML = 'Clear canvas';
		div.appendChild(b);
		b.onclick = function(){
			self.layout.empty();
			//if(confirm('Clear canvas?'))
			//{
			//	self.layout.empty();
			//}
		}
	},

	buildCheckbox: function(title, optionName)
	{
		var self = this;

		var div = document.createElement('div');
		div.className = 'option';
		this.controlBarLeft.appendChild(div);

		var l = document.createElement('label');
		l.innerHTML = title;
		div.appendChild(l);


		var c = document.createElement('div');
		c.className = 'checkbox';
		if (this.options.guideShow)
		{
			c.className += ' selected';
		}

		c.innerHTML = '<div class="bool-yes">Yes</div><div class="bool-no">No</div>';

		c.onclick = function(){
			if(!c.isSelected)
			{
				c.isSelected = true;
				c.className = 'checkbox selected'
			}else{
				c.isSelected = false;
				c.className = 'checkbox'
			}
			self.setOption('guideShow',c.isSelected);
		}
		
		div.appendChild(c);
	},

	buildControls: function()
	{

		var self = this;

		var l = document.createElement('label');
		l.innerHTML = 'Radial lines';
		this.controlBarLeft.appendChild(l);

		var steps = [1,2,3,4,8,12,16,24,36, 15, 50]
		var b;
		for(var step = 0;step < steps.length;step++)
		{
			b = document.createElement('input');
			b.type= 'button';
			b.value = steps[step];
			(function(s) {
				b.onclick = function(){
					self.setOption('step', 360/steps[s])
				}
			}(step));

			this.controlBarLeft.appendChild(b);
		}

		var l = document.createElement('label');
		l.innerHTML = 'Line Width';
		this.controlBarLeft.appendChild(l);

		b = document.createElement('select');
		for(var i=1;i<30;i++){
			var o = document.createElement('option');
			o.innerHTML =i;
			o.value = i;
			b.appendChild(o)
		}
		b.onchange = function(){
			self.setOption('lineWidth', this.value)
		}

		this.controlBarLeft.appendChild(b);
		b.value = this.options.lineWidth;


		this.buildColorPicker('Color', 'color');
		this.buildColorPicker('Background', 'bgColor');
		this.buildColorPicker('Guides Color', 'guideColor');
		this.buildCheckbox('Show Guides', 'guideShow');

		this.buildClear();

	},
	setOption: function(prop, value)
	{
		this.options[prop] = value;
		this.applyOptions(prop);
	},

	applyOptions: function(changed)
	{
		this.layout.set('lineWidth', this.options.lineWidth);
		this.layout.set('strokeStyle', this.options.color);

		
		this.layers.temp.set('lineWidth', this.options.lineWidth);
		this.layers.temp.set('strokeStyle', this.options.color);

		for(var i=0;i<5;i++){
			this.actions[i].set('lineWidth', this.options.lineWidth);
			this.actions[i].set('strokeStyle', this.options.color);
		}


		this.step = this.options.step;

		if (changed == 'bgColor' || changed == 'all')
			this.drawBackground();

		if (changed == 'guideColor' || changed == 'step' || changed == 'all')
			this.drawGuides();

		if (this.options.guideShow)
		{
			this.layers.hints.show();
		}else{
			this.layers.hints.hide();
		}

	},

	drawGuides: function()
	{
		var ctx = this.layers.hints;
		ctx.clearRect(0,0,this.width,this.height);
		ctx.set('strokeStyle', this.options.guideColor);
		ctx.set('globalAlpha', "0.75");
		this.drawLine(
			ctx,
			{x:this.center.x, y:this.center.y-25},
			{x:this.center.x, y: -this.center.y/2}
		);

		ctx.beginPath();
		ctx.moveTo(this.center.x-5, this.center.y);
		ctx.lineTo(this.center.x+5, this.center.y);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(this.center.x, this.center.y-5);
		ctx.lineTo(this.center.x, this.center.y+5);
		ctx.stroke();
	},

	click: function(){

	},
	drawBackground: function(){ 

		this.layers.background.set('fillStyle', this.options.bgColor);
		this.layers.background.fillRect(0,0,this.width,this.height)
	},

	inRad: function(num) {
		return num * Math.PI / 180;
	},

	recordAction:function()
	{
		if (this.layerToClear && this.layerToClear.length)
		{
			for(var i=0;i<this.layerToClear.length;i++)
			{
				this.actions[this.layerToClear[i]].empty();
				this.actions[this.layerToClear[i]].show();
			}

			this.layerToClear = [];
		}

		
		//Take most old used layer copy to layout and clear
		var old = this.actionLayer + 1;
		if(old > 4) old = 0;

		this.layout.drawImage(this.actions[old].cnv,0,0);
		this.actions[old].empty();


	},

	saveAction:function()
	{
		this.actionLayer++;
		if (this.actionLayer > 4)
		{
			this.actionLayer = 0;
		}

		console.log('SAVE',this.actionLayer)
	},

	undo: function(){
		
		var prevLayer = this.actionLayer - 1;
		if(prevLayer < 0) prevLayer = 4;
		this.actions[prevLayer].hide();
		this.actionLayer = prevLayer;

		this.layerToClear.push(prevLayer);
	},

	redo: function(){
		
		this.actions[this.actionLayer].show();
		var newArr = [] 
		for(var i=0;i<this.layerToClear.length;i++)
		{
			if(this.layerToClear[i] !== this.actionLayer)
			{
				newArr.push(this.layerToClear[i]);
			}
		}
		this.layerToClear = newArr;

		this.actionLayer++;
		if (this.actionLayer > 4)
		{
			this.actionLayer = 0;
		}

		
	},

	getLayout: function()
	{
		//return this.layout;
		return this.actions[this.actionLayer];
	},

	paint: function()
	{
		var p = this.activePoint;
		var o  = this.prevPoint;

		if (!this.prevPoint)
		{
			this.prevPoint = { x: p.x, y: p.y }
			return;
		}

		var cxt  = this.getLayout();
		this.drawLine(cxt, o, p )
		
		this.prevPoint = {
			x: p.x,
			y: p.y
		}
	},

	drawLine: function(ctx, p1, p2)
	{
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.stroke();

		var step = this.step;
		for(var rad=step;rad < 360; rad += step)
		{
			ctx.save();
			ctx.translate(this.center.x, this.center.y);
			ctx.rotate(this.inRad(rad));
			ctx.translate(-this.center.x, -this.center.y);
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();		
			ctx.restore();
		}
	},

	addListeners: function()
	{	
		
		this.wrapper.addEventListener('mouseleave',function(e) {
			
			this.updateActivePoint(e);
			this.paint();

			this.MOUSE_HOLDED = false;
			this.prevPoint = null;

		}.bind(this));

		this.wrapper.addEventListener('mousedown',function(e) {
			this.MOUSE_HOLDED = true;
			this.recordAction();

			this.paint();
			
		}.bind(this));

		this.wrapper.addEventListener('mouseup',function(e) {
			this.MOUSE_HOLDED = false;
			this.saveAction();

			this.prevPoint = null;
			//this.layout.beginPath();

		}.bind(this));

		this.wrapper.addEventListener('mousemove',function(e) {
			
			this.updateActivePoint(e);

			if (this.MOUSE_HOLDED)
			{
				this.paint();
			}

			if (this.lineMode)
			{
				this.drawPreviewLine();
			}

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
			this.clicked(e);
		}.bind(this));

		document.body.addEventListener('keyup', function(e){
			
			if(e.ctrlKey && e.keyCode == 90)
			{
				this.undo();
			}

			if(e.ctrlKey && e.keyCode == 89)
			{
				this.redo();
			}

		}.bind(this));

	},


	clicked: function(e)
	{	
		if (this.lineMode)
		{
			this.endStraightLine();
		}

		if(e.shiftKey)
		{
			this.startStraightLine();
		}

	},

	startStraightLine: function()
	{	
		this.lineMode = true;
		this.startLinePoint = {
			x:this.activePoint.x,
			y:this.activePoint.y
		}

		document.body.addEventListener('keyup', this.onShiftUp);
	},

	onShiftUp: function(e)
	{
		if(e.keyCode == 16)
		{
			this.clearStraightLine();
			document.body.removeEventListener('keyup', this.onShiftUp);
		}
	},

	clearStraightLine: function()
	{
		console.log('end')
		this.lineMode = false;
		this.startLinePoint = null;
		this.layers.temp.empty();
	},

	endStraightLine: function()
	{
		this.drawLine(this.layout, this.startLinePoint, this.activePoint);

		this.clearStraightLine();
	},

	drawPreviewLine: function()
	{
		this.layers.temp.empty();
		this.drawLine(this.layers.temp, this.startLinePoint, this.activePoint);
	},

	updateActivePoint: function(e)
	{
		//Calculate ratio to allow resize canvas and keep track right mouse position related canvas
		var ratioX = this.wrapper.clientWidth / this.width;
		var ratioY = this.wrapper.clientHeight / this.height;
		this.activePoint.x =  Math.floor( (e.pageX - this.offsetLeft) / ratioX);
		this.activePoint.y =  Math.floor( (e.pageY - this.offsetTop)  / ratioY);
	},

	onResize: function()
	{

		
		this.offsetTop = this.editor.offsetTop;
		this.offsetLeft = this.editor.offsetLeft;

	}
}