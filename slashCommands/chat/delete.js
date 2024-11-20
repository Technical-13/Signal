const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/chat/delete.js' );

module.exports = {
  name: 'delete',
  group: 'chat',
  description: 'Delete a bot message.',
  options: [ { type: 3, name: 'message-id', description: 'Paste message ID here:', required: true } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { isBotMod, checkPermission, guildAllowsPremium, isServerBooster, isWhitelisted, content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const canDelete = ( isBotMod || checkPermission( 'ManageGuild' ) || isWhitelisted ? true : false );
      const msgID = options.getString( 'message-id' );
      if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( !canDelete ) {
        if ( doLogs ) {
          chanChat.send( { content: '<@' + author.id + '> tried to get me to delete a message and doesn\'t have permission to do that.' } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'delete', channel: channel, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You don\'t have permission to have me delete my messages.' } );
      }
      else {
        channel.messages.fetch( msgID ).then( async message => {
          const { guildId, channelId } = message;
          if ( message.author.id != client.user.id ) {
            if ( doLogs ) {
              chanChat.send( { content: '<@' + author.id + '> tried to get me to delete https://discord.com/channels/' + guildId + '/' + channelId + '/' + msgID + ' that belongs to <@' + message.author.id + '>.  I am only allowed to delete my own messages.' } )
              .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'delete', channel: channel, type: 'logLogs' } ) ); } );
            }
            return interaction.editReply( { content: 'That message belongs to <@' + message.author.id + '>.  I am only allowed to delete my own messages.' } );
          }
          else {
            message.delete()
            .then( msgDeleted => { return interaction.editReply( { content: 'I deleted that message for you.' } ); } )
            .catch( async errDelete => { return interaction.editReply( await errHandler( errDelete, { command: 'delete', type: 'errDelete' } ) ); } );
          }
        } )
        .catch( async errFetch => { return interaction.editReply( await errHandler( errFetch, { command: 'delete', msgID: msgID, type: 'errFetch' } ) ); } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};