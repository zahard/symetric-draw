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
	this.curvePoints = [];
	this.linePoints = [];

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

	this.options = {
		step: 1,
		color: '#666',
		lineWidth: 5,
		bgColor:'#fff',
		guideColor:'#ccc',
		guideShow: true,
		lineCap: 'round'
	};

	this.mode = SymmetricDraw.modeEnum.curve;

	this.addListeners();

	this.buildControls();

	this.applyOptions('all');

	this.drawGuides();

}

SymmetricDraw.modeEnum = {
	free:1,
	line:2,
	curve:3
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

	buildLinecapSwitch: function()
	{
		var self = this;
		var div = document.createElement('div');
		div.className = 'option big';
		this.controlBarLeft.appendChild(div);

		var l = document.createElement('label');
		l.className = 'full';
		l.innerHTML = 'Line cap';
		div.appendChild(l);

		var free = document.createElement('div');
		free.className = 'buttongroup first'
		if(self.options.lineCap == 'round') free.className+= ' active';
		free.innerHTML = 'R';
		div.appendChild(free);
		free.onclick = function(){
			self.setOption('lineCap', 'round')
			self.addClass(free, 'active');
			self.removeClass(line, 'active');
			self.removeClass(curve, 'active');
		}

		var line = document.createElement('div');
		line.className = 'buttongroup'
		if(self.options.lineCap == 'square') free.className+= ' active';
		line.innerHTML = 'S';
		div.appendChild(line);
		line.onclick = function(){
			self.setOption('lineCap', 'square')
			self.addClass(line, 'active');
			self.removeClass(free, 'active');
			self.removeClass(curve, 'active');
		}

		var curve = document.createElement('div');
		curve.className = 'buttongroup last'
		if(self.options.lineCap == 'butt') free.className+= ' active';
		curve.innerHTML = 'B';
		div.appendChild(curve);
		curve.onclick = function(){
			self.setOption('lineCap', 'butt')
			self.addClass(curve, 'active');
			self.removeClass(line, 'active');
			self.removeClass(free, 'active');

		}
	},

	buildModeSwitch: function()
	{
		var self = this;
		var div = document.createElement('div');
		div.className = 'option big';
		this.controlBarLeft.appendChild(div);

		var l = document.createElement('label');
		l.className = 'full';
		l.innerHTML = 'Draw mode';
		div.appendChild(l);

		var free = document.createElement('div');
		free.className = 'buttongroup first'
		if(self.mode == SymmetricDraw.modeEnum.free) free.className+= ' active';
		free.innerHTML = 'Free';
		div.appendChild(free);
		free.onclick = function(){
			self.setMode(SymmetricDraw.modeEnum.free)
			self.addClass(free, 'active');
			self.removeClass(line, 'active');
			self.removeClass(curve, 'active');
		}



		var line = document.createElement('div');
		line.className = 'buttongroup'
		if(self.mode == SymmetricDraw.modeEnum.line) line.className+= ' active';
		line.innerHTML = 'Line';
		div.appendChild(line);
		line.onclick = function(){
			self.setMode(SymmetricDraw.modeEnum.line)
			self.addClass(line, 'active');
			self.removeClass(free, 'active');
			self.removeClass(curve, 'active');
		}

		var curve = document.createElement('div');
		curve.className = 'buttongroup last'
		if(self.mode == SymmetricDraw.modeEnum.curve) curve.className+= ' active';
		curve.innerHTML = 'Curve';
		div.appendChild(curve);
		curve.onclick = function(){
			self.setMode(SymmetricDraw.modeEnum.curve)
			self.addClass(curve, 'active');
			self.removeClass(line, 'active');
			self.removeClass(free, 'active');

		}
	},

	removeClass: function(e, className)
	{
	    e.className = e.className.replace(className,"");
	    e.className = e.className.replace(/\s\s+/g, ' ');
	},
	addClass: function(e, className)
	{
	    this.removeClass(e,className);
	    e.className = e.className + ' ' + className; 
	},

	buildClear: function ()
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
		}
	},

	buildSave: function ()
	{
		var self = this;

		var div = document.createElement('div');
		div.className = 'option';
		this.controlBarLeft.appendChild(div);

		var b = document.createElement('div');
		b.style.background = 'orange';
		b.className = 'button'
		b.innerHTML = 'Save image';
		div.appendChild(b);
		b.onclick = function(){
			var c = document.createElement('canvas');
			c.width = this.width;
			c.height = this.height;
			var ctx = c.getContext('2d');
			ctx.fillStyle = this.options['bcColor'];
			ctx.fillRect(0,0,this.width, this.height)
			ctx.drawImage(this.layout);

			var dataURL = c.toDataURL();

			var a = document.createElement('a');
			a.download = 'my-drawing.png';
			a.src = dataURL;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			//self.layout.empty();
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
			c.isSelected = true;
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

	buildEnumSwitch: function(title, property, range, suffix)
	{
		var self = this;

		var div = document.createElement('div');
		div.className = 'option';
		this.controlBarLeft.appendChild(div);

		var l = document.createElement('label');
		l.innerHTML = title;
		div.appendChild(l);

		var wrap = document.createElement('div');
		wrap.className = 'combobox';
		var currentValue = document.createElement('div');
		currentValue.className = 'currentValue';
		currentValue.innerHTML =  this.options[property] + suffix;

		var hidden = true;
		currentValue.onclick = function(){
			if(hidden)
			{
				selectValue.style.display = 'block';
				hidden = false;
			}else{
				selectValue.style.display = 'none';
				hidden = true;
			}
		}

		var selectValue = document.createElement('div');
		selectValue.className = 'selectValue';
		selectValue.style.display = 'none';

		var values = document.createElement('div');
		values.className = 'values';

		var html = '';
		var opt;
		var self = this;
		for(var i=0;i<range.length;i++)
		{
			opt = document.createElement('div');
			opt.className = 'comboValue';
			opt.innerHTML = range[i];
			opt.comboValue = range[i];
			values.appendChild(opt);
			opt.onclick = function(){
				self.setOption(property, this.comboValue);
				selectValue.style.display = 'none';
				hidden = true;
				currentValue.innerHTML = this.comboValue + suffix;
				input.value = '';
			}
		}
		

		var custom = document.createElement('div');
		custom.className = 'custom';
		var lbl = document.createElement('label');
		lbl.innerHTML = 'Custom value';
		var input = document.createElement('input')
		input.type ='text';
		custom.appendChild(lbl)
		custom.appendChild(input)

		var apply = document.createElement('input')
		apply.type ='button';
		apply.value = 'Apply'
		custom.appendChild(apply)
		apply.onclick = function()
		{	
			var val = parseInt(input.value,10);
			if(isNaN(val)) return;

			self.setOption(property, val);
			selectValue.style.display = 'none';
			hidden = true;
			currentValue.innerHTML = val + suffix;
		}


		selectValue.appendChild(values);
		selectValue.appendChild(custom);


		wrap.appendChild(currentValue);
		wrap.appendChild(selectValue);

		div.appendChild(wrap);
	},
	buildControls: function()
	{
		//Split to Segments
		var steps = [1,2,3,4,5,6,8,9,12,16,24,36,15,50];
		this.buildEnumSwitch('Segments', 'step', steps, '');

		//Line width
		var lineRange = [1,2,3,4,5, 8, 10, 12, 15, 18, 20, 30, 40, 50, 100];
		this.buildEnumSwitch('Line width', 'lineWidth', lineRange, 'px');

		this.buildModeSwitch();
		this.buildLinecapSwitch();
		this.buildColorPicker('Color', 'color');
		this.buildColorPicker('Background', 'bgColor');
		this.buildColorPicker('Guides Color', 'guideColor');
		this.buildCheckbox('Show Guides', 'guideShow');

		this.buildClear();

		this.buildSave();

	},
	setOption: function(prop, value)
	{
		this.options[prop] = value;
		this.applyOptions(prop);
	},

	applyOptions: function(changed)
	{
		this.layout.setProperties({
			lineWidth: this.options.lineWidth,
			strokeStyle: this.options.color,
			lineCap: this.options.lineCap
		});

		this.layers.temp.setProperties({
			lineWidth: this.options.lineWidth,
			strokeStyle: this.options.color,
			lineCap: this.options.lineCap
		});

		for(var i=0;i<5;i++){

			this.actions[i].setProperties({
				lineWidth: this.options.lineWidth,
				strokeStyle: this.options.color,
				lineCap: this.options.lineCap
			});
		}


		this.step = 360/this.options.step;

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
		return;
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
		return;
		this.actionLayer++;
		if (this.actionLayer > 4)
		{
			this.actionLayer = 0;
		}

		console.log('SAVE',this.actionLayer)
	},

	undo: function(){
		return;
		var prevLayer = this.actionLayer - 1;
		if(prevLayer < 0) prevLayer = 4;
		this.actions[prevLayer].hide();
		this.actionLayer = prevLayer;

		this.layerToClear.push(prevLayer);
	},

	redo: function(){
		return;
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
		return this.layout;
		//return this.actions[this.actionLayer];
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

	clearCurrentAction: function()
	{
		switch(this.mode)
		{
			case SymmetricDraw.modeEnum.curve:
				this.layers.temp.empty();
				this.curvePoints = [];
				break;

			case SymmetricDraw.modeEnum.line:
				this.layers.temp.empty();
				this.linePoints = [];
				break;	
		}
		
	},

	setMode: function(mode)
	{
		this.clearCurrentAction();
		this.mode = mode;
	},
	drawCurve: function(ctx,p1,p2,p3)
	{
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.quadraticCurveTo(p3.x, p3.y, p2.x, p2.y);
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
			ctx.quadraticCurveTo(p3.x, p3.y, p2.x, p2.y);
			ctx.stroke();

			ctx.restore();
		}
	},

	drawDrop: function(ctx,p1,p2,p3)
	{
		var r =20;

		ctx.beginPath();

		var d1 = { x:p1.x - r, y:p1.y,}
		var d2 = { x:p1.x + r, y:p1.y,}

		ctx.moveTo(d2.x, d2.y);
		ctx.quadraticCurveTo(p3.x, p3.y, p2.x, p2.y);
		ctx.quadraticCurveTo(p3.x, p3.y, d1.x, d1.y);

		var dx = Math.ceil((p1.x - p3.x)/5);
		var dy = Math.ceil((p1.y - p3.y)/5);
		ctx.bezierCurveTo(d1.x+ dx, d1.y+dy, d2.x+dx, d2.y+dy, d2.x, d2.y);

		ctx.closePath();
		ctx.stroke();

		//new Circle(ctx, opposite.x-30, opposite.y+10, 5, 'orange', null, 1).draw();
		
		var step = this.step;
		for(var rad=step;rad < 360; rad += step)
		{
			ctx.save();
			ctx.translate(this.center.x, this.center.y);
			ctx.rotate(this.inRad(rad));
			ctx.translate(-this.center.x, -this.center.y);
			
			ctx.beginPath();
		
			var d1 = { x:p1.x - r, y:p1.y,}
			var d2 = { x:p1.x + r, y:p1.y,}

			ctx.moveTo(d2.x, d2.y);
			ctx.quadraticCurveTo(p3.x, p3.y, p2.x, p2.y);
			ctx.quadraticCurveTo(p3.x, p3.y, d1.x, d1.y);

			var dx = Math.ceil((p1.x - p3.x)/5);
			var dy = Math.ceil((p1.y - p3.y)/5);
			ctx.bezierCurveTo(d1.x+ dx, d1.y+dy, d2.x+dx, d2.y+dy, d2.x, d2.y);

			ctx.closePath();
			ctx.stroke();

			ctx.restore();
		}

	},

	addListeners: function()
	{	
		var kb = new KeyboardManager(this);

		kb.up('escape', function(){
			this.clearCurrentAction();
		}.bind(this))

		this.wrapper.addEventListener('dblclick',function(e) {
			this.clearCurrentAction();
		}.bind(this));

		this.wrapper.addEventListener('mouseleave',function(e) {
			
			this.updateActivePoint(e);
			this.paint();

			this.MOUSE_HOLDED = false;
			this.prevPoint = null;

		}.bind(this));

		this.wrapper.addEventListener('mousedown',function(e) {
			this.MOUSE_HOLDED = true;
			this.recordAction();

			if (this.mode == SymmetricDraw.modeEnum.free)
			{
				this.paint();
			}
			
		}.bind(this));

		this.wrapper.addEventListener('mouseup',function(e) {
			this.MOUSE_HOLDED = false;
			this.saveAction();

			this.prevPoint = null;
			//this.layout.beginPath();

		}.bind(this));

		this.wrapper.addEventListener('mousemove',function(e) {
			
			this.updateActivePoint(e);

			if (this.mode == SymmetricDraw.modeEnum.free)
			{
				if (this.MOUSE_HOLDED)
				{
					this.paint();
				}
			}

			if (this.mode == SymmetricDraw.modeEnum.curve && this.curvePoints.length > 0)
			{
				this.drawCurveParts();
			}

			if (this.mode == SymmetricDraw.modeEnum.line && this.linePoints.length > 0)
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
		if (this.mode == SymmetricDraw.modeEnum.curve)
		{
			this.curvePoint();
		}

		if (this.mode == SymmetricDraw.modeEnum.line)
		{
			this.linePoint();
		}

		
		return;

		if (this.lineMode)
		{
			this.endStraightLine();
		}

		if(e.shiftKey)
		{
			this.startStraightLine();
		}

	},

	curvePoint: function()
	{
		var points = this.curvePoints.length;
		if (points == 0)
		{
			this.layers.temp.empty();
			this.drawPoint(this.activePoint);
			this.curvePoints.push({
				x:this.activePoint.x,
				y:this.activePoint.y,
			});

		} 
		else if (points == 1)
		{
			this.curvePoints.push({
				x:this.activePoint.x,
				y:this.activePoint.y,
			});
				
		} else if(points == 2)
		{
			this.layers.temp.empty();
			this.curvePoints.push({
				x:this.activePoint.x,
				y:this.activePoint.y,
			});

			this.drawCurve(this.layout, this.curvePoints[0], this.curvePoints[1],this.curvePoints[2]);

			this.curvePoints= [];
		}
	},

	drawCurveParts: function()
	{
		this.layers.temp.empty();
		if (this.curvePoints.length == 1)
		{
			this.drawLine(this.layers.temp, this.curvePoints[0], this.activePoint);

			this.drawPoint(this.curvePoints[0]);
			this.drawPoint(this.activePoint);
		} 
		else if (this.curvePoints.length == 2)
		{

			this.drawCurve(this.layers.temp, this.curvePoints[0], this.curvePoints[1], this.activePoint );

			this.drawPoint(this.curvePoints[0]);
			this.drawPoint(this.curvePoints[1]);
			this.drawPoint(this.activePoint);	
		}

	},

	linePoint: function()
	{
		var points = this.linePoints.length;
		if (points == 0)
		{
			this.layers.temp.empty();
			this.drawPoint(this.activePoint);
			this.linePoints.push({
				x:this.activePoint.x,
				y:this.activePoint.y,
			});

		} 
		else if (points == 1)
		{
			this.layers.temp.empty();
			this.linePoints.push({
				x:this.activePoint.x,
				y:this.activePoint.y,
			});

			this.drawLine(this.layout, this.linePoints[0], this.linePoints[1]);

			this.linePoints = [this.linePoints[1]];
		}
	},

	drawPoint: function(p)
	{
		new Circle(this.layers.temp.cxt, p.x, p.y, 8, 'red', null, 1).draw();
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
		this.drawLine(this.layers.temp, this.linePoints[0], this.activePoint);
		this.drawPoint(this.linePoints[0]);
		this.drawPoint(this.activePoint);
	},

	updateActivePoint: function(e)
	{
		//Calculate ratio to allow resize canvas and keep track right mouse position related canvas
		var ratioX = this.wrapper.clientWidth / this.width;
		var ratioY = this.wrapper.clientHeight / this.height;
		this.activePoint.x =  Math.floor( (e.pageX - this.offsetLeft) / ratioX);
		this.activePoint.y =  Math.floor( (e.pageY - this.offsetTop)  / ratioY);
	},

	fillWithColor: function(p)
	{	
		var cxt = this.layout.cxt;

		var pixelData = cxt.getImageData(p.x, p.y, 1, 1);
		var pixel = {
			r: pixelData.data[0],
			g: pixelData.data[1],
			b: pixelData.data[2],
			a: pixelData.data[3]
		};

		// Get the CanvasPixelArray from the given coordinates and dimensions.
		var imgd = cxt.getImageData(0, 0, this.width, this.height);
		var pix = imgd.data;	


		processPixel(p);


		function processPixel(currentPx)
		{	

			var y;
			var x;
			for(var dx=-1;dx<=1;dx++)
			{
				for(var dy=-1;dy<=1;dy++)
				{
					if (dy==0 && dx==0) continue;

					var x  = currentPx.x + dx;
					var y  = currentPx.y + dy;
					var np = getPixelXY(imgd, x, y);
					if(np[4] == true) continue;
					if( np[0] == pixel.r &&
						np[1] == pixel.g &&
						np[2] == pixel.b &&
						np[3] == pixel.a
					) {
						setPixelXY(imgd, x, y, 27, 153,204,255);
					}
				}
			}

			var dy = 0;
			for(var dx=-20;dx<=20;dx++)
			{
				if (dx==1 || dx==-1 || dx==0) continue;

				var x  = currentPx.x + dx;
				var y  = currentPx.y + dy;
				var np = getPixelXY(imgd, x, y);
				if(np[4] == true) continue;
				if( np[0] == pixel.r &&
					np[1] == pixel.g &&
					np[2] == pixel.b &&
					np[3] == pixel.a
				) {
					setPixelXY(imgd, x, y, 27, 153,204,255);
				}
			}

		}

		



		function getPixel(imgData, index) {

		  var i = index*4; var d= imgData.data;
		  return [d[i],d[i+1],d[i+2],d[i+3]] // returns array [R,G,B,A]
		}

		// AND/OR

		function getPixelXY(imgData, x, y) {
		  return getPixel(imgData, y*imgData.width+x);
		}

		function setPixelXY(imgData,x,y,r,g,b,a)
		{
			var d= imgData.data;
			var index = y*imgData.width+x;
			var i = index*4;
			d[i] = r;
			d[i+1] = g;
			d[i+2] = b;
			d[i+3] = a;
		}

		cxt.putImageData(imgd, 0,0);

		return;

		//27,
		//153,
		//204
		//
		
		
		

		// Loop over each pixel and invert the color.
		for (var i = 0, n = pix.length; i < n; i += 4) {
		    pix[i  ] = 27;
		    pix[i+1] = 104;
		    pix[i+2] = 204;
		    pix[i+3] = 255;
		    
		}

		cxt.putImageData(imgd, 0,0);
		
	
	},

	onResize: function()
	{

		
		this.offsetTop = this.editor.offsetTop;
		this.offsetLeft = this.editor.offsetLeft;

	}
}
