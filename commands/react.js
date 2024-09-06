const logSchema = require( '../models/Log' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: "react",
	description: "What reaction do you want me to use on which message?",
	cooldown: 1000,
	async run( interaction, client ) {
    await interaction.deferReply( { ephemeral: true } );
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );
    const { channel, options } = interaction;
    const msgID = interaction.options.getString( 'message-id' );
/* Should be checking if bot is blocked by the user */
    const theReaction = interaction.options.getString( 'reaction' );
    const strAuthorTag = interaction.user.tag;
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );
    var logChan = objGuildOwner;
    var logErrorChan = objGuildOwner;
    
    var myReaction = theReaction;
    var rxp = /<:(.*)?:([\d]*)>/;
		if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
    else { myReaction = encodeURI( myReaction );  }
    
    logSchema.findOne( { Guild: interaction.guild.id }, async ( err, data ) => {
      if ( data ) {
        logChan = interaction.guild.channels.cache.get( data.Logs.React );
        logErrorChan = interaction.guild.channels.cache.get( data.Logs.Error );
      }
      channel.messages.fetch( msgID ).then( async message => {
        await message.react( myReaction ).then( reacted => {
          interaction.editReply( { content: 'Reacted!' } );
          let setupPlease = ( logChan == objGuildOwner ? '. Please run `/setup-log` to have these logs go to a channel in the server instead of your DMs.' : '.' );
          logChan.send( 'I reacted to <@' + message.author.id + '> in https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + ' with ' + theReaction + ' at <@' + interaction.user.id + '>\'s request' + setupPlease + '\n----' );
        } ).catch( noReaction => {
          switch ( noReaction.code ) {
            case 10014://
              console.error( '10014: %o', noReaction.message );
              interaction.editReply( { content: '`' + myReaction + '` is not a valid `reaction` to react with. Please try again; emoji picker is helpful in getting valid reactions.' } );
            default:
              myOwner.send( 'Error attempting to react with ' + theReaction + ' to message 🆔`' + msgID +
                '` as requested by: <@' + interaction.user.id + '>' + ' from `' + interaction.guild.name +
                '`<#' + interaction.channel.id + '>:\n```\n' + noReaction + '\n```')
                .then( notified => { interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + myOwner.id + '>, has been notified.' } ); } )
                .catch( notNotified => { interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + myOwner.id + '>.' } ); } );
              console.error( '%o requested me to react with %o (%s) to a message (#%o), and I couldn\'t:\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
                strAuthorTag, myReaction, theReaction, msgID, noReaction.code, noReaction.message, noReaction
              );
          }
        } );
      } ).catch( noMessage => {
        switch( noMessage.code ) {
          case 10008://Unknown Message
            interaction.editReply( { content: 'Unable to find message to react to.' } ); break;
          case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
            interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
          default:
            myOwner.send( 'Error attempting to react with ' + theReaction + ' to message 🆔`' + msgID +
              '` as requested by: <@' + interaction.user.id + '>' + ' from `' + interaction.guild.name +
              '`<#' + interaction.channel.id + '>:\n```\n' + noMessage + '\n```')
              .then( notified => { interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + myOwner.id + '>, has been notified.' } ); } )
              .catch( notNotified => { interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + myOwner.id + '>.' } ); } );
            console.error( '%o requested me to react with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
              strAuthorTag, myReaction, theReaction, msgID, noMessage.code, noMessage.message, noMessage
            );
        }
      } );
    } );
	}
}
