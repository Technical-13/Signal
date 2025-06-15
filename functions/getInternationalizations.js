const client = require( '..' );
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const { Locale } = require( 'discord-api-types/v10' );
const parse = require( './parser.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getInternationalizations.js' );
const enNames = new Intl.DisplayNames( [ 'en-US' ], { type: 'language' } );
const objDefaults = { author: null, getLocales: false, guild: null, interaction: null, member: null, uptime: null, useLang: null };
const getOptions = ( options, langCode = 'en-US', objOpt = {} ) => {
  if ( !options ) { return { error: 'No options to get data for in getOptions().' }; }
  if ( Object.prototype.toString.call( options ) === '[object Object]' ) { options = Object.entries( options ); };
  if ( !Array.isArray( options ) ) { return { error: 'Unable to manipulate options of type "' + typeof( options ) + '" into an array to get data for in getOptions().' }; }
  if ( !langCode ) { return { error: 'No langCode to get data for in getOptions().' }; }

  options.forEach( ( opt ) => {
    objOpt[ opt[ 0 ] ] = ( objOpt[ opt[ 0 ] ] ?? { name: {}, description: {} } );
    const optBuilder = objOpt[ opt[ 0 ] ];
    const data = opt[ 1 ];
    optBuilder.name[ langCode ] = data.name;
    optBuilder.description[ langCode ] = data.description;
    if ( data.options ) { optBuilder.options = getOptions( data.options, langCode ); }
    if ( data.choices ) {
      if ( !optBuilder.choices ) {
        optBuilder.choices = [];
        let intLastChoice = ( data.choices.length - 1 );
        for ( intLastChoice; intLastChoice >= 0; intLastChoice-- ) { optBuilder.choices.push( {} ); }
      }
      data.choices.forEach( ( choice, ndx ) => { optBuilder.choices[ ndx ][ langCode ] = choice; } );
    }
  } );
  return objOpt;
};
const getResponses = ( responses, langCode = 'en-US', objRes = {}, params, debug ) => {
  if ( !responses ) { return { error: 'No responses to get data for in getResponses().' }; }
  if ( Object.prototype.toString.call( responses ) === '[object Object]' ) { responses = Object.entries( responses ); };
  if ( !Array.isArray( responses ) ) { return { error: 'Unable to manipulate responses of type "' + typeof( responses ) + '" into an array to get data for in getResponses().' }; }
  if ( !langCode ) { return { error: 'No langCode to get data for in getResponses().' }; }

  responses.forEach( ( res ) => {
    objRes[ res[ 0 ] ] = ( objRes[ res[ 0 ] ] ?? {} );
    const resBuilder = objRes[ res[ 0 ] ];
    resBuilder[ langCode ] = parse( res[ 1 ], params, debug );
  } );
  return objRes;
}

module.exports = ( command, params = objDefaults, debug = false ) => {
  try {
    const interaction = ( params.interaction ?? null );
    const { channel, guild: iGuild, locale: iLocale, options, user } = ( interaction ?? { channel: null, guild: null, locale: null, options: null, user: null } );
    const author = ( params.author ?? ( user ?? null ) );
    const member = ( params.member ?? null );
    const guild = ( params.guild ?? ( iGuild ?? ( author ? author.guild : ( member ? member.guild : null ) ) ) );
    const useLang = ( params.useLang ?? options?.getString( 'language' ) ?? iLocale ?? guild?.preferedLocale ?? 'en-US' );
    const langCodes = Object.values( Locale );
    const resParams = { author: author, channel: channel, guild: guild, member: member };
    if ( params.getLocales ) {
      const langNames = Object.keys( Locale );
      locales = {};
      langCodes.forEach( ( v, k ) => { locales[ v ] = enNames.of( v ); } );
      if ( !command ) { return locales; }
    }
    if ( !command ) { throw new Error( 'No command to get localizations for.' ); }

    const i18n = { langs: [], name: {}, description: {} };
    if ( params.getLocales ) { i18n.locales = locales }
    const files = fs.readdirSync( './i18n/' ).filter( file => file.endsWith( '.json' ) );
    i18n.langs = files.map( file => file.replace( '.json', '' ) );
    i18n.langs.forEach( ( langCode ) => {
      const currLangFile = require( '../i18n/' + langCode + '.json' );
      if ( !currLangFile[ command.type ] ) { console.info( chalk.hex( '#FFFFAA' ).bold( `${langCode}.json has no data for ${command.type}s.` ) ); }
      else if ( !currLangFile[ command.type ][ command.group ] ) { console.info( chalk.hex( '#FFFFAA' ).bold( `${langCode}.json has no data for the ${command.group} ${command.type} group.` ) ); }
      else if ( !currLangFile[ command.type ][ command.group ][ command.name ] ) { console.info( chalk.hex( '#FFFFAA' ).bold( `${langCode}.json has no data for the ${command.name} ${command.type}.` ) ); }
      else {
        const cmdPath = currLangFile[ command.type ][ command.group ][ command.name ];
        if ( langCodes.indexOf( langCode ) === -1 ) { console.warn( chalk.bold( `${langCode} is a language code not currently supported by Discord.` ) ); }
        else {
          i18n.name[ langCode ] = cmdPath.name;
          i18n.description[ langCode ] = cmdPath.description;
          if ( currLangFile.common.options ) { i18n.options = getOptions( currLangFile.common.options, langCode, i18n.options ); }
          if ( cmdPath.options ) { i18n.options = getOptions( cmdPath.options, langCode, i18n.options ); }
        }
        if ( currLangFile.common.responses ) { i18n.responses = getResponses( currLangFile.common.responses, langCode, i18n.responses, resParams, debug ); }
        if ( cmdPath.responses ) { i18n.responses = getResponses( cmdPath.responses, langCode, i18n.responses, resParams, debug ); }
      }
    } );

    return i18n;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};