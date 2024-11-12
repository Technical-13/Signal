const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/geocaching/statbar.js' );

module.exports = {
  name: 'statbar',
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
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
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

      channel.send( { content:
        'StatBar for: ' + ( !objInputUser ? ( !objInputString ? ( !isAuthor ? '`' + strUseName + '`' : '<@' + author.id + '>' ) : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
        ( isAuthor ? '' : ' as requested by <@' + author.id + '>' ) +
        '\nhttps://cdn2.project-gc.com/statbar.php?quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + strLabcaches + '&user=' + encName
      } )
      .then( sentMsg => {
        if ( doLogs && !isAuthor ) {
          chanDefault.send( { content:
            'I shared the `/statbar` for ' + ( !objInputUser ? ( !objInputString ? '`' + strUseName + '`' : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
            ' in <#' + channel.id + '> as requested by <@' + author.id + '>' + strClosing } )
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