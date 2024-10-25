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
      console.log( 'Creating new bot database.' );
      const newBotConfig = {
        BotName: thisBotName,
        Blacklist: [],
        ClientID: clientId,
        DevGuild: devGuildId,
        Mods: ( config.moderatorIds || [] ),
        Owner: botOwnerID,
        Prefix: ( config.prefix || '!' ),
        Whitelist: []
      };
      await botConfig.create( newBotConfig )
      .then( initSuccess => { console.log( chalk.bold.greenBright( 'Bot configuration initialized in my database.' ) ); return newBotConfig; } )
      .catch( initError => { throw new Error( chalk.bold.red.bgYellowBright( `Error attempting to initialize bot configuration in my database:\n${initError}` ) ); } );
    }
    else if ( !thisBotName || !botOwnerID || !clientId || !devGuildId ) {
      if ( !thisBotName ) { throw new Error( chalk.bold.redBright( 'BotName missing attempting to initialize bot configuration in my database.' ) ); }
      if ( !botOwnerID ) { throw new Error( chalk.bold.redBright( 'ClientID missing attempting to initialize bot configuration in my database.' ) ); }
      if ( !clientId ) { throw new Error( chalk.bold.redBright( 'Owner missing attempting to initialize bot configuration in my database.' ) ); }
      if ( !devGuildId ) { throw new Error( chalk.bold.redBright( 'DevGuild missing attempting to initialize bot configuration in my database.' ) ); }
    }
    else {
      const myConfig = await botConfig.findOne( { BotName: thisBotName } );
//      console.log( 'Returning configuration from database:\n%o', myConfig );
      return myConfig;
    }
  } )
  .catch( dbConnectErr => { console.error( chalk.bold.red( `Failed to connect to MongoDB:\n${dbConnectErr}` ) ); } );
}