const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const parse = require( '../../functions/parser.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/chat/say.js' );

module.exports = {
  name: 'say',
  group: 'chat',
  name_localizations: {
    de: 'sagen',
    fr: 'dire',
    fi: 'sano',
    pl: 'mowić',
    'sv-SE': 'säga' },
  description: 'Make bot speak.',
  options: [ {
    name: 'saying',
    description: 'What do you want me to say?',
    required: true,
    type: 3
  }, {
    name: 'channel',
    description: 'Where do you want me to say it? (default: current channel)',
    type: 7
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const guildMember = await guild.members.cache.get( author.id );
      const { botOwner, isBotMod, guildOwner, checkPermission, guildAllowsPremium, isServerBooster, isWhitelisted, content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const chanSpeak = options.getChannel( 'channel' ) || channel;
      const speakInChan = ( guild.members.cache.get( author.id ).permissionsIn( chanSpeak ).has( 'SendMessages' ) ? true : false );
      const canSpeak = ( ( isBotMod || checkPermission( 'ManageGuild' ) || checkPermission( 'ManageMessages' ) || isWhitelisted || ( guildAllowsPremium && isServerBooster ) ) && speakInChan ? true : false );
      const mySaying = options.getString( 'saying' );
      const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
      const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( mySaying ) {
        const parsedSaying = await parse( mySaying, { member: guildMember } );
        if ( canSpeak && ( !mentionsEveryone || checkPermission( 'MentionEveryone' ) ) ) {
          chanSpeak.send( { content: parsedSaying } ).then( async spoke => {
            if ( doLogs ) {
              chanChat.send( { content: 'I spoke in https://discord.com/channels/' + spoke.guild.id + '/' + spoke.channel.id + '/' + spoke.id + ' at <@' + author.id + '>\'s request:\n```' + mySaying + '\n```' + strClosing } )
              .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'say', channel: channel, type: 'logLogs' } ) ); } );
            }
            return interaction.editReply( { content: 'I said the thing!' } );
          } )
          .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'say', guild: guild, type: 'errSend' } ) ); } );
        }
        else if ( mentionsEveryone && !checkPermission( 'MentionEveryone' ) ) {
          if ( doLogs ) {
            chanChat.send( { content: '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + strClosing } )
            .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'say', channel: channel, type: 'logLogs' } ) ); } );
          }
          return interaction.editReply( { content: 'You have no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>!' } );
        }
        else {
          if ( doLogs ) {
            chanChat.send( { content: '<@' + author.id + '> has no permission to use my `/say` command from <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + strClosing } )
            .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'say', channel: channel, type: 'logLogs' } ) ); } );
          }
          return interaction.editReply( { content: 'You have no permission to use my `/say` command in <#' + channel.id + '>!' } );
        }
      }
      else { return interaction.editReply( { content: 'I don\'t know what to say.' } ); }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};