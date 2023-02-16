// Source and more info:
// https://discordjs.guide/interactions/slash-commands.html#registering-slash-commands
const { SlashCommandBuilder } = require( '@discordjs/builders' );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const clientId = '445799905177632768' // <---- Enter your client ID here

const commands = [
	new SlashCommandBuilder().setName( 'ping' ).setDescription( 'Replies with the bot\'s ping!' )
].map( command => command.toJSON() );

const rest = new REST( { version: '9' } ).setToken( process.env.TOKEN );

rest.put( Routes.applicationCommands( clientId ), { body: commands } )
	.then( () => console.log( 'Successfully registered application commands.' ) )
	.catch( console.error );

/*
Discord uses slash commands now, meaning all commands must be preconfigured and sent to Discord. The way this works is by adding this file which allows you to set up your files then send them. Read the link above, and enter command data before running this command in shell to get the commands to be published:

node deployCommands.js

*/