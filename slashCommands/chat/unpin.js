const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/chat/unpin.js' );

module.exports = {
  name: 'unpin',
  group: 'chat',
  description: 'unpin a message from the channel.',
  options: [ /* message-id //*/
    { type: 3, name: 'message-id', description: 'Paste message ID here:', required: true }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { isBotMod, checkPermission, guildAllowsPremium, isServerBooster, isWhitelisted, content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const canPin = ( isBotMod || checkPermission( 'ManageMessages' ) || ( guildAllowsPremium && isServerBooster ) || isWhitelisted ? true : false );
      const msgID = options.getString( 'message-id' );
      if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( !canPin ) {
        if ( doLogs ) {
          chanChat.send( { content: '<@' + author.id + '> tried to get me to unpin a message and doesn\'t have permission to do that.' } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'unpin', channel: channel, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You don\'t have permission to have me unpin messages.' } );
      }
      else {
        channel.messages.fetch( msgID ).then( async message => {
          const { channelId, guildId, pinned } = message;
          if ( message.author.id != client.user.id && message.author.id != author.id && !( isBotMod || checkPermission( 'ManageMessages' ) ) ) {
            if ( doLogs ) {
              chanChat.send( { content: '<@' + author.id + '> tried to get me to unpin https://discord.com/channels/' + guildId + '/' + channelId + '/' + msgID + ' that belongs to <@' + message.author.id + '>.  I am only allowed to unpin my own messages and messages from the author.' } )
              .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'unpin', channel: channel, type: 'logLogs' } ) ); } );
            }
            return interaction.editReply( { content: 'That message belongs to <@' + message.author.id + '>.  I am only allowed to unpin messages for you from myself or you.' } );
          }
          else if ( !pinned ) { return interaction.editReply( { content: 'That message is isn not pinned to the channel.  Perhaps you would like to `/pin message-id:' + msgID + '` instead?' } ); }
          else {
            message.unpin( 'Unpinning ' + ( message.author.id === client.user.id ? 'my' : message.author.displayName + '\'s' ) + ' message for ' + author.displayName + '.' )
            .then( msgUnpinned => { return interaction.editReply( { content: 'I unpinned that message for you.' } ); } )
            .catch( async errUnpin => { return interaction.editReply( await errHandler( errPin, { command: 'unpin', type: 'errPin' } ) ); } );
          }
        } )
        .catch( async errFetch => { return interaction.editReply( await errHandler( errFetch, { command: 'unpin', msgID: msgID, type: 'errFetch' } ) ); } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};