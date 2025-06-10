const fs = require( 'fs' );
const client = require( '..' );
const { Locale } = require( 'discord-api-types/v10' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getInternationalizations.js' );

module.exports = async ( command ) => {
  try {
    if ( !command ) { throw new Error( 'No command to get localizations for.' ); }

    const i18n = { locales: {} };
    const langCodes = Object.values( Locale );
    const langNames = Object.keys( Locale );
    langCodes.forEach( ( v, k ) => { i18n.locales[ v ] = langNames[ k ]; } );

    const files = fs.readdirSync( './i18n/' ).filter( file => file.endsWith( '.json' ) );
    files.forEach( ( filename ) => {
      const langCode = filename.replace( '.json', '' );
      if ( langCodes.indexOf( langCode ) !== -1 ) {
        console.log( 'Processing: %s', i18n.locales[ langCode ] );
        const currLang = require( './i18n/' + filename );
        console.log( 'currLang: %o', currLang );
      }
      else {
        console.warn( '%s is a language not currently supported by Discord.', i18n.locales[ langCode ] );
      }
    } );

    return i18n;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};