const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'edit',
  name_localizations: {
    de: 'bearbeiten',
    fr: 'modifier',
    fi: 'muokata',
    pl: 'redagować',
    'sv-SE': 'redigera' },
  description: 'Edit a bot message.',
  options: [ {
    name: 'message-id',
    description: 'Paste message ID here:',
    required: true,
    type: 3
  }, {
    name: 'saying',
    description: 'What should I have said?',
    required: true,
    type: 3
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const { botOwner, isBotMod, isBlacklisted, isGlobalWhitelisted, guildOwner, isGuildBlacklisted, isServerBooster, hasMentionEveryone, isWhitelisted } = await userPerms( client, author, guild );
    if ( isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      return message.reply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server.' : '.' ) + '!  Please contact <@' + contact + '> to resolve the situation.' } );
    }
    else if ( isBotMod && isGuildBlacklisted ) {
      author.send( 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '/' + channel.id + '! Use `/config remove` to remove yourself from the blacklist.' );
    }

    const canSpeak = ( isBotMod || isWhitelisted || isServerBooster ? true : false );
    const msgID = options.getString( 'message-id' );
    if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
    const mySaying = options.getString( 'saying' );
    const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
    const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
    const strAuthorTag = author.tag;
    var logChan = guildOwner;
    var logErrorChan = guildOwner;

    if ( mySaying ) {
      let setupPlease = ( logChan == guildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );
      guildConfigDB.findOne( { Guild: guild.id } ).then( async data => {
        if ( data ) {
          if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); }
          if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
        }
        if ( canSpeak && ( !mentionsEveryone || hasMentionEveryone ) ) {
          channel.messages.fetch( msgID ).then( async message => {
            let oldContent = message.content;
            await message.edit( { content: mySaying } ).then( edited => {
              interaction.editReply( { content: 'I edited my message!' } );
              logChan.send( { content:
                'I edited what I said in https://discord.com/channels/' + edited.guild.id + '/' + edited.channel.id + '/' + edited.id + ' at <@' + author.id + '>\'s request from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```\n' + setupPlease
              } ).catch( noLogChan => { console.error( 'logChan.send error:\n%o', noLogChan ) } );
            } ).catch( async muted => {
              switch ( muted.code ) {
                case 50001 :
                  const noChan = '<#' + message.channel + '>';
                  await logErrorChan.send( 'Please give me permission to send to ' + noChan + '.\n' + setupPlease );
                  await interaction.editReply( { content: 'I do not have permission to send messages in ' + noChan + '.' } );
                  break;
                default:
                  botOwner.send( { content:
                          'Error attempting to speak as requested by: <@' + author.id + '>' +
                          ' from <#' + channel.id + '>:\n```\n' + muted + '\n```'
                           } ).then( notified => {
                    interaction.editReply( { content: 'Unknown error speaking. My owner, <@' + botOwner.id + '>, has been notified.' } );
                  } ).catch( notNotified => {
                    interaction.editReply( { content: 'Unknown error speaking. Unable to notify my owner, <@' + botOwner.id + '>.' } );
                  } );
                  console.error( 'Unable to speak:\n\tCode: %o\n\tMsg: %o\n\tErr: %o', muted.code, muted.message, muted );
              }//*/
            } );
          } ).catch( noMessage => {
            switch( noMessage.code ) {
              case 10008://Unknown Message
                interaction.editReply( { content: 'Unable to find message to reply to.' } ); break;
              case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
                interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
              default:
                botOwner.send( {
                  content: 'Error attempting to reply with ' + mySaying + ' to message :ID:`' + msgID +
                  '` as requested by: <@' + author.id + '>' + ' from `' + guild.name +
                  '`<#' + channel.id + '>:\n```\n' + noMessage + '\n```'
                } ).then( notified => {
                  interaction.editReply( {
                    content: 'Unknown Error replying to message. My owner, <@' + botOwner.id + '>, has been notified.'
                  } ); } ).catch( notNotified => {
                  interaction.editReply( {
                    content: 'Unknown Error replying to message. Unable to notify owner, <@' + botOwner.id + '>.'
                  } ); } );
                console.error( '%o requested me to reply with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o', strAuthorTag, mySaying, msgID, noMessage.code, noMessage.message, noMessage );
            }
          } );
        } else if ( mentionsEveryone && !hasMentionEveryone ) {
          logChan.send( '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + interaction.channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + setupPlease )
            .catch( noLogChan => { console.error( 'mentionsEveryone logChan.send error:\n%o', noLogChan ) } );
          interaction.editReply( {
            content: 'You don\'t have permission to get me to ' + strEveryoneHere + ' in `' +
            guild.name + '`<#' + interaction.channel.id + '>.' } );
        } else {
          logChan.send( '<@' + author.id + '> has no permission to use my `/edit` command from <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```\n' + setupPlease )
            .catch( noLogChan => { console.error( 'no permission logChan.send error:\n%o', noLogChan ) } );
          interaction.editReply( {
            content: 'You don\'t have permission to get me to speak in `' +
            guild.name + '`<#' + channel.id + '>.' } );
        }
      } ).catch( err => { console.error( 'Encountered an error running edit.js from %s:\n\t%o', guild.name, err ); } );
    } else { interaction.editReply( { content: 'I don\'t know what to say.' } ); }
  }
};