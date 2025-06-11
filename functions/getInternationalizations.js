const fs = require( 'fs' );
const client = require( '..' );
const { Locale } = require( 'discord-api-types/v10' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getInternationalizations.js' );
const enNames = new Intl.DisplayNames( [ 'en' ], { type: 'language' } );

module.exports = async ( command, getLocales = false ) => {
  try {
    const langCodes = Object.values( Locale );
    if ( getLocales ) {
      const langNames = Object.keys( Locale );
      locales = {};
      langCodes.forEach( ( v, k ) => { locales[ v ] = enNames.of( v ); } );
      if ( !command ) { return locales; }
    }
    if ( !command ) { throw new Error( 'No command to get localizations for.' ); }

    const i18n = { name: {}, description: {}, options: {}, responses: {} };
    if ( getLocales ) { i18n.locales = locales }
    const files = fs.readdirSync( './i18n/' ).filter( file => file.endsWith( '.json' ) );
    const langs = files.map( file => file.replace( '.json', '' ) );
    langs.forEach( ( langCode ) => {
      const languageNames = new Intl.DisplayNames( [ langCode ], { type: 'language' } );
      if ( langCodes.indexOf( langCode ) !== -1 ) {
        const currLangFile = require( '../i18n/' + langCode + '.json' );
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
              var choiceIndex = optBuilder.choices.findIndex( choices => choices[ langCode ] === choice );
              if ( choiceIndex === -1 ) {
                optBuilder.choices.push( {} );
                choiceIndex = optBuilder.choices.length - 1;
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
            if ( opt[ 1 ].choices ) {
              opt[ 1 ].choices.forEach( ( choice ) => {
                var choiceIndex = optBuilder.choices.findIndex( choices => choices[ langCode ] === choice );
                if ( choiceIndex === -1 ) {
                  optBuilder.choices.push( {} );
                  choiceIndex = optBuilder.choices.length - 1;
                }
                optBuilder.choices[ choiceIndex ][ langCode ] = choice;
              } );
            }
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