const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const parse = require( '../../functions/parser.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './commands/chat/edit.js' );

module.exports = {
  name: 'edit',
  group: 'chat',
  description: 'Edit a bot message.\n\t§edit [message.id] [new message]',
  cooldown: 1000,
	run: async ( client, message, args ) => {
    try {
      message.delete();
      var delResponse;
      if ( args.length === 0 || !( /[\d]{17,19}/.test( args[ 0 ] ) ) ) { delResponse = await message.reply( { content: 'You forgot to tell me what message to edit.' } ); }
      else if ( args.length === 1 && ( /[\d]{17,19}/.test( args[ 0 ] ) ) ) { delResponse = await message.reply( { content: 'You forgot to tell me what the new message should be.' } ); }
      const { channel, guild, author } = message;
      const guildMember = await guild.members.cache.get( author.id );
      const { isBotMod, checkPermission, guildAllowsPremium, isServerBooster, isWhitelisted, content } = await userPerms( author, guild );
      if ( content ) { return message.reply( { content: content } ); }

      const canSpeak = ( isBotMod || checkPermission( 'ManageGuild' ) ? true : false );
      const msgID = args.shift();
      const mySaying = args.join( ' ' );
      const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
      const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
      const strAuthorTag = author.tag;

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( mySaying ) {
        const parsedSaying = await parse( mySaying, { member: guildMember } );
        if ( canSpeak && ( !mentionsEveryone || checkPermission( 'MentionEveryone' ) ) ) {
          channel.messages.fetch( msgID ).then( async message => {
            let oldContent = message.content;
            await message.edit( { content: parsedSaying } ).then( async edited => {
              if ( doLogs ) {
                chanChat.send( { content:
                  'I edited what I said in https://discord.com/channels/' + edited.guild.id + '/' + edited.channel.id + '/' + edited.id + ' at <@' + author.id + '>\'s request from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing
                } )
                .catch( async noLogChan => { delResponse = await message.reply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', channel: channel, type: 'logLogs' } ) ); } );
              }
              delResponse = await message.reply( { content: 'I edited my message for you!' } );
            } )
            .catch( async errSend => { delResponse = await message.reply( await errHandler( errSend, { command: 'edit', guild: guild, type: 'errSend' } ) ); } );
          } )
          .catch( async errFetch => { delResponse = await message.reply( await errHandler( errFetch, { command: 'edit', msgID: msgID, type: 'errFetch' } ) ); } );
        }
        else if ( mentionsEveryone && !checkPermission( 'MentionEveryone' ) ) {
          if ( doLogs ) {
            chanChat.send( { content: '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to change my message from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing } )
            .catch( async noLogChan => { delResponse = await message.reply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', channel: channel, type: 'logLogs' } ) ); } );
          }
          delResponse = await message.reply( { content: 'You have no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>!' } );
        }
        else {
          if ( doLogs ) {
            chanChat.send( { content:  '<@' + author.id + '> has no permission to use my `/edit` command from <#' + channel.id + '>. They tried to get me to change my message from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing } )
            .catch( async noLogChan => { delResponse = await message.reply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', channel: channel, type: 'logLogs' } ) ); } );
          }
          delResponse = await message.reply( { content: 'You have no permission to use my `/edit` command in <#' + channel.id + '>!' } );
        }
      }
      else { delResponse = await message.reply( { content: 'I don\'t know what to say.' } ); }
      if ( delResponse ) { setTimeout( () => { delResponse.delete(); }, 300000 ); }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};