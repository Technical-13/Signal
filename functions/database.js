const client = require( '..' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const chalk = require( 'chalk' );

const thisBotName = ( config.botName || process.env.BOT_USERNAME || null );
const botOwnerID = ( config.botOwnerId || process.env.OWNER_ID || null );
const clientId = ( config.clientID || process.env.CLIENT_ID || client.id || null );
const devGuildId = ( config.devGuildId || process.env.DEV_GUILD_ID || null );
const mongoose = require( 'mongoose' );
const { model, Schema } = mongoose;
const botConfig = require( '../models/BotConfig.js' );
const strConnectDB = ( process.env.mongodb || '' );
mongoose.set( 'strictQuery', false );

module.exports = async () => {
  await mongoose.disconnect().then( dbDisconnected => console.log( chalk.yellow( 'MongoDB closed.' ) ) );
  await mongoose.connect( strConnectDB )
    .then( async dbConnected => {
      console.log( chalk.greenBright( 'Connected to MongoDB.' ) );
      const newBot = ( await botConfig.countDocuments( { BotName: thisBotName } ) === 0 ? true : false );
      if ( newBot && thisBotName && botOwnerID && clientId && devGuildId ) {
        await botConfig.create( {
          BotName: thisBotName,
          ClientID: clientId,
          Owner: botOwnerID,
          Prefix: ( config.prefix || '!' ),
          Blacklist: [],
          Whitelist: [],
          Mods: ( config.moderatorIds || [] ),
          DevGuild: devGuildId
        } )
        .then( initSuccess => { console.log( chalk.bold.greenBright( 'Bot configuration initialized in my database.' ) ); } )
        .catch( initError => { console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to initialize bot configuration in my database:\n${initError}` ) ); } );
      }
      else {
        if ( !thisBotName ) { console.error( chalk.bold.redBright( 'BotName missing attempting to initialize bot configuration in my database.' ) ); }
        if ( !botOwnerID ) { console.error( chalk.bold.redBright( 'ClientID missing attempting to initialize bot configuration in my database.' ) ); }
        if ( !clientId ) { console.error( chalk.bold.redBright( 'Owner missing attempting to initialize bot configuration in my database.' ) ); }
        if ( !devGuildId ) { console.error( chalk.bold.redBright( 'DevGuild missing attempting to initialize bot configuration in my database.' ) ); }
      }
    } )
    .catch( dbConnectErr => { console.error( chalk.bold.red( `Failed to connect to MongoDB:\n${dbConnectErr}` ) ); } );
}