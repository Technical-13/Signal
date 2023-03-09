module.exports = {
	name: "reply",
	description: "What do you want me to say in response?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
    const myOwner = client.users.cache.get( process.env.OWNERID );
    const { channel, options } = interaction;
    const msgID = interaction.options.getString( 'message-id' );
    const myResponse = interaction.options.getString( 'response' );
    const strAuthorTag = interaction.user.tag;
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );

    channel.messages.fetch( msgID ).then( async message => {
      await message.reply( myResponse ).then( async responded => {
        await interaction.editReply( { content: 'Responded!' } );
        await objGuildOwner.send( '<@' + interaction.user.id + '> requested me to reply to <@' + message.author.id + '> in `' + message.guild.name + '`<#' + message.channel.id + '>:\n```\n' + myResponse + '\n```' );
        console.log( '%o requested me to reply to %o in %o#%o:\n\t%o',
          strAuthorTag, message.author.tag, message.guild.name, message.channel.name, myResponse
        );
      } );
    } ).catch( noMessage => {
      switch( noMessage.code ) {
        case 10008://Unknown Message
          interaction.editReply( { content: 'Unable to find message to reply to.' } ); break;
        case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
          interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
        default:
          myOwner.send( 'Error attempting to reply with ' + theReaction + ' to message :ID:`' + msgID +
            '` as requested by: <@' + interaction.user.id + '>' + ' from `' + interaction.guild.name +
            '`<#' + interaction.channel.id + '>:\n```\n' + noMessage + '\n```')
            .then( notified => { interaction.editReply( { content: 'Unknown Error replying to message. My owner, <@' + myOwner.id + '>, has been notified.' } ); } )
            .catch( notNotified => { interaction.editReply( { content: 'Unknown Error replying to message. Unable to notify owner, <@' + myOwner.id + '>.' } ); } );
          console.error( '%o requested me to reply with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
            strAuthorTag, myReaction, theReaction, msgID, noMessage.code, noMessage.message, noMessage
          );
      }
    } );
	}
}