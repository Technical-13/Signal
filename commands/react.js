module.exports = {
	name: "react",
	description: "What reaction do you want me to use on which message?",
	cooldown: 1000,
	async run( interaction, client ) {
    await interaction.deferReply( { ephemeral: true } );
    const myOwner = client.users.cache.get( process.env.OWNERID );
    const { channel, options } = interaction;
    const msgID = interaction.options.getString( 'message-id' );
/* Should be checking if bot is blocked by the user */
    const theReaction = interaction.options.getString( 'reaction' );
    const strAuthorTag = interaction.user.tag;
    
    var myReaction = theReaction;
    var rxp = /<:(.*)?:([\d]*)>/;
		if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
    else { myReaction = encodeURI( myReaction );  }

    channel.messages.fetch( msgID ).then( async message => {
      await message.react( myReaction ).then( reacted => {
        interaction.editReply( { content: 'Reacted!' } );
        console.log( '%o requested me to react to %o in %o#%s with %o (%s)',
          strAuthorTag, message.author.tag, message.guild.name, message.channel.name, myReaction, theReaction
        );
      } ).catch( noReaction => {
        switch ( noReaction.code ) {
          case 10014://
            interaction.editReply( { content: '`' + myReaction + '` is not a valid `reaction` to react with. Please try again; emoji picker is helpful in getting valid reactions.' } );
          default:
            myOwner.send( 'Error attempting to react with ' + theReaction + ' to message :ID:`' + msgID +
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
          myOwner.send( 'Error attempting to react with ' + theReaction + ' to message :ID:`' + msgID +
            '` as requested by: <@' + interaction.user.id + '>' + ' from `' + interaction.guild.name +
            '`<#' + interaction.channel.id + '>:\n```\n' + noMessage + '\n```')
            .then( notified => { interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + myOwner.id + '>, has been notified.' } ); } )
            .catch( notNotified => { interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + myOwner.id + '>.' } ); } );
          console.error( '%o requested me to react with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
            strAuthorTag, myReaction, theReaction, msgID, noMessage.code, noMessage.message, noMessage
          );
      }
    } );
	}
}