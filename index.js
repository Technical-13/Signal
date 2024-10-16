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

const thisBotName = ( config.botName || process.env.BOT_USERNAME );
const botOwnerID = ( config.botOwnerId || process.env.OWNER_ID );
const mongoose = require( 'mongoose' );
const { model, Schema } = mongoose;
const botConfig = require( './models/BotConfig.js' );
const strConnectDB = ( process.env.mongodb || '' );
mongoose.set( 'strictQuery', false );
await mongoose.disconnect().then( dbDisconnected => console.log( chalk.yellow( 'MongoDB closed.' ) ) );
await mongoose.connect( strConnectDB )
  .then( async dbConnected => {
    console.log( chalk.greenBright( 'Connected to MongoDB.' ) );
    const newBot = ( await botConfig.countDocuments( { BotName: thisBotName } ) === 0 ? true : false );
    if ( newBot ) {
      await guildConfigDB.create( {
        BotName: thisBotName,
        ClientID: ( config.clientID || process.env.CLIENT_ID || client.id ),
        Owner: botOwnerID,
        Prefix: ( config.prefix || '!' ),
        Mods: ( config.moderatorIds || [] ),
        DevGuild: ( config.devGuildId || '' )
      } )
      .then( initSuccess => { console.log( 'Bot configuration initialized in my database.' ); } )
      .catch( initError => { console.error( 'Encountered an error attempting to initialize bot configuration in my database:\n%o', initError ); } );
    }
  } )
  .catch( dbConnectErr => { console.error( chalk.bold.red( `Failed to connect to MongoDB:\n${dbConnectErr}` ) ); } );

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