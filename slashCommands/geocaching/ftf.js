const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'geocaching', name: 'ftf', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Tell someone how to get their FTF (First To Find) noticed on Project-GC.',
  description_localizations: l10n.description,
  options: [
    { type: 3, name: 'message-id', name_localizations: l10n.options[ 'message-id' ].name,
      description: 'Paste message ID here',
      description_localizations: l10n.options[ 'message-id' ].description
    },
    { type: 6, name: 'taggee', name_localizations: l10n.options.taggee.name,
      description: 'Who should I mention with my response? (Default: yourself)',
      description_localizations: l10n.options.taggee.description
    },
    { type: 3, name: 'language', name_localizations: l10n.options.language.name,
      description: 'Language to give information in.',
      description_localizations: l10n.options.language.description,
      choices: [
        { value: 'de', name: 'Deutsch/German', name_localizations: l10n.options.language.choices[ 0 ] },
        { value: 'en-GB', name: 'British', name_localizations: l10n.options.language.choices[ 1 ] },
        { value: 'en-US', name: 'American (default)', name_localizations: l10n.options.language.choices[ 2 ] },
        { value: 'fi', name: 'Suomi/Finnish', name_localizations: l10n.options.language.choices[ 3 ] },
        { value: 'fr', name: 'Français/French', name_localizations: l10n.options.language.choices[ 4 ] },
        { value: 'no', name: 'Norsk/Norwegian', name_localizations: l10n.options.language.choices[ 5 ] },
        { value: 'pl', name: 'Polski/Polish', name_localizations: l10n.options.language.choices[ 6 ] },
        { value: 'pt-PT', name: 'Português/Portuguese (Portugal)', name_localizations: l10n.options.language.choices[ 7 ] },
        { value: 'sv-SE', name: 'Svenska/Swedish', name_localizations: l10n.options.language.choices[ 8 ] }
      ]
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      const { channel, guild, guildLocale, locale, options, user: author } = interaction;
      const msgID = options.getString( 'message-id' );
      const respMsg = ( !msgID ? null : ( !( /[\d]{18,19}/.test( msgID ) ) ? null : await channel.messages.fetch( myString ) ) );
      const r6e = getI18n( modData, { interaction: interaction, respMsg: respMsg } ).responses;
      await interaction.deferReply( { ephemeral: true } );
      const localeInput = options?.getString( 'language' );
      const useLang = ( localeInput ?? ( locale ?? 'en-US' ) );
      const guildLang = ( guildLocale ?? useLang );
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }
      const cmdTaggee = options.getUser( 'taggee' );
      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );

      if ( msgID && !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` ' + r6e.invalidMsgId[ useLang ] } ); }
      else if ( respMsg ) {
        respMsg.then( message => {
          const { author: msgAuthor, content } = message;
          message.reply( { content: r6e.ftfAuthorInfo[ useLang ] + r6e.ftfInfo[ useLang ] } )
          .then( replied => {
            if ( doLogs && author.id != msgAuthor.id ) {
              chanDefault.send( { content:
                r6e.logToldTaggeeAbout[ guildLang ] + 'FTFs' + r6e.logLangChanAtRequest[ guildLang ] + r6e.logInResponse[ guildLang ] + '\n```\n' + content + '\n```' + strClosing } )
              .then( sentLog => { interaction.deleteReply(); } )
              .catch( errLog => { errHandler( errLog, { chanType: 'default', command: modData.name, channel: channel, type: 'logLogs' } ); } );
            }
            else { interaction.deleteReply(); }
          } )
          .catch( errSend => { interaction.editReply( errHandler( errSend, { command: modData.name, doLog: doLogs, guild: guild, msgID: msgID, type: 'errSend' } ) ); } );
        } )
        .catch( errFetch => { interaction.editReply( errHandler( errFetch, { command: modData.name, msgID: msgID, type: 'errFetch' } ) ); } );
      }
      else if ( cmdTaggee ) {
        interaction.editReply( { content: r6e.ftfTaggeeInfo[ useLang ] + r6e.ftfInfo[ useLang ] } ).then( replied => {
          if ( doLogs && cmdTaggee.id != author.id ) {
            chanDefault.send( { content: r6e.logToldTaggeeAbout[ guildLang ] + 'FTFs' + r6e.logLangChanAtRequest[ guildLang ] + '.' + strClosing } )
            .catch( errLog => { interaction.editReply( errHandler( errLog, { chanType: 'default', command: modData.name, channel: channel, type: 'logLogs' } ) ); } );
          }
        } );
      }
      else {
        interaction.editReply( { content: 'T' + r6e.ftfInfo[ useLang ] } ).catch( noReply => {
          if ( doLogs ) {
            chanError.send( { content: r6e.errTellAuthor[ guildLang ] + 'FTFs' + r6e.logLangChanAtRequest[ guildLang ] + '.' + strClosing } )
            .catch( errLog => { interaction.editReply( errHandler( errLog, { chanType: 'error', command: modData.name, channel: channel, type: 'logLogs' } ) ); } );
          }
        } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};