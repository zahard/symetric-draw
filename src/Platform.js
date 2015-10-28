
function Platform(material, width, x,y)
{
	this.material = material;
	this.width = width;
	this.height = 30;

	this.x = x + this.width / 2;
	this.y = y +  this.height / 2;
}

Platform.prototype = {
	draw: function()
	{

		var w = this.width;
		var h = this.height;

		var x = this.x - w/2;
		var y = this.y - h/2;

		var img = Registry.get('app').images[this.material];

		var tileW = img.width;
		var tileH = 30;	

		var repeatTileCount = Math.floor(w / tileW);
		var partialSize = w % tileW;

		var cxt = Registry.get('app').layers.statics;

		for(var i = 0; i < repeatTileCount; i++)
		{
			cxt.drawImage(
				img,
				0,0,
				tileW, tileH, //Crop
				x + i * tileW, y, //Position
				tileW, h // Size
			);
		}

		if (partialSize > 0)
		{
			cxt.drawImage(
				img,
				0,0,
				partialSize, tileH, //Crop
				x + repeatTileCount * tileW, y, //Position
				partialSize, h // Size
			);	
		}
	}
}