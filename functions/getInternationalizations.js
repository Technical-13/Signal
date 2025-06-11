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
        i18n.description[ langCode ] = cmdPath.description;
        const commonOptions = Object.entries( currLangFile.common.options );
        commonOptions.forEach( ( opt ) => {
          i18n.options[ opt[ 0 ] ] = ( i18n.options[ opt[ 0 ] ] ?? { name: {}, description: {}, choices: [] } );
          const optBuilder = i18n.options[ opt[ 0 ] ];
          optBuilder.name[ langCode ] = opt[ 1 ].name;
          optBuilder.description[ langCode ] = opt[ 1 ].description;
          if ( opt[ 1 ].choices ) {
            opt[ 1 ].choices.forEach( ( choice ) => {
              var choiceIndex = optBuilder.choices.indexOf( choice );
              if ( choiceIndex === -1 ) {
                optBuilder.choices.push( {} );
                choiceIndex = optBuilder.choices.indexOf( choice );
              }
              optBuilder.choices[ choiceIndex ][ langCode ] = choice;
            } );
          }
        } );
        if ( cmdPath.options ) {
          const cmdOptions = Object.entries( cmdPath.options );
          cmdOptions.forEach( ( opt ) => {
            i18n.options[ opt[ 0 ] ] = ( i18n.options[ opt[ 0 ] ] ?? { name: {}, description: {} } );
            const optBuilder = i18n.options[ opt[ 0 ] ];
            optBuilder.name[ langCode ] = opt[ 1 ].name;
            optBuilder.description[ langCode ] = opt[ 1 ].description;
            //optBuilder.choices = '';//skip this for now.  Let's get name/desc working first.
          } );
        }
        const commonResponses = Object.entries( currLangFile.common.responses );
        commonResponses.forEach( ( res ) => { i18n.responses[ res[ 0 ] ] = res[ 1 ]; } );
        if ( cmdPath.responses ) {
          const cmdResponses = Object.entries( cmdPath.responses );
          cmdResponses.forEach( ( res ) => { i18n.responses[ res[ 0 ] ] = res[ 1 ]; } );
        }
      }
      else {
        console.warn( chalk.bold( `${langCode} is a language code not currently supported by Discord.` ) );
      }
    } );

    return i18n;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};