var _ = require('lodash')

exports.setGain = function ( ctx, node, gain, delay, speed ) {
	
	node.gain.setTargetAtTime(
		gain,
		ctx.currentTime + delay,
		speed
	)
}

exports.setBandpassQ = function ( ctx, node, Q ) {
	
	node.Q.setTargetAtTime(
		Q,
		ctx.currentTime,
		0.1
	)
},

exports.setBandpassFrequency = function ( ctx, node, frequency ) {
	
	node.frequency.setTargetAtTime(
		frequency,
		ctx.currentTime,
		0.1
	)
}

exports.connect = function( nodes ) {
	
	_.each( _.rest( nodes ), function(node, i, list) {
		var prevNode = nodes[i]
		
		prevNode.connect( node )
	})
}

exports.setFrequency = function( ctx, node, frequency, delay, speed ) {
	
	node.frequency.setTargetAtTime(
		frequency,
		ctx.currentTime + delay,
		speed
	)
}