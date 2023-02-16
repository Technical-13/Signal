// The ready event is what will run when the repl starts and the bot successfully connects. 
// At the moment, it is configured to just announce success.

const Discord = require( "discord.js" );

module.exports = {
	name: 'ready', // Event name
	once: true, // The bot only should ready once.
	run( client ) { // Function to run on event fire
		console.log( "Successfully logged in as " + client.user.tag );
	}
}