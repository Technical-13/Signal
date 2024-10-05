const keepAlive = require( './functions/server' );
const fs = require( 'fs' );
const { Client, GatewayIntentBits, Partials, Collection } = require( 'discord.js' );
const config = require( './config.json' );
require( 'dotenv' ).config();

const client = new Client( {
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	], 
	partials: [ Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction ]
} );

/* ------------------ COLLECTIONS ------------------ */
client.commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.slashCommands = new Collection();
client.prefix = config.prefix;

module.exports = client;

fs.readdirSync( './handlers' ).forEach( ( handler ) => {
	require( `./handlers/${handler}` )( client );
} );

client.login( process.env.token )
  .then( loggedIn => { console.log( 'Successfully connected!' ); } )
  .catch( errLogin => { console.error( 'There was an error logging in:\n%o', errLogin ); } );

keepAlive();
