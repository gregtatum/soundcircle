var AudioContext = window.AudioContext || window.webkitAudioContext || null;
var Sound = require('./sound')

module.exports = function startSoundCircles( poem, properties ) {
	
	var ctx = new AudioContext()
	Sound( ctx )
}