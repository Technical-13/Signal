const Discord = require( 'discord.js' );
const fs = require( 'fs' );
const keepAlive = require( './functions/server' );
const objTimeString = require( './time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

// Specify intents needed by the bot, in this case, just get guild events
// https://discord.com/developers/docs/topics/gateway#list-of-intents
const client = new Discord.Client( {
  intents: [
    Discord.Intents.FLAGS.GUILDS,
//    Discord.Intents.FLAGS.GUILD_MEMBERS // Don't need this just yet.
  ]
} );

// Create an object-like data structure to store all our commands
client.commands = new Discord.Collection();
// Also create one for user cooldowns
client.cooldowns = new Discord.Collection();

// Get all files ending with .js in the commands folder
const commandFiles = fs.readdirSync( './commands' ).filter( file => file.endsWith( '.js' ) );
// Get all files ending with .js in the events folder
const eventFiles = fs.readdirSync( './events' ).filter( file => file.endsWith( '.js' ) );

for ( const file of commandFiles ) { // For each file in the commands folder that we fetched earlier do:
	const command = require( `./commands/${file}` ); // Import the file to the current instance
	client.commands.set( command.name, command ); // Set it to the commands collection
}

for ( const file of eventFiles ) { // For each file in the events folder do:
	const event = require( `./events/${file}` ); // Import the file
	if ( event.once ) { // event.once means should it be run once, which we will cover more of later.
    // Define the event to run when called, but only once
		client.once( event.name, ( ...args ) => event.run( ...args, client ) );
	} else {
    // Define the event to run every time it is called. Pass all arguments to the event code.
		client.on( event.name, ( ...args ) => event.run( ...args, client ) );
	}
}

// To start setting up commands, next read interactionCreate.js in the events folder

client.login( process.env.token );

keepAlive();