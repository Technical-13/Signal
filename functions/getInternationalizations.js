const fs = require( 'fs' );
const client = require( '..' );
const { Locale } = require( 'discord-api-types/v10' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getInternationalizations.js' );

module.exports = async ( command ) => {
  try {
    const langCodes = Object.values( Locale );
    const langNames = Object.keys( Locale );
    const i18n = { codes: langCodes, names: langNames };
    fs.readdirSync( './i18n/' ).forEach( async dir => {
      const files = fs.readdirSync( `./i18n/${dir}/` ).filter( file => file.endsWith( '.json' ) );
      console.log( 'I see: %o', files );
    } );

    return i18n;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};