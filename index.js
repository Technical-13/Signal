const keepAlive = require( './functions/server.js' );
const initDatabase = require( './functions/database.js' );
const fs = require( 'fs' );
const { Client, GatewayIntentBits, Partials, Collection } = require( 'discord.js' );
const config = require( './config.json' );
require( 'dotenv' ).config();

initDatabase();

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

/* -------------------- COLLECTIONS -------------------- */
client.aliases = new Collection();
client.commands = new Collection();
client.groups = new Collection();
client.events = new Collection();
client.prefix = config.prefix;
client.slashCommands = new Collection();

/* ------------------ STATIC COMMANDS ------------------ */
var staticCmds = [];
if ( config.staticCmds ) { staticCmds.concat( config.staticCmds ); }
staticCmds.push( 'admin' );
client.groups.set( 'staticCmds', staticCmds );

client.ownerId = ( config.botOwnerId || process.env.OWNER_ID );

module.exports = client;

fs.readdirSync( './handlers' ).forEach( ( handler ) => {
  require( `./handlers/${handler}` )( client );
} );

client.login( process.env.token )
.then( async loggedIn => { console.log( 'Successfully connected!' ); } )
.catch( errLogin => { console.error( 'There was an error logging in:\n%s', errLogin.stack ); } );

keepAlive();