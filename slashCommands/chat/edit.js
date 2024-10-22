const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errHandler = require( '../../functions/errorHandler.js' );

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
    const { channel, guild, options, user: author } = interaction;
    const { isBotMod, isServerBooster, hasMentionEveryone, isWhitelisted, content } = await userPerms( author, guild );
    if ( content ) { return interaction.editReply( { content: content } ); }

    const canSpeak = ( isBotMod || isWhitelisted || isServerBooster ? true : false );
    const msgID = options.getString( 'message-id' );
    if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
    const mySaying = options.getString( 'saying' );
    const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
    const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
    const strAuthorTag = author.tag;
    
    const { chanChat, doLogs, strClosing } = await logChans( guild );

    if ( mySaying ) {
      if ( canSpeak && ( !mentionsEveryone || hasMentionEveryone ) ) {
        channel.messages.fetch( msgID ).then( async message => {
          let oldContent = message.content;
          await message.edit( { content: mySaying } ).then( edited => {
            if ( doLogs ) {
              chanChat.send( { content:
                'I edited what I said in https://discord.com/channels/' + edited.guild.id + '/' + edited.channel.id + '/' + edited.id + ' at <@' + author.id + '>\'s request from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing
              } )
              .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', guild: guild, type: 'logLogs' } ) ); } );
            }
            return interaction.editReply( { content: 'I edited my message for you!' } );
          } )
          .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'edit', guild: guild, type: 'errSend' } ) ); } );
        } )
        .catch( async errFetch => { return interaction.editReply( await errHandler( errFetch, { command: 'edit', msgID: msgID, type: 'errFetch' } ) ); } );
      }
      else if ( mentionsEveryone && !hasMentionEveryone ) {
        if ( doLogs ) {
          chanChat.send( { content: '<@' + author.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to change my message from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', guild: guild, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You have no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>!' } );
      }
      else {
        if ( doLogs ) {
          chanChat.send( { content:  '<@' + author.id + '> has no permission to use my `/edit` command from <#' + channel.id + '>. They tried to get me to change my message from:\n```\n' + oldContent + '\n```\nTo:\n```\n' + edited.content + '\n```' + strClosing } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'edit', guild: guild, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You have no permission to use my `/edit` command in <#' + channel.id + '>!' } );
      }
    }
    else { interaction.editReply( { content: 'I don\'t know what to say.' } ); }
  }
};