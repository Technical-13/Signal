const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const parse = require( '../../functions/parser.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/geocaching/statbar.js' );

module.exports = {
  name: 'statbar',
  group: 'geocaching',
  description: 'Show Project-GC StatBar for user.',
  description_localizations: {
    de: 'Project-GC StatBar für Benutzer anzeigen.',
    fi: 'Näytä Project-GC StatBar käyttäjälle.',
    pl: 'Pokaż Project-GC StatBar dla użytkownika.'
  },
  options: [ {
    name: 'gc-name',
    name_localizations: {
      de: 'gc-name',
      fr: 'nom-gc',
      fi: 'gc-nimi',
      pl: 'gc-name',
      'sv-SE': 'gc-namn' },
    description: 'The case-sensitive Geocaching.com username.',
    description_localizations: {
      de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
      fi: 'Geocaching.com-käyttäjänimi, kirjainkoko merkitsevä.',
      pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' },
    type: 3
  }, {
    name: 'discord-user',
    name_localizations: {
      de: 'discord-benutzer',
      fr: 'utilisateur-discord',
      fi: 'discord-käyttäjä',
      pl: 'discord-użytkownik',
      'sv-SE': 'discord-användare' },
    description: 'Discord member (requires nickname to be set if different from GC name).',
    description_localizations: {
      de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
      fi: 'Discord-jäsen (vaatii nimimerkin asettamisen, jos se on eri kuin GC-nimi).',
      pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' },
    type: 6
  }, {
    name: 'labcaches',
    description: 'Should I include labcaches? (default: true)',
    type : 5
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 3000,
  run: async ( client, interaction ) => {
    const command = client.slashCommands.get( 'statbar' );
    const { langs, responses } = await getI18n( command );/* TRON */console.log( 'responses: %o', responses );/* TROFF */
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, locale, options, user: author } = interaction;
      const guildLang = ( langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
      const useLang = ( langs.indexOf( locale ) === -1 ? guildLang : locale );
      const members = guild.members.cache;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const today = ( new Date() );
      const intYear = today.getFullYear();
      const intMonthNow = today.getMonth();
      const intMonth = ( intMonthNow < 9 ? '0' : '' ) + ( intMonthNow + 1 ).toString();
      const intDayNow = today.getDate();
      const intDay = ( intDayNow <= 9 ? '0' : '' ) + intDayNow.toString();

      const strAuthorDisplayName = members.get( author.id ).displayName;
      const strInputString = ( options.getString( 'gc-name' ) || null );
      const objInputString = ( members.find( mbr => mbr.displayName === strInputString ) || null );
      const objInputUser = ( options.getUser( 'discord-user' ) || null );
      const strInputUserDisplayName = ( objInputUser ? members.get( objInputUser.id ).displayName : strInputString );
      const isAuthor = ( ( !strInputString && !objInputUser ) || author.id === objInputString?.id || strInputUserDisplayName === strAuthorDisplayName ? true : false );
      const strUseName = ( strInputUserDisplayName ? strInputUserDisplayName : strAuthorDisplayName );
      const encName = encodeURI( strUseName ).replace( '&', '%26' );
      const strLabcaches = ( options.getBoolean( 'labcaches' ) ? '&includeLabcaches' : '' );
      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );
      const chanParsedReqBy = await parse( responses.requestBy[ useLang ], { author: author } );

      channel.send( { content:
        responses.statbarFor[ useLang ] + ' ' +
        ( !objInputUser ? ( !objInputString ? ( !isAuthor ? '`' + strUseName + '`' : '<@' + author.id + '>' ) : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
        ( isAuthor ? '' : ' ' + chanParsedReqBy ) +
        '\nhttps://cdn2.project-gc.com/statbar.php?quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + strLabcaches + '&user=' + encName
      } )
      .then( async sentMsg => {
        if ( doLogs && !isAuthor ) {
          const logParsedReqBy = await parse( responses.requestBy[ guildLang ], { author: author } );
          chanDefault.send( { content:
            responses.sharedFor[ guildLang ] + ( !objInputUser ? ( !objInputString ? '`' + strUseName + '`' : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
            responses.in[ guildLang ] + ' <#' + channel.id + '> ' + logParsedReqBy + ' ' + strClosing } )
          .then( sentLog => { interaction.deleteReply(); } )
          .catch( async errLog => { await errHandler( errLog, { chanType: 'default', command: 'statbar', channel: channel, type: 'logLogs' } ); } );
        }
        else { interaction.deleteReply(); }
      } )
      .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'statbar', channel: channel, type: 'errSend' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};