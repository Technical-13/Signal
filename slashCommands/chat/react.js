const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/chat/react.js' );

module.exports = {
  name: 'react',
  group: 'chat',
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
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const msgID = options.getString( 'message-id' );
      if ( !( /[\d]{18,19}/.test( msgID ) ) ) { return interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); }
      const theReaction = options.getString( 'reaction' );
      const strAuthorTag = author.tag;

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      var myReaction = theReaction;
      var rxp = /<:(.*)?:([\d]*)>/;
      if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
      else { myReaction = encodeURI( myReaction ); }

      channel.messages.fetch( msgID ).then( async message => {
        let { author: msgAuthor, channel: msgChan, guild: msgGuild } = message;
        await message.react( myReaction ).then( reacted => {
          if ( doLogs ) {
            chanChat.send( 'I reacted to https://discord.com/channels/' + msgGuild.id + '/' + msgChan.id + '/' + message.id + ' by <@' + msgAuthor.id + '> with ' + theReaction + ' at <@' + author.id + '>\'s request' + strClosing )
            .catch( async noLogChan => { interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'react', channel: channel, type: 'logLogs' } ) ); } );
          }
          return interaction.editReply( { content: 'Reacted!' } );
        } ).catch( async errReact => { interaction.editReply( await errHandler( errReact, { channel: msgChan, command: 'react', guild: msgGuild, msgID: msgID, rawReaction: theReaction, reaction: myReaction, type: 'errReact' } ) ); } );
      } )
      .catch( async errFetch => { interaction.editReply( await errHandler( errFetch, { command: 'react', msgID: msgID, type: 'errFetch' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};