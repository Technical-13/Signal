const client = require( '..' );
const config = require( '../config.json' );
require( 'dotenv' ).config();

const thisBotName = ( config.botName || process.env.BOT_USERNAME );
const botOwnerID = ( config.botOwnerId || process.env.OWNER_ID );
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
}