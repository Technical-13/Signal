const client = require( '..' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const getBotConfig = require( './getBotDB.js' );
const getGuildConfig = require( './getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/errorHandler.js' );
const getDebugString = ( thing ) => {
  if ( Array.isArray( thing ) ) { return '{ object-Array: { length: ' + thing.length + ' } }'; }
  else if ( Object.prototype.toString.call( thing ) === '[object Date]' ) { return '{ object-Date: { ISOstring: ' + thing.toISOString() + ', value: ' + thing.valueOf() + ' } }'; }
  else if ( typeof( thing ) != 'object' ) { return thing; }
  else {
    let objType = ( thing ? 'object-' + thing.constructor.name : typeof( thing ) );
    let objId = ( thing ? thing.id : 'no.id' );
    let objName = ( thing ? ( thing.displayName || thing.globalName || thing.name ) : 'no.name' );
    return '{ ' + objType + ': { id: ' + objId + ', name: ' + objName + ' } }';
  }
};

module.exports = async ( errObject, options = { command: 'undefined', debug: false, type: 'undefined' } ) => {
  try {
    const { command, debug, type } = options;
    if ( debug ) {
      const preAuthor = ( !options ? 'NO `options`!' : getDebugString( options.author ) );
      const preChan = ( !options ? 'NO `options`!' : getDebugString( options.channel ) );
      const prechanType = ( !options ? 'NO `options`!' : getDebugString( options.chanType ) );
      const preclearLists = ( !options ? 'NO `options`!' : getDebugString( options.clearLists ) );
      const preGuild = ( !options ? 'NO `options`!' : getDebugString( options.guild ) );
      const preinviteChanURL = ( !options ? 'NO `options`!' : getDebugString( options.inviteChanURL ) );
      const preinviteGuild = ( !options ? 'NO `options`!' : getDebugString( options.inviteGuild ) );
      const premember = ( !options ? 'NO `options`!' : getDebugString( options.member ) );
      const premodBlack = ( !options ? 'NO `options`!' : getDebugString( options.modBlack ) );
      const premodMod = ( !options ? 'NO `options`!' : getDebugString( options.modMod ) );
      const premodType = ( !options ? 'NO `options`!' : getDebugString( options.modType ) );
      const premodWhite = ( !options ? 'NO `options`!' : getDebugString( options.modWhite ) );
      const premsgID = ( !options ? 'NO `options`!' : getDebugString( options.msgID ) );
      const prerawReaction = ( !options ? 'NO `options`!' : getDebugString( options.rawReaction ) );
      const preEmoji = ( !options ? 'NO `options`!' : getDebugString( options.emoji ) );
      const preProcessed = { command: '{ typeof: ' + typeof( command ) + ', value: ' + command + ' }', type: '{ typeof: ' + typeof( type ) + ', value: ' + type + ' }', author: preAuthor, channel: preChan, chanType: prechanType, clearLists: preclearLists, guild: preGuild, inviteChanURL: preinviteChanURL, inviteGuild: preinviteGuild, member: premember, modBlack: premodBlack, modMod: premodMod, modWhite: premodWhite, msgID: premsgID, rawReaction: prerawReaction, reaction: preEmoji };
      console.warn( 'functions/errorHandler.js recieved options:%o', preProcessed );
    }
    const cmd = ( typeof( command ) === 'string' ? command : 'undefined' );
    const myTask = ( typeof( type ) === 'string' ? type : 'undefined' );
    const author = ( options.author ? options.author : null );
    const channel = ( options.channel ? options.channel : null );
    const chanType = ( options.chanType ? options.chanType : null );
    const clearLists = ( options.clearLists ? options.clearLists : null );
    const inviteChanURL = ( options.inviteChanURL ? options.inviteChanURL : null );
    const inviteGuild = ( options.inviteGuild ? options.inviteGuild : null );
    const member = ( options.member ? options.member : null );
    const modBlack = ( options.modBlack ? options.modBlack : null );
    const modMod = ( options.modMod ? options.modMod : null );
    const modType = ( options.modType ? options.modType : null );
    const modWhite = ( options.modWhite ? options.modWhite : null );
    const msgID = ( options.msgID ? options.msgID : null );
    const rawReaction = ( options.rawReaction ? options.rawReaction : null );
    const emoji = ( options.reaction ? options.reaction : null );
    const guild = ( options.guild ? options.guild : ( channel ? channel.guild : ( member ? member.guild : ( author ? author.guild : null ) ) ) );
    if ( debug ) {
      const prcAuthor = getDebugString( author );
      const prcChan = getDebugString( channel );
      const prcGuild = getDebugString( guild );
      const prcInviteGuild = getDebugString( inviteGuild );
      const prcEmoji = getDebugString( emoji );
      const prcMember = getDebugString( options.member );
      const processed = { cmd: cmd, myTask: myTask, author: prcAuthor, channel: prcChan, chanType: chanType, clearLists: clearLists, guild: prcGuild, inviteChanURL: inviteChanURL, inviteGuild: prcInviteGuild, member: prcMember, modBlack: modBlack, modMod: modMod, modType: modType, modWhite: modWhite, msgID: msgID, rawReaction: rawReaction, reaction: prcEmoji };
      console.warn( 'functions/errorHandler.js processed options:%o', processed );
    }
    const botConfig = await getBotConfig();
    const guildConfig = await getGuildConfig( guild );
    const { doLogs, chanError, strClosing } = guildConfig.Logs;
    const { Active: doInviteLogs, chanError: chanInviteError, strClosing: strInviteClosing } = ( inviteGuild ? await guildConfig( inviteGuild ) : { doLogs, Error: chanError, strClosing: strClosing } );

    const botUsers = client.users.cache;
    const ownerId = ( botConfig.Owner || client.ownerId || config.botOwnerId || process.env.OWNER_ID );
    const botOwner = botUsers.get( ownerId );
    const chanName = ( !channel ? 'undefined@guild#channel' : guild.name + '#' + channel.name );
    const chanLinkMessage = ( !channel ? '`guild#channel: undefined`' : '[' + chanName + '](<https://discord.com/channels/' + guild.id + '/' + channel.id + '>)' );
    const chanLinkConsole = ( !channel ? 'undefined@guild#channel' : 'https://discord.com/channels/' + guild.id + '/' + channel.id );
    const strConsole = '  Please check the console for details.';
    const strNotified = '  Error has been logged and my owner, <@' + botOwner.id + '>, has been notified.';
    const strLogged = '  Error has been logged and my owner, <@' + botOwner.id + '>, couldn\'t be notified.';

    switch ( myTask ) {
      case 'errDelete':// .catch( async errDelete => { interaction.editReply( await errHandler( errDelete, { command: '', channel: channel, type: 'errDelete' } ) ); } );
        switch ( errObject.code ) {
          case 50001 :// No MANAGE_MESSAGES permission in channel
            if ( doLogs ) { chanError.send( 'Please give me permission to `MANAGE_MESSAGES` in <#' + channel.id + '>.' + strClosing ); }
            return { content: 'I do not have permission to `MANAGE_MESSAGES` in <#' + channel.id + '>.' };
            break;
          default:
            console.error( 'Unable to `MANAGE_MESSAGES` for /' + cmd + ' request: %s', errObject.stack );
            botOwner.send( { content: 'Unable to `MANAGE_MESSAGES` for `/' + cmd + '` request in ' + chanLinkMessage + '.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %s', errNotSent.stack );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
            } );
        }
        break;
      case 'errEdit':// .catch( async errEdit => { interaction.editReply( await errHandler( errEdit, { command: '', channel: channel, type: 'errEdit' } ) ); } );
      case 'errReply':// .catch( async errReply => { author.send( await errHandler( errReply, { author: author, command: '', type: 'errReply' } ) ); } );
      case 'errSend':// .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: '', channel: channel, type: 'errSend' } ) ); } );
        switch ( errObject.code ) {
          case 50001 :// No SEND_MESSAGE permission in channel
            if ( debug ) { console.error( 'I do not have permission to send messages to %s for /%s request: %s\n\t%s', chanName, cmd, chanLinkConsole, errObject.stack ); }
            if ( doLogs ) { chanError.send( 'Please give me permission to send to <#' + channel.id + '>.' + strClosing ); }
            return { content: 'I do not have permission to send messages to <#' + channel.id + '>.' };
            break;
          case 50006:// Cannot send an empty message
            if ( debug ) { console.error( 'Cannot send empty message to %s in /%s request: %s\n\t%s', chanName, cmd, chanLinkConsole, errObject.stack ); }
            return { content: 'Message you tried to send was empty.' };
            break;
          case 50035:// Message > 2,000 character limit
            if ( debug ) { console.error( 'Cannot send message > 2,000 characters to %s in /%s request: %s\n\t%s', chanName, cmd, chanLinkConsole, errObject.stack ); }
            return { content: 'Message you tried to send was longer than the 2,000 character limit.' };
            break;
          default:
            console.error( 'Unable to send message to %s for /%s request: %s\n\t%s', chanName, cmd, chanLinkConsole, errObject.stack );
            botOwner.send( { content: 'Unable to send message to ' + chanLinkMessage + ' for `/' + cmd + '` request.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %s', errNotSent.stack );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
            } );
        }
        break;
      case 'errFetch':// .catch( async errFetch => { interaction.editReply( await errHandler( errFetch, { command: '', msgID: msgID, type: 'errFetch' } ) ); } );
        switch( errObject.code ) {
          case 10008://Unknown Message
            return { content: 'Unable to find message.' };
            break;
          case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
            return { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' };
            break;
          default:
            console.error( 'Unable to find message 🆔`' + msgID + '` for /' + cmd + ' request: %s', errObject.stack );
            botOwner.send( { content: 'Unable to find message 🆔`' + msgID + '` for `/' + cmd + '` request in ' + chanLinkMessage + '.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %s', errNotSent.stack );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
            } );
        }
        break;
      case 'errInvite':// .catch( async errInvite => { interaction.editReply( await errHandler( errInvite, { command: '', inviteGuild: inviteGuild, inviteChanURL: inviteChanURL, type: 'errInvite' } ) ); } );
        switch ( errObject.code ) {
          case 10003://Unknown Channel
            console.log( 'Unknown channel to create invite for %s:\n\tLink: %s', inviteGuild.name, inviteChanURL );
            if ( doInviteLogs ) { chanInviteError.send( 'I couldn\'t figure out which channel to make an invite to for a `/' + cmd + '` request.  Please use `/config set invite` to define which channel you\'d like invites to go to.' + strLogged + strInviteClosing ); }
            break;
          case 50013://Missing permissions
            chanInviteError.send( 'Help!  Please give me `CreateInstantInvite` permission in ' + inviteChanURL + '!' )
            .catch( errSend => {
              switch ( errSend.code ) {
                case 50001 :
                  if ( doInviteLogs ) { chanInviteError.send( 'Please give me permission to send to <#' + channel.id + '>.' + strInviteClosing ); }
                  break;
                default:
                  console.error( 'Unable to send message for /' + cmd + ' request: %s', errSend.stack );
                  botOwner.send( { content: 'Unable to send message for `/' + cmd + '` request in ' + chanLinkMessage + '.' + strConsole } )
                  .then( errSent => {
                    if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strInviteClosing ); }
                  } )
                  .catch( errNotSent => {
                    console.error( 'Error attempting to DM you about the above error: %s', errNotSent.stack );
                    if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strInviteClosing ); }
                  } );
              }
            } );
            break;
          default:
            console.error( 'Unable to create an invite for %s:\n%s', inviteGuild.name, errObject.stack );
            botOwner.send( { content: 'Unable to create an invite to ' + inviteGuild.name + ' for `/' + cmd + '` request in ' + chanLinkMessage + '.' + strConsole } )
            .then( errSent => {
              if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strInviteClosing ); }
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %s', errNotSent.stack );
              if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strInviteClosing ); }
            } );
        }
        break;
      case 'errReact':// .catch( async errFetch => { interaction.editReply( await errHandler( errFetch, { command: '', channel: channel, emoji: emoji, msgID: msgID, type: 'errFetch', rawReaction: rawReaction } ) ); } );
        switch ( errObject.code ) {
          case 10014://Reaction invalid
            if ( doLogs ) { chanError.send( 'Failed to react to message ' + chanLinkConsole + '/' + msgID + ' with `' + rawReaction + '`.' + strClosing ); }
            return { content: '`' + rawReaction + '` is not a valid `reaction` to react with. Please try again; the emoji picker is helpful in getting valid reactions.' };
          default:
            console.error( '%s: Reaction to #%o with %s (%s) failed:\n\tMsg: %s\n\tErr: %s', errObject.code, msgID, prcEmoji, rawReaction, errObject.message, errObject.stack );
            botOwner.send( 'Reaction to ' + chanLinkConsole + '/' + msgID + ' with `' + rawReaction + '` failed in ' + chanLinkMessage + '.' + strConsole )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Unknown Error reacting to message.' + strNotified };
            } ).catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Unknown Error reacting to message.' + strLogged };
            } );
        }
        break;
      case 'errRole':// .catch( async errRole => { interaction.editReply( await errHandler( errRole, { command: '', member: member, type: 'errRole' } ) ); } );
        switch ( errObject.code ) {
          case 50013://Missing Permissions
            if ( debug ) { console.error( 'I do not have permission to change roles to %s in %s at %s request:\n\t%s', member.displayName, guild.name, cmd, errObject.stack ); }
            if ( doLogs ) { chanError.send( 'Please give me permission to change roles to members.' + strClosing ); }
            return { content: 'I do not have permission to change roles to members.' };
          default:
            console.error( 'errRole in %s: %s', guild.name, errObject.stack );
            botOwner.send( 'Unknown errRole in ' + chanLinkMessage + '.' + strConsole )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Unknown Error reacting to message.' + strNotified };
            } ).catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Unknown Error reacting to message.' + strLogged };
            } );
        }
        break;
      case 'logLogs':// .catch( async errLog => { interaction.editReply( await errHandler( errLog, { command: '', chanType: 'chat|default|error', channel: channel, type: 'logLogs' } ) ); } );
        let logChan = ( chanType === 'chat' ? chanChat : ( chanType === 'error' ? chanError : chanDefault ) );
        console.error( 'Unable to log to %s channel: %s#%s\n%s', chanType, guild.name, logChan.name, errObject.stack );
        botOwner.send( { content: 'Unable to log to ' + chanType + ' channel <#' + logChan.id + '> in ' + chanLinkMessage + '.' + strConsole } )
        .then( errSent => { return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified } } )
        .catch( errNotSent => {
          console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
          if ( doLogs && chanType != 'error' ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
          return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
        } );
        break;
      case 'modifyDB':// .catch( async modifyDB => { interaction.editReply( await errHandler( modifyDB, { author: author, clearLists: clearLists, command: '', modType: '', type: 'modifyDB' } ) ); } );
        switch ( modType ) {
          case 'clear':
            console.error( 'Error attempting to clear my %s for %s: %s', clearLists, author.displayName, guild.name, errObject.stack );
            botOwner.send( 'Error attempting to clear my ' + clearLists + ' with `/' + cmd + ' clear` in ' + chanLinkMessage + '.' + strConsole )
            .then( sentOwner => {
              return { content: 'Error attempting to clear my ' + clearLists + ( cmd === 'system' ? '' : ' for this server' ) + '!' + strNotified };
            } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return { content: 'Error attempting to clear my ' + clearLists + ( cmd === 'system' ? '' : ' for this server' ) + '!' + strLogged };
            } );
            break;
          case 'add':
          case 'remove':
            if ( cmd === 'config' ) {
              const fromIn = ( modType === 'remove' ? 'from the database ' + ( modBlack ? 'black' : 'white' ) + 'list' : ' in the database' );
              const doList = ( modType === 'add' ? '' : 'de-' ) + ( modBlack ? 'blacklist' : 'whitelist' );
              const modTarget = ( modBlack || modWhite );
              var modTargetName;
              switch ( modTargetType ) {
                case 'GuildMember':
                  modTargetName = '@' + botUsers.get( modTarget ).displayName;
                  break;
                case 'Role':
                  modTargetName = '&' + guild.roles.cache.get( modTarget ).name;
              }
              console.error( 'Error attempting to %s %s (%s) %s:\n%s', doList, modTarget, modTargetName, fromIn, errObject.stack );
              return { content: 'Error attempting to ' + doList + ' <@' + modTarget + '> ' + fromIn + '.' + strConsole };
            }
            if ( cmd === 'system' ) {
              const fromInTo = ( modType === 'remove' ? 'from the database ' + ( modMod ? 'bot moderator list' : ( modBlack ? 'black' : 'white' ) + 'list' ) : ( modMod ? 'to' : 'in' ) + ' the database' );
              const doList = ( modMod ? modType : ( modType === 'add' ? '' : 'de-' ) ) + ( modMod ? ' a moderator' : ( modBlack ? 'blacklist' : 'whitelist' ) );
              const modTarget = ( modMod || modBlack || modWhite );
              console.error( chalk.bold.cyan.inverse( `Error attempting to ${doList} ${modTarget} (${botUsers.get( modTarget ).displayName}) ${fromInTo}:\n${errObject.stack}` ) );
              return { content: 'Error attempting to ' + doList + ' <@' + modTarget + '> ' + fromInTo + '.' + strConsole };
            }
            break;
          case 'reset':
            console.error( chalk.bold.cyan.inverse( 'Error attempting to reset %s configuration with `/%s reset`:\n%s' ), ( cmd === 'config' ? 'guild' : 'bot' ), cmd, errObject.stack );
            return { content: 'Error attempting to reset ' + ( cmd === 'config' ? 'guild' : 'bot' ) + ' configuration with `/' + cmd + ' reset`.' + strConsole };
            break;
          case 'set':
            console.error( 'Error attempting to modify %s configuration in my database:\n%s', ( cmd === 'config' ? 'guild' : 'bot' ), errObject.stack );
            return { content: 'Error attempting to modify ' + ( cmd === 'config' ? 'guild' : 'bot' ) + ' configuration in my database.' + strConsole };
            break;
          default:
            console.error( chalk.bold.cyan.inverse( 'Unknown error attempting to modify %s configuration in my database:\n%s' ), ( cmd === 'config' ? 'guild' : 'bot' ), errObject.stack );
            return { content: 'Unknown error attempting to modify ' + ( cmd === 'config' ? 'guild' : 'bot' ) + ' configuration in my database.' + strConsole };
        }
        break;
      case 'setPresence':// .catch( async setPresence => { interaction.editReply( await errHandler( setPresence, { command: '', type: 'setPresence' } ) ); } );
        console.error( 'Error in %s.js: %s', cmd, errObject.stack );
        break;
      case 'tryFunction':
        console.error( 'Error in %s.js: %s', cmd, errObject.stack );
        break;
      default:
        console.error( 'Unknown type (%s) to resolve error for: %s', myTask, errObject.stack );
        botOwner.send( { content: 'Unknown type (' + myTask + ') to resolve error for in ' + chanLinkMessage + '.' + strConsole } )
        .then( errSent => {
          if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
          return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
        } )
        .catch( errNotSent => {
          console.error( 'Error attempting to DM you about the above error: %s', errNotSent.stack );
          if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
          return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
        } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};