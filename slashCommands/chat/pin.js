const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/chat/pin.js' );

module.exports = {
  name: 'pin',
  group: 'chat',
  description: 'Pin a message to the channel.',
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

      const canPin = ( isBotMod || checkPermission( 'ManageGuild' ) || ( guildAllowsPremium && isServerBooster ) || isWhitelisted ? true : false );
      const msgID = options.getString( 'message-id' );
      if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( !canPin ) {
        if ( doLogs ) {
          chanChat.send( { content: '<@' + author.id + '> tried to get me to pin a message and doesn\'t have permission to do that.' } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'pin', channel: channel, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You don\'t have permission to have me pin messages.' } );
      }
      else {
        channel.messages.fetch( msgID ).then( async message => {
          const { guildId, channelId } = message;
          if ( message.author.id != client.user.id && message.author.id != author.id && !( isBotMod || checkPermission( 'ManageGuild' ) ) ) {
            if ( doLogs ) {
              chanChat.send( { content: '<@' + author.id + '> tried to get me to pin https://discord.com/channels/' + guildId + '/' + channelId + '/' + msgID + ' that belongs to <@' + message.author.id + '>.  I am only allowed to pin my own messages and messages from the author.' } )
              .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'pin', channel: channel, type: 'logLogs' } ) ); } );
            }
            return interaction.editReply( { content: 'That message belongs to <@' + message.author.id + '>.  I am only allowed to pin my own messages and your messages for you.' } );
          }
          else {
            message.pin( 'Pinning ' + ( message.author.id === client.user.id ? 'my' : message.author.displayName + '\'s' ) + ' message for ' + author.displayName + '.' )
            .then( msgPinned => { return interaction.editReply( { content: 'I pinned that message for you.' } ); } )
            .catch( async errPin => { return interaction.editReply( await errHandler( errPin, { command: 'pin', type: 'errPin' } ) ); } );
          }
        } )
        .catch( async errFetch => { return interaction.editReply( await errHandler( errFetch, { command: 'pin', msgID: msgID, type: 'errFetch' } ) ); } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};