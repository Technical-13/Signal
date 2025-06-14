const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'geocaching', name: 'statbar', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Show Project-GC StatBar for user.',
  description_localizations: l10n.description,
  options: [
    { type: 3, name: 'gc-name', name_localizations: l10n.options[ 'gc-name' ].name,
      description: 'The case-sensitive Geocaching.com username.',
      description_localizations: l10n.options[ 'gc-name' ].description
    },
    { type: 6, name: 'discord-user', name_localizations: l10n.options[ 'discord-user' ].name,
      description: 'Discord member (requires nickname to be set if different from GC name).',
      description_localizations: l10n.options[ 'discord-user' ].description
    },
    { type : 5, name: 'labcaches', name_localizations: l10n.options.labcaches.name,
      description: 'Should I include labcaches? (default: true)',
      description_localizations: l10n.options.labcaches.description
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 3000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, locale, options, user: author } = interaction;
      const useLang = ( locale ?? 'en-US' );
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
      const encName = encodeURIComponent( strUseName.replace( / /g, '_' ) );
      const strLabcaches = ( options.getBoolean( 'labcaches' ) ? '&includeLabcaches' : '' );
      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );

      channel.send( { content:
        r6e.statbarFor[ useLang ] +
        ( !objInputUser ? ( !objInputString ? ( !isAuthor ? '`' + strUseName + '`' : '<@' + author.id + '>' ) : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
        ( isAuthor ? '' : r6e.requestedBy[ useLang ] ) +
        '\nhttps://cdn2.project-gc.com/statbar.php?quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + strLabcaches + '&user=' + encName
      } )
      .then( sentMsg => {
        if ( doLogs && !isAuthor ) {
          chanDefault.send( { content:
            r6e.sharedFor[ useLang ] + ( !objInputUser ? ( !objInputString ? '`' + strUseName + '`' : '<@' + objInputString.id + '>' ) : '<@' + objInputUser.id + '>' ) +
            r6e.in[ useLang ] + '<#' + channel.id + '>' + r6e.requestedBy[ useLang ] + strClosing } )
          .then( sentLog => { interaction.deleteReply(); } )
          .catch( errLog => { errHandler( errLog, { chanType: 'default', command: modData.name, channel: channel, type: 'logLogs' } ); } );
        }
        else { interaction.deleteReply(); }
      } )
      .catch( errSend => { interaction.editReply( errHandler( errSend, { command: modData.name, channel: channel, type: 'errSend' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};