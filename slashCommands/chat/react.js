const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'react',
  name_localizations: {
    de: 'reagieren',
    fr: 'réagir',
    fi: 'reagoi',
    pl: 'reagować',
    'sv-SE': 'reagera' },
  description: 'What reaction do you want me to use on which message?',
  options: [ {
    name: 'message-id',
    description: 'Paste message ID here:',
    required: true,
    type: 3
  }, {
    name: 'reaction',
    description: 'How do you want me to react?',
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
    const { botOwner, isBotMod, isBlacklisted, isGlobalWhitelisted, guildOwner, isGuildBlacklisted } = await userPerms( client, author, guild );
    if ( isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      return message.reply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server.' : '.' ) + '!  Please contact <@' + contact + '> to resolve the situation.' } );
    }
    else if ( isBotMod && isGuildBlacklisted ) {
      author.send( 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '/' + channel.id + '! Use `/config remove` to remove yourself from the blacklist.' );
    }

    const msgID = options.getString( 'message-id' );
    if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
    const theReaction = options.getString( 'reaction' );
    const strAuthorTag = author.tag;
    var logChan = guildOwner;
    var logErrorChan = guildOwner;

    var myReaction = theReaction;
    var rxp = /<:(.*)?:([\d]*)>/;
    if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
    else { myReaction = encodeURI( myReaction ); }

    guildConfigDB.findOne( { Guild: guild.id } ).then( async data => {
      if ( data ) {
        if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); }
        if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
      }
    let setupPlease = ( logChan == guildOwner ? '. Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '.\n----' );
      channel.messages.fetch( msgID ).then( async message => {
        await message.react( myReaction ).then( reacted => {
          interaction.editReply( { content: 'Reacted!' } );
          logChan.send( 'I reacted to https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + ' by <@' + message.author.id + '> with ' + theReaction + ' at <@' + author.id + '>\'s request' + setupPlease )
            .catch( noLogChan => { console.error( 'logChan.send error in react.js:\n%o', noLogChan ) } );
        } ).catch( noReaction => {
          switch ( noReaction.code ) {
            case 10014://
              console.error( '10014: %o', noReaction.message );
              interaction.editReply( { content: '`' + myReaction + '` is not a valid `reaction` to react with. Please try again; emoji picker is helpful in getting valid reactions.' } );
            default:
              botOwner.send( 'Error attempting to react with ' + theReaction +
                      ' to https://discord.com/channels/' + guild.id + '/' + channel.id + '/' + msgID +
                      ' as requested by: <@' + author.id + '>:\n```\n' + noReaction + '\n```')
                .then( notified => {
                interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + botOwner.id + '>, has been notified.' } );
              } ).catch( notNotified => {
                interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + botOwner.id + '>.' } );
              } );
              console.error( '%o requested me to react with %o (%s) to a message (#%o), and I couldn\'t:\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
                      strAuthorTag, myReaction, theReaction, msgID, noReaction.code, noReaction.message, noReaction );
          }
        } );
      } ).catch( noMessage => {
        switch( noMessage.code ) {
          case 10008://Unknown Message
            interaction.editReply( { content: 'Unable to find message to react to.' } ); break;
          case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
            interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
          default:
            botOwner.send( 'Error attempting to find message 🆔`' + msgID + '` while attempting to react with ' + theReaction +
                    ' as requested by: <@' + author.id + '>' + ' from `' + guild.name +
                    '`<#' + channel.id + '>:\n```\n' + noMessage + '\n```')
              .then( notified => { interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + botOwner.id + '>, has been notified.' } ); } )
              .catch( notNotified => { interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + botOwner.id + '>.' } ); } );
            console.error( '%s requested me to react with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
                    strAuthorTag, myReaction, theReaction, msgID, noMessage.code, noMessage.message, noMessage
                   );
        }
      } );
    } ).catch( err => { console.error( 'Encountered an error running react.js from %o<#%s>:\n\t%o', err ); } );
  }
};