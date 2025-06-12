const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const parse = require( '../../functions/parser.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/geocaching/badgebar.js' );

module.exports = {
  name: 'badgebar',
  group: 'geocaching',
  description: 'Show Project-GC BadgeBar for user.'/*§<!--START-->*/,
  description_localizations: {
    de: 'Project-GC BadgeBar für Benutzer anzeigen.',
    fi: 'Näytä Project-GC BadgeBar käyttäjälle.',
    pl: 'Pokaż pasek odznak Project-GC dla użytkownika.' }/*<!--END-->§*/,
  options: [//gc-name, discord-user
    { type: 3, name: 'gc-name', description: 'The case-sensitive Geocaching.com username.'/*§<!--START-->*/,
      name_localizations: {
        de: 'gc-name',
        fr: 'nom-gc',
        fi: 'gc-nimi',
        pl: 'gc-name',
        'sv-SE': 'gc-namn' },
      description_localizations: {
        de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
        fi: 'Geocaching.com-käyttäjänimi, kirjainkoko merkitsevä.',
        pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' }/*<!--END-->§*/
    },
    { type: 6, name: 'discord-user', description: 'Discord member (requires nickname to be set if different from GC name).'/*§<!--START-->*/,
      name_localizations: {
        de: 'discord-benutzer',
        fr: 'utilisateur-discord',
        fi: 'discord-käyttäjä',
        pl: 'discord-użytkownik',
        'sv-SE': 'discord-användare' },
      description_localizations: {
        de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
        fi: 'Discord-jäsen (vaatii nimimerkin asettamisen, jos se on eri kuin GC-nimi).',
        pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' }/*<!--END-->§*/
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const command = client.slashCommands.get( 'badgebar' );
    const { langs, responses } = await getI18n( command );
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, locale, options, user: author } = interaction;
      const guildLang = ( langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
      const useLang = ( langs.indexOf( locale ) === -1 ? guildLang : locale );
      const { cache: members } = guild.members;
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
      const encName = encodeURIComponent( strUseName.replace( / /g, '_' ) );

      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );
      channel.send( { content:
        responses.badgebarFor[ useLang ] + ' ' +
        ( !objInputUser ? ( !objInputString ? ( !isAuthor ? '`' + strUseName + '`' : '<@' + author.id + '>' ) : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
        ( isAuthor ? '' : ' ' + await parse( responses.requestedBy[ useLang ], { author: author } ) ) +
        ':\nhttps://cdn2.project-gc.com/BadgeBar/' + encName + '.png#' + intYear + '-' + intMonth + '-' + intDay
      } )
      .then( async sentMsg => {
        if ( doLogs && !isAuthor ) {
          chanDefault.send( { content:
            responses.sharedFor[ guildLang ] + ' ' + ( !objInputUser ? ( !objInputString ? '`' + strUseName + '`' : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
            ' in <#' + channel.id + '> ' + await parse( responses.requestedBy[ guildLang ], { author: author } ) + ' ' + strClosing } )
          .then( sentLog => { interaction.deleteReply(); } )
          .catch( async errLog => { await errHandler( errLog, { chanType: 'default', command: 'badgebar', channel: channel, type: 'logLogs' } ); } );
        }
        else { interaction.deleteReply(); }
      } )
      .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'badgebar', channel: channel, type: 'errSend' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};