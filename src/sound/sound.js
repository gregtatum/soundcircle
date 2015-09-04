var Make = require('./make-sound-node')
var Utils = require('./sound-utils')
var Octavian = require('octavian')
var _ = require('lodash')

function _impulseResponse( ctx, duration, decay, reverse ) {

	var bufferLength = ctx.sampleRate * duration
	var buffer = ctx.createBuffer( 2, bufferLength, ctx.sampleRate )
	var bufferL = buffer.getChannelData(0)
	var bufferR = buffer.getChannelData(1)

	decay = decay || 2.0
	
	for(var i = 0; i < bufferLength; i++){
	 	var decayValue = Math.pow(1 - i / bufferLength, decay)
		bufferL[i] = (Math.random() * 2 - 1) * decayValue
		bufferR[i] = (Math.random() * 2 - 1) * decayValue
	}
	return buffer
}

function _createNodes( ctx, config ) {
	
	var oscillator = Make.oscillator( ctx, config.waveType )
	var gain = Make.gain( ctx )
	var convolver = ctx.createConvolver()
	
	convolver.buffer = _impulseResponse( ctx,
		config.convolerDuration,
		config.convolerDecay
	)
	
	Utils.connect([
		oscillator,
		convolver,
		gain,
		ctx.destination
	]);
	
	return {
		ctx        : ctx,
		oscillator : oscillator,
		gain       : gain,
		convolver  : convolver
	}
}

function _getChordFrequencies( chordDefinitions ) {
	
	return _.map( chordDefinitions, function mapChords( chordDefinition ) {
		
		var [note, chordName, octaveStart, octaveEnd] = chordDefinition
		
		return _.flatten(_.times( octaveEnd - octaveStart, function toFrequencies(i) {
			
			var octave = octaveStart + i
			var chord = new Octavian.Chord(note + octave, chordName)
			
			return chord.frequencies
		}))
	})
}

function _playNoteFn( nodes, lengthOfBeat, noteUnitLength ) {
	
	var transitionSpeed = lengthOfBeat * noteUnitLength * 0.05
	
	return function playNote( time, frequency ) {
		
		var speed = 0
		
		nodes.gain.gain.setTargetAtTime(
			1, //gain
			time,
			transitionSpeed
		)
		
		nodes.gain.gain.setTargetAtTime(
			0, // gain
			time + lengthOfBeat * noteUnitLength, // time
			transitionSpeed
		)
	
		nodes.oscillator.frequency.setTargetAtTime(
			frequency,
			time,      
			0 //speed          
		)
	}
}

function _randomlyArpeggiateThroughChords( nodes, chords, config ) {
	
	var playNote = _playNoteFn( nodes, config.lengthOfBeat, config.noteUnitLength )
	
	var interval = 16
	var progressionLength = chords.length * config.notesToPlay * config.lengthOfBeat
	var progressionStarted = nodes.ctx.currentTime - config.lengthOfBeat
	var noteScheduledAt = progressionStarted	//start out in the past so the next note will play immediately
	var prevTime = progressionStarted
	
	nodes.oscillator.frequency.setTargetAtTime(
		chords[0][0],
		0,      
		0 //speed          
	)

	return setInterval(function() {
		
		// This function is horrible

		var currTime = nodes.ctx.currentTime
		var progressionTime = currTime - progressionStarted
		var timeSinceLastNotePlay = noteScheduledAt - currTime
		var unitProgressionPosition = progressionTime / progressionLength
		
		// Schedule next note one beat ahead
		if( timeSinceLastNotePlay < config.lengthOfBeat ) {

			var chordIndex = Math.floor( chords.length * unitProgressionPosition )
			chordIndex = Math.min( chordIndex, chords.length - 1 )
			chordIndex = Math.max( chordIndex, 0 )
			
			var currentChord = chords[ chordIndex ]
			noteScheduledAt += config.lengthOfBeat
			playNote( noteScheduledAt, _.sample(currentChord) )
		}

		if( currTime >= progressionStarted + progressionLength ) {
			progressionStarted += progressionLength
		}

		prevTime = currTime

	}, interval)
	
}


module.exports = function sound( app, props ) {
	
	var config = _.extend({
		convolerDuration : 4,
		convolerDecay    : 7,
		waveType         : "triangle",
		lengthOfBeat     : 0.2,
		notesToPlay      : 16,
		noteUnitLength   : 1,
		chordFrequencies : [
			// [note, chord, octaveStart, octaveEnd]
			["D", 'min7', 2, 5],
			["G", 'min7', 2, 5],
			["C", 'min7', 2, 5],
		]
	}, props)
	
	// config.waveType = _.sample(["sine", "square", "sawtooth", "triangle"])
	
	var nodes = _createNodes( app.ctx, config )
	
	var chords = _getChordFrequencies( config.chordFrequencies )
	
	var arpeggiate = _randomlyArpeggiateThroughChords( nodes, chords, config )
	
	nodes.oscillator.start(0)
	
	return {
		destroy : function() {
			nodes.oscillator.stop(0)
			clearInterval(arpeggiate)
		}
	}
}