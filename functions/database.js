const client = require( '..' );
require( 'dotenv' ).config();
const ENV = process.env;
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const mongoose = require( 'mongoose' );
const getBotConfig = require( './getBotDB.js' );
const strConnectDB = ( ENV.mongodb || '' );
mongoose.set( 'strictQuery', false );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/database.js' );

module.exports = async () => {
  try {
    await mongoose.disconnect().then( dbDisconnected => console.log( chalk.yellow( 'MongoDB closed.' ) ) );
    await mongoose.connect( strConnectDB )
    .then( async dbConnected => {
      await getBotConfig();
      console.log( chalk.greenBright( 'Connected bot to MongoDB.' ) );
    } )
    .catch( dbConnectErr => { console.error( chalk.bold.red( 'Failed to connect bot to MongoDB:\n%o' ), dbConnectErr ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
}