const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const niceDefault = true;// Should the bot be nice by default?
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'fun', name: 'lmgtfy', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Let Me Google That For You!',
  description_localizations: l10n.description,
  options: [
    { type: 3, required: true,
      name: 'query', name_localizations: l10n.query.name,
      description: 'What do you want me to look up?',
      description_localizations: l10n.query.description
    },
    { type: 5, name: 'nice', name_localizations: l10n.nice.name,
      description: 'Should I be nice?',
      description_localizations: l10n.nice.description
    },
    { type: 6, name: 'taggee', name_localizations: l10n.taggee.name,
      description: 'Who should I mention with my response? (Default: yourself)',
      description_localizations: l10n.taggee.description
    },
    { type: 3, name: 'language', name_localizations: l10n.options.language.name,
      description: 'Language to give information in.',
      description_localizations: l10n.options.language.description,
      choices: [
        { value: 'de' name: 'Deutsch/German', name_localizations: l10n.language.choices[ 0 ] },
        { value: 'en-GB' name: 'British English', name_localizations: l10n.language.choices[ 1 ] },
        { value: 'en-US' name: 'American English (default)', name_localizations: l10n.language.choices[ 2 ] },
        { value: 'fi' name: 'Suomi/Finnish', name_localizations: l10n.language.choices[ 3 ] },
        { value: 'fr' name: 'Français/French', name_localizations: l10n.language.choices[ 4 ] },
        { value: 'no' name: 'Norsk/Norwegian', name_localizations: l10n.language.choices[ 5 ] },
        { value: 'pl' name: 'Polski/Polish', name_localizations: l10n.language.choices[ 6 ] },
        { value: 'pt-PT' name: 'Português/Portuguese (Portugal)', name_localizations: l10n.language.choices[ 7 ] },
        { value: 'sv-SE' name: 'Svenska/Swedish', name_localizations: l10n.language.choices[ 8 ] }
      ]
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM, InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, locale, options, user: author } = interaction;
      const localeInput = options?.getString( 'language' );
      const useLang = ( localeInput ?? ( locale ?? 'en-US' ) );
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      const cmdInputUser = options.getUser( 'discord-user' );
      const mentionUserID = ( cmdInputUser ? cmdInputUser.id : author.id );
      const mentionUser = '<@' + mentionUserID + '>';
      const beNice = ( options.getBoolean( 'nice' ) || ( cmdInputUser === author ? niceDefault : !niceDefault ) );
      const service = ( beNice ? 'www.google.com/search' : 'letmegooglethat.com/' );
      const strInputQuery = options.getString( 'query' );
      const q = encodeURI( strInputQuery.replace( / /g, '+' ) );

      channel.send( { content: mentionUser + ': <https://' + service + '?q=' + q + '>' } )
      .then( sentMsg => {
        if ( doLogs && mentionUserID != author.id ) {
          chanChat.send( { content: r6e.sent[ useLang ] + mentionUser + r6e.aCmdFor + '[`' + strInputQuery + '`](<https://' + service + '?q=' + q + '>) ' + r6e.in[ useLang ] + ' <#' + channel.id +
          '>,' + r6e.theyWere[ useLang ] + ( beNice ? '' : '**__' + r6e.not[ useLang ] + '__** ' ) + r6e.nice[ useLang ] + '.' } )
          .then( sentLog => { interaction.deleteReply(); } )
          .catch( async errLog => { await errHandler( errLog, { chanType: 'chat', command: strScript, channel: channel, type: 'logLogs' } ); } );
        }
        else { interaction.deleteReply(); }
      } )
      .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: strScript, channel: channel, type: 'errSend' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};