const client = require( '..' );
require( 'dotenv' ).config();
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const logChans = require( './getLogChans.js' );

module.exports = async ( objError, options = { command: 'undefined', debug: false, type: 'undefined' } ) => {
  const { command, debug, type } = options;
  
  if ( debug ) {
    const preAuthor = ( !options ? 'NO `options`!' : ( options.author ? options.author.id : options.author ) );
    const preChan = ( !options ? 'NO `options`!' : ( options.channel ? options.channel.id : options.channel ) );
    const prechanType = ( !options ? 'NO `options`!' : options.chanType );
    const preclearLists = ( !options ? 'NO `options`!' : options.clearLists );
    const preGuild = ( !options ? 'NO `options`!' : ( options.guild ? options.guild.id : options.guild ) );
    const preinviteChanURL = ( !options ? 'NO `options`!' : options.inviteChanURL );
    const preinviteGuild = ( !options ? 'NO `options`!' : ( options.inviteGuild ? options.inviteGuild.id : options.inviteGuild ) );
    const premodBlack = ( !options ? 'NO `options`!' : options.modBlack );
    const premodMod = ( !options ? 'NO `options`!' : options.modMod );
    const premodType = ( !options ? 'NO `options`!' : options.modType );
    const premodWhite = ( !options ? 'NO `options`!' : options.modWhite );
    const premsgID = ( !options ? 'NO `options`!' : options.msgID );
    const prerawReaction = ( !options ? 'NO `options`!' : options.rawReaction );
    const preEmoji = ( !options ? 'NO `options`!' : ( options.emoji ? options.emoji.id : options.emoji ) );
    const preProcessed = { command: command, type: type, author: preAuthor, channel: preChan, chanType: prechanType, clearLists: preclearLists, guild: preGuild, inviteChanURL: preinviteChanURL, inviteGuild: preinviteGuild, modBlack: premodBlack, modMod: premodMod, modWhite: premodWhite, msgID: premsgID, rawReaction: prerawReaction, reaction: preEmoji };
    console.warn( 'errorHandler recieved options:%o', preProcessed );
  }
  
  const cmd = ( typeof command === 'string' ? command : 'undefined' );
  const myTask = ( typeof type === 'string' ? type : 'undefined' );
  const author = ( options.author ? options.author : null );
  const channel = ( options.channel ? options.channel : null );
  const chanType = ( options.chanType ? options.chanType : null );
  const clearLists = ( options.clearLists ? options.clearLists : null );
  const guild = ( options.guild ? options.guild : null );
  const inviteChanURL = ( options.inviteChanURL ? options.inviteChanURL : null );
  const inviteGuild = ( options.inviteGuild ? options.inviteGuild : null );
  const modBlack = ( options.modBlack ? options.modBlack : null );
  const modMod = ( options.modMod ? options.modMod : null );
  const modType = ( options.modType ? options.modType : null );
  const modWhite = ( options.modWhite ? options.modWhite : null );
  const msgID = ( options.msgID ? options.msgID : null );
  const rawReaction = ( options.rawReaction ? options.rawReaction : null );
  const emoji = ( options.reaction ? options.reaction : null );
  
  if ( debug ) {
    const prcAuthor = ( author ? author.id : author );
    const prcChan = ( channel ? channel.id : channel );
    const prcGuild = ( guild ? guild.id : guild );
    const prcInviteGuild = ( inviteGuild ? inviteGuild.id : inviteGuild );
    const prcEmoji = ( emoji ? emoji.id : emoji );
    const processed = { cmd: cmd, myTask: myTask, author: prcAuthor, channel: prcChan, chanType: chanType, clearLists: clearLists, guild: prcGuild, inviteChanURL: inviteChanURL, inviteGuild: prcInviteGuild, modBlack: modBlack, modMod: modMod, modType: modType, modWhite: modWhite, msgID: msgID, rawReaction: rawReaction, reaction: prcEmoji };
    console.warn( 'errorHandler processed options:%o', processed );
  }

  const { chanChat, chanDefault, chanError, doLogs, strClosing } = ( guild ? await logChans( guild ) : { chanChat: null, chanDefault: null, chanError: null, doLogs: false, strClosing: null } );
  const { chanError: chanInviteError, doLogs: doInviteLogs, strClosing: strInviteClosing } = ( inviteGuild ? await logChans( inviteGuild ) : { chanError: chanError, doLogs: doLogs, strClosing: strClosing } );

  const botUsers = client.users.cache;
  const ownerId = ( config.botOwnerId || process.env.OWNER_ID );
  const botOwner = botUsers.get( ownerId );
  const strConsole = '  Please check the console for details.';
  const strNotified = '  Error has been logged and my owner, <@' + botOwner.id + '>, has been notified.';
  const strLogged = '  Error has been logged and my owner, <@' + botOwner.id + '>, couldn\'t be notified.';

  try {
    switch ( myTask ) {
      case 'errEdit':
      case 'errSend':
        switch ( objError.code ) {
          case 50001 :
            if ( doLogs ) { chanError.send( 'Please give me permission to send to <#' + channel.id + '>.' + strClosing ); }
            return { content: 'I do not have permission to send messages in <#' + channel.id + '>.' };
            break;
          default:
            console.error( 'Unable to send message for /' + cmd + ' request: %o', objError );
            botOwner.send( { content: 'Unable to send message for `/' + cmd + '` request.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
            } );
        }
        break;
      case 'errFetch':
        switch( objError.code ) {
          case 10008://Unknown Message
            return { content: 'Unable to find message.' };
            break;
          case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
            return { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' };
            break;
          default:
            console.error( 'Unable to find message 🆔`' + msgID + '` for /' + cmd + ' request: %o', objError );
            botOwner.send( { content: 'Unable to find message 🆔`' + msgID + '` for `/' + cmd + '` request.' + strConsole } )
            .then( errSent => {
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
              return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
            } );
        }
        break;
      case 'errInvite':
        switch ( objError.code ) {
          case 10003://Unknown Channel
            console.log( 'Unknown channel to create invite for %s:\n\tLink: %s', guild.name, inviteChanURL );
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
                  console.error( 'Unable to send message for /' + cmd + ' request: %o', errSend );
                  botOwner.send( { content: 'Unable to send message for `/' + cmd + '` request.' + strConsole } )
                  .then( errSent => {
                    if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strInviteClosing ); }
                  } )
                  .catch( errNotSent => {
                    console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
                    if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strInviteClosing ); }
                  } );
              }
            } );
            break;
          default:
            console.error( 'Unable to create an invite for %s:\n%o', inviteGuild.name, objError );
            botOwner.send( { content: 'Unable to create an invite to ' + inviteGuild.name + ' for `/' + cmd + '` request.' + strConsole } )
            .then( errSent => {
              if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strInviteClosing ); }
            } )
            .catch( errNotSent => {
              console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
              if ( doInviteLogs ) { chanInviteError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strInviteClosing ); }
            } );
        }
        break;
      case 'errReact':
        switch ( objError.code ) {
          case 10014://Reaction invalid
            if ( doLogs ) { chanError.send( 'Failed to react to message https://discord.com/channels/' + guild.id + '/' + channel.id + '/' + msgID + ' with `' + rawReaction + '`.' + strClosing ); }
            return { content: '`' + rawReaction + '` is not a valid `reaction` to react with. Please try again; the emoji picker is helpful in getting valid reactions.' };
          default:
            console.error( '%s: Reaction to #%o with %o (%s) failed:\n\tMsg: %s\n\tErr: %o', objError.code, msgID, emoji, rawReaction, objError.message, objError );
            botOwner.send( 'Reaction to https://discord.com/channels/' + guild.id + '/' + channel.id + '/' + msgID + ' with `' + rawReaction + '` failed.' + strConsole )
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
      case 'getBotDB':
        console.error( 'Unable to find botConfig:\n%o', objError );
        botOwner.send( 'Encountered an error attempting to find botConfig.' + strConsole )
        .catch( errNotSent => { console.error( 'Error attempting to DM you about the above error: %o', errNotSent ); } );
        break;
      case 'getGuildDB':
        console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in %s.js:\n%s', guild.name, guild.id, cmd, objError.stack );
        botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in ' + cmd + '.' + strConsole )
        .catch( errNotSent => { console.error( 'Error attempting to DM you about the above error: %o', errNotSent ); } );
        break;
      case 'logLogs':
        let logChan = ( chanType === 'chat' ? chanChat : ( chanType === 'error' ? chanError : chanDefault ) );
        console.error( 'Unable to log to %s channel: %s#%s\n%o', chanType, guild.name, logChan.name, errLog );
        botOwner.send( { content: 'Unable to log to ' + chanType + ' channel <#' + logChan.id + '>.' + strConsole } )
        .then( errSent => { return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified } } )
        .catch( errNotSent => {
          console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
          if ( doLogs && chanType != 'error' ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
          return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
        } );
        break;
      case 'modifyDB':
        switch ( modType ) {
          case 'clear':
            console.error( 'Error attempting to clear my %s for %s: %o', clearLists, author.displayName, guild.name, objError );
            botOwner.send( 'Error attempting to clear my ' + clearLists + ' with `/system clear`.' + strConsole )
            .then( sentOwner => {
              return { content: 'Error attempting to clear my ' + clearLists + ' for this server!' + strNotified };
            } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return { content: 'Error attempting to clear my ' + clearLists + ' for this server!' + strLogged };
            } );
            break;
          case 'add':
          case 'remove':
            const fromInTo = ( modType === 'remove' ? 'from the database ' + ( modMod ? 'bot moderator list' : ( modBlack ? 'black' : 'white' ) + 'list' ) : ( modMod ? 'to' : 'in' ) + ' the database' );
            const doList = ( modMod ? modType : ( modType === 'add' ? '' : 'de-' ) ) + ( modMod ? ' a moderator' : ( modBlack ? 'blacklist' : 'whitelist' ) );
            const modTarget = ( modMod || modBlack || modWhite );
            console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to ${doList} ${modTarget} (${botUsers.get( modTarget ).displayName}) ${fromInTo}:\n${objError}` ) );
            return { content: 'Encountered an error attempting to ' + doList + ' <@' + modTarget + '> ' + fromInTo + '.' + strConsole };
            break;
          case 'reset':
            console.error( chalk.bold.red.bgYellowBright( 'Encountered an error attempting to reset configuration with `/system reset`:\n%o' ), objError );
            return { content: 'Encountered an error attempting to reset configuration with `/system reset`.' + strConsole };
            break;
          case 'set':
            console.error( chalk.bold.red.bgYellowBright( 'Encountered an error attempting to modify bot configuration in my database:\n%o' ), objError );
            return { content: 'Encountered an error attempting to modify bot configuration in my database.' + strConsole };
            break;
        }
        break;
      case 'setPresence':
        break;
      case 'tryFunction':
        console.error( 'Error in %s.js: %s', cmd, objError.stack );
        break;
      default:
        console.error( 'Unknown type (%s) to resolve error for: %o', myTask, objError );
        botOwner.send( { content: 'Unknown type (' + myTask + ') to resolve error for.' + strConsole } )
        .then( errSent => {
          if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strNotified + strClosing ); }
          return { content: 'Encounted an error with your `/' + cmd + '` request.' + strNotified };
        } )
        .catch( errNotSent => {
          console.error( 'Error attempting to DM you about the above error: %o', errNotSent );
          if ( doLogs ) { chanError.send( 'Encounted an error with a `/' + cmd + '` request.' + strLogged + strClosing ); }
          return { content: 'Encounted an error with your `/' + cmd + '` request.' + strLogged };
        } );
    }
  } catch ( errHandleErrors ) { console.error( 'Error in errorHandler.js: %s', errHandleErrors.stack ); }
};