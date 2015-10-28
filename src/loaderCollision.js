
var resources = [
	'helpers',
	'Vertaxis/Vertaxis',
	'Vertaxis/Math',
	'Vertaxis/Shape',
	'Layer',
	'Registry',
	'symDraw'
];

for (var i = 0; i < resources.length; i++)
{
	document.write('<script type="text/javascript" src="src/'+resources[i]+'.js"></script>');
}

