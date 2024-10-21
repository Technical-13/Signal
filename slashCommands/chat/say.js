const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'say',
  name_localizations: {
    de: 'sagen',
    fr: 'dire',
    fi: 'sano',
    pl: 'mowić',
    'sv-SE': 'säga' },
  description: 'Make bot speak.',
  options: [ {
    name: 'saying',
    description: 'What do you want me to say?',
    required: true,
    type: 3
  }, {
    name: 'channel',
    description: 'Where do you want me to say it? (default: current channel)',
    type: 7
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { botOwner, isBotMod, guildOwner, isServerBooster, hasMentionEveryone, isWhitelisted, content } = await userPerms( author, guild, true );
    if ( content ) { return interaction.editReply( { content: content } ); }

    const canSpeak = ( isBotMod || isWhitelisted || isServerBooster ? true : false );    
    const speakChannel = options.getChannel( 'channel' ) || channel;
    const mySaying = options.getString( 'saying' );
    const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
    const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
    
    const { chanChat, doLogs, strClosing } = await logChans( guild );

    if ( mySaying ) {
      if ( canSpeak && ( !mentionsEveryone || hasMentionEveryone ) ) {
        speakChannel.send( { content: mySaying } ).then( async spoke => {
          if ( doLogs ) {
            chanChat.send( { content: 'I spoke in https://discord.com/channels/' + spoke.guild.id + '/' + spoke.channel.id + '/' + spoke.id + ' at <@' + author.id + '>\'s request:\n```' + mySaying + '\n```' + strClosing } )
            .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'say', guild: guild, type: 'logLogs' } ) ); } );
          }
          return interaction.editReply( { content: 'I said the thing!' } );
        } )
        .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'say', guild: guild, type: 'errSend' } ) ); } );
      }
      else if ( mentionsEveryone && !hasMentionEveryone ) {
        if ( doLogs ) {
          chanChat.send( { content: '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + strClosing } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'say', guild: guild, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You have no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>!' } );
      }
      else {
        if ( doLogs ) {
          chanChat.send( { content: '<@' + author.id + '> has no permission to use my `/say` command from <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + strClosing } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'say', guild: guild, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You have no permission to use my `/say` command in <#' + channel.id + '>!' } );
      }
    }
    else { return interaction.editReply( { content: 'I don\'t know what to say.' } ); }
  }
};