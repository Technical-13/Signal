const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/geocaching/logo.js' );

module.exports = {
  name: 'logo',
  group: 'geocaching',
  description: 'Give someone information about the logo kits for Geocaching.',
  options: [
    { type: 3, name: 'message-id', description: 'Paste message ID here' },
    { type: 6, name: 'target', description: 'Tag someone in response.' },
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const msgID = options.getString( 'message-id' );
      const cmdInputUser = options.getUser( 'target' );

      const objLocales = {
        de: 'Deutsch/German',
        en: 'English',
        fi: 'Suomi/Finnish',
        fr: 'Français/French',
        no: 'Norsk/Norwegian',
        pl: 'Polski/Polish',
        'sv-SE': 'Svenska/Swedish'
      };
      var getLocale = 'en';
      switch ( interaction.locale ) {
        case 'de' :
        case 'fi' :
        case 'fr' :
        case 'no' :
        case 'pl' :
        case 'sv-SE' : getLocale = interaction.locale; break;
        case 'en-US' :
        case 'en-GB' :
        default : getLocale = 'en';
      }
      const locale = getLocale;//( localeInput || getLocale );
      const strLocale = '(*' + objLocales[ locale ] + '*)';
      const i18InvalidMsgId = {
        de: 'ist keine gültige Nachrichten-ID.',
        en: 'is not a valid message-id.',
        fi: 'ei ole kelvollinen viestin tunnus.',
        fr: 'n\'est pas un identifiant de message valide.',
        no: 'er ikke en gyldig meldings-ID.',
        pl: 'nie jest prawidłowym identyfikatorem wiadomości.',
        'sv-SE': 'är inte ett giltigt meddelande-id.'
      };

      const { doLogs, chanDefault, chanError, strClosing } = await getGuildConfig( guild );
      if ( msgID && !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` ' + i18InvalidMsgId[ locale ] } ); }
      else if ( msgID ) {
        channel.messages.fetch( msgID )
        .then( message => {
          const { author: msgAuthor, content } = message;
          message.reply( { content: '<@' + msgAuthor.id + '>, ' + 'you seem to be looking for the Official Geocaching.com [Logo Kits](<https://www.geocaching.com/about/logousage.aspx>).\nThe kits have `*.png` & `*.eps` file versions.  If you\'re looking for an `*.svg` version, <@&385501075001573389> recommends using [EPS to SVG Converter](<https://cloudconvert.com/eps-to-svg>) by cloud**convert**' } )//i18FTFinfo[ locale ] } )
          .then( replied => {
            if ( doLogs && author.id != msgAuthor.id ) {
              chanDefault.send( { content:
                'I told <@' + msgAuthor.id + '> about FTFs ' + strLocale + ' in <#' + channel.id + '> at <@' + author.id +
                '>\'s `/logo` request in response to:\n```\n' + content + '\n```' + strClosing } )
              .then( sentLog => { interaction.deleteReply(); } )
              .catch( async errLog => { await errHandler( errLog, { chanType: 'default', command: 'logo', channel: channel, type: 'logLogs' } ); } );
            }
            else { interaction.deleteReply(); }
          } )
          .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'logo', doLog: doLogs, guild: guild, msgID: msgID, type: 'errSend' } ) ); } );
        } )
        .catch( async errFetch => { interaction.editReply( await errHandler( errFetch, { command: 'logo', msgID: msgID, type: 'errFetch' } ) ); } );
      }
      else if ( cmdInputUser ) {
        interaction.editReply( { content: '<@' + cmdInputUser.id + '>, ' + 'you seem to be looking for the Official Geocaching.com [Logo Kits](<https://www.geocaching.com/about/logousage.aspx>).\nThe kits have `*.png` & `*.eps` file versions.  If you\'re looking for an `*.svg` version, <@&385501075001573389> recommends using [EPS to SVG Converter](<https://cloudconvert.com/eps-to-svg>) by cloud**convert**' } ).then( replied => {//i18FTFinfo[ locale ] } ).then( replied => {
          if ( doLogs && cmdInputUser.id != author.id ) {
            chanDefault.send( { content: 'I told <@' + cmdInputUser.id + '> about the [Logo Kits](<https://www.geocaching.com/about/logousage.aspx>) at <@' + author.id +'>\'s `/logo` request.' + strClosing } )
            .catch( async errLog => { interaction.editReply( await errHandler( errLog, { chanType: 'default', command: 'logo', channel: channel, type: 'logLogs' } ) ); } );
          }
        } );
      }
      else {
        interaction.editReply( { content: 'You seem to be looking for the Official Geocaching.com [Logo Kits](<https://www.geocaching.com/about/logousage.aspx>).\nThe kits have `*.png` & `*.eps` file versions.  If you\'re looking for an `*.svg` version, <@&385501075001573389> recommends using [EPS to SVG Converter](<https://cloudconvert.com/eps-to-svg>) by cloud**convert**' } ).catch( noReply => {//i18FTFinfo[ locale ] } ).catch( noReply => {
          if ( doLogs ) {
            chanError.send( { content: 'Error telling <@' + author.id + '> about the [Logo Kits](<https://www.geocaching.com/about/logousage.aspx>) via `/logo` request.' + strClosing } )
            .catch( async errLog => { interaction.editReply( await errHandler( errLog, { chanType: 'error', command: 'logo', channel: channel, type: 'logLogs' } ) ); } );
          }
        } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};