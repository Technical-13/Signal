// Source and more info:
// https://discordjs.guide/slash-commands
const { SlashCommandBuilder } = require( '@discordjs/builders' );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const clientId = '445799905177632768'; // <---- Enter your client ID here

const commands = [
	new SlashCommandBuilder()
    .setName( 'badgebar' )
    .setDescription( 'Show P-GC badgebar.' )
    .addStringOption( option =>
      option.setName( 'user' )
      .setDescription( 'The case-sensitive Geocaching.com username' ) ),
	new SlashCommandBuilder()
    .setName( 'lmgt' )
    .setDescription( 'Let Me Google That for you...' )
    .addStringOption( option =>
      option.setName( 'query' )
      .setDescription( 'What you want to search for.' )
      .setRequired( true ) )
    .addUserOption( option =>
      option.setName( 'target' )
      .setDescription( 'Tag someone in response' ) ),
	new SlashCommandBuilder()
    .setName( 'ping' )
    .setDescription( 'Replies with the bot\'s ping!' ),
	new SlashCommandBuilder()
    .setName( 'roll' )
    .setDescription( 'Dice Roller' )
    .addIntegerOption( option =>
      option.setName( 'dice' )
      .setDescription( 'How many dice? (default: 1)' ) )
    .addIntegerOption( option =>
      option.setName( 'sides' )
      .setDescription( 'How many sides per die? (default: 6)' ) )
    .addIntegerOption( option =>
      option.setName( 'sets' )
      .setDescription( 'How many sets of dice? (default: 1)' ) )
    .addIntegerOption( option =>
      option.setName( 'modifier' )
      .setDescription( '± to final roll for each die? (default: 0)' ) ),
	new SlashCommandBuilder()
    .setName( 'statbar' )
    .setDescription( 'Show P-GC statbar.' )
    .addStringOption( option =>
      option.setName( 'user' )
      .setDescription( 'The case-sensitive Geocaching.com username' ) )
].map( command => command.toJSON() );

const rest = new REST( { version: '9' } ).setToken( process.env.token );

rest.put( Routes.applicationCommands( clientId ), { body: commands } )
	.then( () => console.log( 'Successfully registered application commands.' ) )
	.catch( errPutRest => console.error( errPutRest.stack ) );

/*
Discord uses slash commands now, meaning all commands must be preconfigured and sent to Discord. The way this works is by adding this file which allows you to set up your files then send them. Read the link above, and enter command data before running this command in shell to get the commands to be published:

node deployCommands.js

*/