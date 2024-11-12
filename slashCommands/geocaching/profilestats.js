const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/geocaching/profilestats.js' );

module.exports = {
  name: 'profilestats',
  description: 'Show link to Project-GC ProfileStats for user.',
  description_localizations: {
    de: 'Link zu Project-GC ProfileStats für Benutzer anzeigen.',
    fi: 'Näytä käyttäjälle linkki Project-GC ProfileStatsiin.',
    pl: 'Pokaż link do Project-GC ProfileStats dla użytkownika.' },
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
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 120000,
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
      const intMonth = ( intMonthNow < 9 ? '0' + ( intMonthNow + 1 ).toString() : ( intMonthNow + 1 ).toString() );
      const intDayNow = today.getDate();
      const intDay = ( intDayNow <= 9 ? '0' + intDayNow.toString() : intDayNow.toString() );

      const strAuthorDisplayName = members.get( author.id ).displayName;
      const strInputString = ( options.getString( 'gc-name' ) || null );
      const objInputString = ( members.find( mbr => mbr.displayName === strInputString ) || null );
      const objInputUser = ( options.getUser( 'discord-user' ) || null );
      const strInputUserDisplayName = ( objInputUser ? members.get( objInputUser.id ).displayName : strInputString );
      const isAuthor = ( ( !strInputString && !objInputUser ) || author.id === objInputString?.id || strInputUserDisplayName === strAuthorDisplayName ? true : false );
      const strUseName = ( strInputUserDisplayName ? strInputUserDisplayName : strAuthorDisplayName );
      const encName = encodeURI( strUseName ).replace( '&', '%26' );

      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );
      channel.send( { content:
        'ProfileStats link for: ' +
        ( !objInputUser ? ( !objInputString ? ( !isAuthor ? '`' + strUseName + '`' : '<@' + author.id + '>' ) : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
        ( isAuthor ? '' : ' as requested by <@' + author.id + '>' ) + '\n<https://project-gc.com/Profile/ProfileStats?profile_name=' + encName + '>'
      } )
      .then( sentMsg => {
        if ( doLogs && !isAuthor ) {
          chanDefault.send( { content:
            'I shared the `/profilestats` for ' + ( !objInputUser ? ( !objInputString ? '`' + strUseName + '`' : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
            ' in <#' + channel.id + '> as requested by <@' + author.id + '>' + strClosing } )
          .then( sentLog => { interaction.deleteReply(); } )
          .catch( async errLog => { await errHandler( errLog, { chanType: 'default', command: 'profilestats', channel: channel, type: 'logLogs' } ); } );
        }
        else { interaction.deleteReply(); }
      } )
      .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'profilestats', channel: channel, type: 'errSend' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};