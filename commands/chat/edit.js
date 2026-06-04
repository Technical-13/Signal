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
	run: async ( client, msg, args ) => {
    try {
      msg.delete();
      const rawArgs = [ ...args ];
      var delResponse, abortReply = false;
      const msgLink = /https?:\/\/(?:[a-z]+\.)?discord\.com\/channels\/\d{17,19}\/\d{17,19}\/(\d{17,19})/i;
      const isValidTarget = args.length >= 1 ? ( /^\d{17,19}$/.test( args[ 0 ] ) || msgLink.test( args[ 0 ] ) ) : false;
      if ( args.length === 0 || !isValidTarget ) { delResponse = await msg.reply( { content: 'You forgot to tell me what message to edit.' } ); abortReply = true; }
      else if ( args.length === 1 && isValidTarget ) { delResponse = await msg.reply( { content: 'You forgot to tell me what the new message should be.' } ); abortReply = true; }
      const { author, channel, guild } = msg;
      const guildMember = await guild.members.cache.get( author.id );
      const { isBotMod, checkPermission, guildAllowsPremium, isServerBooster, isWhitelisted, content } = await userPerms( author, guild );
      if ( content ) { return msg.reply( { content: content } ); }

      const canSpeak = ( isBotMod || checkPermission( 'ManageGuild' ) ? true : false );
      let msgID = abortReply ? args?.[ 0 ] || '' : args.shift();
      if ( msgLink.test( msgID ) ) { msgID = msgID.match( msgLink )[ 1 ]; }
      if ( typeof msgID === 'string' && /^\d{17,19}$/.test( msgID ) ) {
        const bigMsgID = BigInt( msgID ) >> 22n, bigEpoch = BigInt( Date.UTC( 2015, 0, 1 ) ), bigNow = BigInt( Date.now() );
        if ( !( bigMsgID > 0n && ( bigMsgID + bigEpoch ) <= bigNow ) ) {
          console.error( 'Error in %s:\n\tUnable to parse `msgID` from %s', strScript, rawArgs[ 0 ] );
          delResponse = await msg.reply( { content: 'You forgot to tell me what message to edit.' } );
          abortReply = true;
        }
      }
      const mySaying = args.join( ' ' );
      const mentionsEveryone = /@(everyone|here)/g.test( mySaying ) || false;
      const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
      const strAuthorTag = author.tag;

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      if ( !chanChat ) { doLogs = false; console.error( 'Error in %s:\n\tVariable `chanChat` is %s', strScript, chanChat ); }
      if ( !strClosing ) { doLogs = false; console.error( 'Error in %s:\n\tVariable `strClosing` is %s', strScript, strClosing ); }
      if ( mySaying && !abortReply ) {
        const parsedSaying = await parse( mySaying, { member: guildMember } );
        channel.messages.fetch( msgID ).then( async oldMsg => {
          let oldContent = oldMsg?.content || 'empty';
          if ( canSpeak && ( !mentionsEveryone || checkPermission( 'MentionEveryone' ) ) ) {
            await oldMsg.edit( { content: parsedSaying } ).then( async edited => {
              else if ( doLogs ) {
                chanChat.send( { content:
                  'I edited what I said in https://discord.com/channels/' + edited.guild.id + '/' + edited.channel.id + '/' + edited.id + ' at <@' + author.id + '>\'s request from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing
                } )
                .catch( async noLogChan => { delResponse = await msg.reply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', channel: channel, type: 'logLogs' } ) ); } );
              }
              delResponse = await msg.reply( { content: 'I edited my message for you!' } );
            } )
            .catch( async errSend => { delResponse = await msg.reply( await errHandler( errSend, { command: 'edit', guild: guild, type: 'errSend' } ) ); } );
          }
          else if ( mentionsEveryone && !checkPermission( 'MentionEveryone' ) ) {
            if ( doLogs ) {
              chanChat.send( { content: '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to change my message from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + parsedSaying + '\n```' + strClosing } )
              .catch( async noLogChan => { delResponse = await msg.reply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', channel: channel, type: 'logLogs' } ) ); } );
            }
            delResponse = await msg.reply( { content: 'You have no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>!' } );
          }
          else {
            if ( doLogs ) {
              chanChat.send( { content:  '<@' + author.id + '> has no permission to use my `/edit` command from <#' + channel.id + '>. They tried to get me to change my message from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + parsedSaying + '\n```' + strClosing } )
              .catch( async noLogChan => { delResponse = await msg.reply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', channel: channel, type: 'logLogs' } ) ); } );
            }
            delResponse = await msg.reply( { content: 'You have no permission to use my `/edit` command in <#' + channel.id + '>!' } );
          }
        } ).catch( async errFetch => { delResponse = await msg.reply( await errHandler( errFetch, { command: 'edit', msgID: msgID, type: 'errFetch' } ) ); } );
      }
      else if ( !abortReply ) { delResponse = await msg.reply( { content: 'I don\'t know what to say.' } ); }
      if ( delResponse ) { setTimeout( () => { delResponse.delete(); }, 300000 ); }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};