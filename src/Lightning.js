

function Lightning(cxt,a,b) {
	
	this.cxt = cxt

	var cxt  = this.cxt;
	var self = this;

	this.pa = {x:a.x,y:a.y,d:-300,r:5};
	this.pb = {x:b.x,y:b.y,d:300,r:5};


	this.colors = ['#fff','cyan'];

}

Lightning.prototype.animate = function()
{	

}

Lightning.prototype.boom = function()
{
	
	this.minBeam  = rand(5,10);
	
	this.strike(this.pa,this.pb,this.colors[0]);
	this.strike(this.pa,this.pb,this.colors[1], this.randomOpacity());
}


Lightning.prototype.randomOpacity = function()
{
	var op = Math.random();
	if (op < 0.3) 
	{
		op = 0.3;
	}
	return op;
}
Lightning.prototype.clear = function()
{
	this.cxt.clearRect(0,0,800,600);
}

Lightning.prototype.strike = function(pa,pb,stikeColor)
{	
	var opacity = this.randomOpacity();
	var line = rand(1,2);

	this.dots = [pa, pb];

	var distance = dist(pa,pb);
	var minBeam = this.minBeam;
	this.distance = distance;

	var maxDepth = 2;
	for(var i = maxDepth; i < 10; i++)
	{
		var d = distance/Math.pow(2,i);
		if(d >= minBeam)
		{
			maxDepth = i;
		} else {
			break;
		}
	}

	this.breakLine(pa,pb,maxDepth,0,0,100);

	this.dots.sort(function(a,b){
		if(a.d == b.d)
		{
			return 0;
		}
		return a.d > b.d ? 1: -1;
	})
	
	var color = stikeColor || '#abf5fc'
	var opacity = opacity || 1;

	var prevDot = this.dots[0];
	var dot = null;
	for(var i = 1; i < this.dots.length; i++) {
		dot = this.dots[i];
		this.connectDots(prevDot,dot,color,opacity,line);
		prevDot = dot;
		//new Circle(this.cxt, dot.x,dot.y, dot.r,'#f5f5f5','#f5f5f5').draw()
	}

}


Lightning.prototype.breakLine = function(pa,pb,maxDepth,depth,anchor,offset)
{
	if (depth >= maxDepth)
	{
		return;
	}

	var pm = this.divide(pa,pb,maxDepth,depth);
	pm.d = anchor;
	pm.r = maxDepth-depth;

	this.dots.push(pm);

	this.breakLine(pa,pm,maxDepth,depth+1,anchor-offset,offset/2);
	this.breakLine(pm,pb,maxDepth,depth+1,anchor+offset,offset/2);
}

Lightning.prototype.connectDots = function(pa,pb,color,opacity,line)
{	
	var cxt = this.cxt;
	cxt.save();
	cxt.globalAlpha = opacity;
	cxt.lineWidth = line;
	var c = color || '#eee';
	cxt.strokeStyle = c;
	cxt.beginPath();
	cxt.moveTo(pa.x,pa.y);
	cxt.lineTo(pb.x,pb.y);
	cxt.closePath();
	cxt.stroke();
	cxt.restore();
}

Lightning.prototype.divide = function(pa,pb,maxDepth,depth)
{
	
	//Find center of line

	var x = (pb.x + pa.x) / 2;
	var y = (pb.y + pa.y) / 2;

	var center = {x:x,y:y};

	var kat1 = Math.sqrt( (center.x - pa.x)*(center.x - pa.x) + (center.y - pa.y)*(center.y - pa.y) );
	
	var kat2 = this.getBreakHeight(depth,maxDepth);
	

	var hypo = Math.sqrt(kat1*kat1 + kat2*kat2);

	var length = dist(pa,pb);

	var sinA = kat2 / hypo;
	var cosA = kat1 / hypo;

	var angle = Math.asin(sinA);

	//точка делящая отрезок
	var l = hypo/(length-hypo);
	var m = {}
	m.x = (pa.x + pb.x * l) / (1 + l);
	m.y = (pa.y + pb.y * l) / (1 + l);

	// Смещаем точку на угол
	var x0 = m.x;
	var y0 = m.y;
	var x = pa.x;
	var y = pa.y;

	rx = x0 - x;
	ry = y0 - y;
	c = Math.cos(angle);
	s = Math.sin(angle);
	
	x1 = x + rx * c - ry * s;
	y1 = y + rx * s + ry * c;

	return {x:x1,y:y1};
}

Lightning.prototype.getBreakHeight = function(depth,maxDepth)
{
	var h = this.distance/15 * ( (Math.random() > 0.5 ) ? 1 : -1 ) * (1-depth/maxDepth);
	return h;
}

function dist(p1,p2)
{
	return Math.sqrt( (p2.x - p1.x)*(p2.x - p1.x) + (p2.y - p1.y)*(p2.y - p1.y) );
}