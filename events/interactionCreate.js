// This is the event that runs when a user enters a slash command
// All modules must be re-imported since they are in a seperate file.

const Discord = require( "discord.js" );
const logSchema = require( '../models/Log' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: 'interactionCreate', // Event name
	once: false, // multiple commands can be run
	run( interaction, client ) { // Function to run on event fire
    const author = interaction.user;
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );
    var logChan = objGuildOwner;
    
    // Do not proceed if this isn't a command
		if ( !interaction.isCommand() ) return;

    // Get the slash command name that they entered
		const commandName = interaction.commandName;
    // Find it in the commands folder
		const command = client.commands.find( cmd => cmd.name == commandName );

    // Check if this command has a cooldown saved
		if ( !client.cooldowns.has( command.name ) ) {
      // If not, create the cooldown collection
			client.cooldowns.set( command.name, new Discord.Collection() );
		}

    // Get all user cooldowns for this command
		const timestamps = client.cooldowns.get( command.name );
    // Get the cooldown time for this command in MS
		const cooldownAmount = ( command.cooldown || 0 );

    // Is this user in the cooldowns time list?
		if ( timestamps.has( interaction.user.id ) ) {
      // When did/does the user's cooldown expire?
			const expirationTime = timestamps.get( interaction.user.id ) + cooldownAmount;
			if ( Date.now() < expirationTime ) { // Has it expired yet?
        // If not, how long is left?
				const timeLeft = ( expirationTime - Date.now() ) / 1000;
        
        // Log an error message and let the author know. 
        logSchema.findOne( { Guild: interaction.guild.id }, async ( err, data ) => {
          if ( data ) { logChan = interaction.guild.channels.cache.get( data.Logs.Error ); }
          logChan.send( '<@' + author.id + '> has ' + timeLeft + ' seconds cooldown left on `/' + command.name + '`.' );
        } );
        return interaction.reply( { content: 'Whoops, you are on cooldown for `/' + command.name + '` for another ' + timeLeft + ' seconds.', ephemeral: true } );
			}
		} // continue running if no errors

		timestamps.set( interaction.user.id, Date.now() ); // Put the user on cooldown

		if ( command ) return command.run( interaction, client ); // Run the command's function

		// Also check out the ready event, or head to the ping.js file in the commands folder.
	}
}