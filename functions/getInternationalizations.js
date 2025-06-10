const fs = require( 'fs' );
const client = require( '..' );
const { Locale } = require( 'discord-api-types/v10' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getInternationalizations.js' );

module.exports = async ( command ) => {
  try {
    if ( !command ) { throw new Error( 'No command to get localizations for.' ); }

    const i18n = { locales: {}, name: {}, description: {}, options: {}, responses: {} };
    const langCodes = Object.values( Locale );
    const langNames = Object.keys( Locale );
    langCodes.forEach( ( v, k ) => { i18n.locales[ v ] = langNames[ k ]; } );

    const files = fs.readdirSync( './i18n/' ).filter( file => file.endsWith( '.json' ) );
    files.forEach( ( filename ) => {
      const langCode = filename.replace( '.json', '' );
      if ( langCodes.indexOf( langCode ) !== -1 ) {
        console.log( 'Processing: %s', i18n.locales[ langCode ] );
        const currLangFile = require( '../i18n/' + filename );
        const cmdPath = currLangFile[ command.group ][ command.name ];
        i18n.name[ langCode ] = cmdPath.name;
        i18n.description[ langCode ] = cmdPath.description;/* TRON */console.log( 'i18n: %o', i18n );/* TROFF */
        /*const commonOptions = Object.entries( currLangFile.common.options );
        commonOptions.forEach( ( opt ) => {
          i18n.options[ opt[ 0 ] ] = {};
          const optBuilder = i18n.options[ opt[ 0 ] ];
          optBuilder.name = opt[ 1 ].name;
          optBuilder.description = opt[ 1 ].description;
          //optBuilder.choices = '';//skip this for now.  Let's get name/desc working first.
        } );//*/
        /*if ( cmdPath.options ) {
          const cmdOptions = Object.entries( cmdPath.options );/* TRON /console.log( 'cmdOptions: %o', cmdOptions );/* TROFF /
          cmdOptions.forEach( ( opt ) => {
            const optBuilder = i18n.options[ opt[ 0 ] ];
            optBuilder.name = opt[ 1 ].name;
            optBuilder.description = opt[ 1 ].description;
            //optBuilder.choices = '';//skip this for now.  Let's get name/desc working first.
          } );
        }//*/
        /*const commonResponses = Object.entries( currLangFile.common.responses );/* TRON /console.log( 'commonResponses: %o', commonResponses );/* TROFF /
        commonResponses.forEach( ( res ) => { i18n.responses[ res[ 0 ] ] = res[ 1 ]; } );//*/
        /*if ( cmdPath.responses ) {
          const cmdResponses = Object.entries( cmdPath.responses );/* TRON /console.log( 'cmdResponses: %o', cmdResponses );/* TROFF /
          cmdResponses.forEach( ( res ) => { i18n.responses[ res[ 0 ] ] = res[ 1 ]; } );
        }//*/
      }
      else {
        console.warn( '%s is a language not currently supported by Discord.', i18n.locales[ langCode ] );
      }
    } );

    return i18n;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};