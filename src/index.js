var Dat = require('dat-gui')
var SoundCircles = require('./sound/sound')
var AudioContext = window.AudioContext || window.webkitAudioContext || null

var current = {
	app : {
		ctx : new AudioContext()
	},
	sound : {
		convolerDuration : 4,
		convolerDecay    : 7,
		lengthOfBeat     : 0.2,
		notesToPlay      : 16,
		noteUnitLength   : 1,
		waveType : "triangle",
		progression : "Dm7 Gm7 Cm7",
		progressionChords : {
			"Dm7 Gm7 Cm7" : [
				["D", 'min7', 2, 5],
				["G", 'min7', 2, 5],
				["C", 'min7', 2, 5],
			],
			"Cm Bb Ab7 G7" : [
				["C", 'm', 2, 5],
				["Bb", '', 2, 5],
				["Ab", '7', 2, 5],
				["G", '7', 2, 5],
			],
			"D7 G7 C7 F7" : [
				["D", '7', 2, 5],
				["G", '7', 2, 5],
				["C", '7', 2, 5],
				["F", '7', 2, 5],
			],
			"G C G D" : [
				["G", 'maj', 2, 5],
				["C", 'maj', 2, 5],
				["G", 'maj', 2, 5],
				["D", 'maj', 2, 5],
			],
		}
	},
	soundCircle : null
}


function _init() {
	if( current.soundCircle ) {
		current.soundCircle.destroy()
	}
	
	//Grab the chord frequences from dat.gui
	var sound = current.sound
	sound.chordFrequencies = sound.progressionChords[sound.progression]
	
	current.soundCircle = SoundCircles(current.app, sound)
}

window.onload = function() {
	
	var gui = new Dat.GUI()

	gui.add( current.sound, "lengthOfBeat", 0.01, 0.5 ).onFinishChange( _init )
	gui.add( current.sound, "notesToPlay", 1, 32).step(1).onFinishChange( _init )
	gui.add( current.sound, "noteUnitLength", 0, 1).onFinishChange( _init )
	gui.add( current.sound, "waveType", ["sine", "square", "sawtooth", "triangle"]).onFinishChange( _init )
	gui.add( current.sound, "convolerDuration", 1, 10 ).onFinishChange( _init )
	gui.add( current.sound, "convolerDecay", 1, 50).onFinishChange( _init )
	gui.add( current.sound, "progression", [
		"Dm7 Gm7 Cm7",
		"Cm Bb Ab7 G7",
		"D7 G7 C7 F7",
		"G C G D"
	]).onFinishChange( _init )
	
	_init()
}
