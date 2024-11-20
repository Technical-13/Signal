const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const parse = require( '../../functions/parser.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/chat/reply.js' );

module.exports = {
  name: 'reply',
  group: 'chat',
  name_localizations: {
    de: 'antwort',
    fr: 'répondre',
    fi: 'vastaa',
    pl: 'odpowiedź',
    'sv-SE': 'svar' },
  description: 'Make bot respond to message.',
  options: [ {
    name: 'message-id',
    description: 'Paste message ID here:',
    required: true,
    type: 3
  }, {
    name: 'response',
    description: 'What do you want me to say in response?',
    required: true,
    type: 3
  }  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const authorMember = await guild.members.cache.get( author.id );
      const { isBotMod, checkPermission, guildAllowsPremium, isServerBooster, isWhitelisted, content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const canSpeak = ( isBotMod || checkPermission( 'ManageGuild' ) || checkPermission( 'ManageMessages' ) || isWhitelisted || ( guildAllowsPremium && isServerBooster ) ? true : false );
      const msgID = options.getString( 'message-id' );
      if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
      const myResponse = options.getString( 'response' );
      const mentionsEveryone = /@(everyone|here)/g.test( myResponse );
      const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( myResponse ) ? 'everyone' : 'here' ) + '`' : null );
      const strAuthorTag = author.tag;

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( myResponse ) {
        if ( canSpeak && ( !mentionsEveryone || checkPermission( 'MentionEveryone' ) ) ) {
          channel.messages.fetch( msgID ).then( async message => {
            const guildMember = await message.guild.members.cache.get( message.author.id );
            const parsedSaying = await parse( myResponse, { author: authorMember, member: guildMember } );
            await message.reply( parsedSaying ).then( async responded => {
              if ( doLogs ) {
                chanChat.send( {
                  content: 'At <@' + author.id + '>\'s request, I replied to <@' + message.author.id + '>\'s message https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + '\n' + ( message.content ? '```\n' + message.content + '\n```' : '*`Attachment Only`*' ) + '\nWith https://discord.com/channels/' + responded.guild.id + '/' + responded.channel.id + '/' + responded.id + ':\n```\n' + parsedSaying + '\n```' + strClosing,
                  files: ( message.attachments.size === 0 ? null : [ message.attachments.first().attachment ] )
                } )
                .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'reply', channel: channel, type: 'logLogs' } ) ); } );
              }
              return interaction.editReply( { content: 'Responded!' } );
            } )
            .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'reply', guild: guild, type: 'errSend' } ) ); } );
          } )
          .catch( async errFetch => { return interaction.editReply( await errHandler( errFetch, { command: 'reply', msgID: msgID, type: 'errFetch' } ) ); } );
        }
        else if ( mentionsEveryone && !checkPermission( 'MentionEveryone' ) ) {
          if ( doLogs ) {
            chanChat.send( { content: '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to reply to a message I didn\'t bother to retrieve with:\n```\n' + myResponse + '\n```' + strClosing } )
            .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'reply', channel: channel, type: 'logLogs' } ) ); } );
          }
          return interaction.editReply( { content: 'You have no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>!' } );
        }
        else {
          if ( doLogs ) {
            chanChat.send( { content: '<@' + author.id + '> has no permission to use my `/reply` command from <#' + channel.id + '>. They tried to get me to reply to a message I didn\'t bother to retrieve with:\n```\n' + myResponse + '\n```' + strClosing } )
            .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'reply', channel: channel, type: 'logLogs' } ) ); } );
          }
          return interaction.editReply( { content: 'You have no permission to use my `/reply` command in <#' + channel.id + '>!' } );
        }
      }
      else { return interaction.editReply( { content: 'I don\'t know what to respond.' } ); }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};