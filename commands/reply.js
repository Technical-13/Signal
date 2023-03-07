module.exports = {
	name: "reply",
	description: "What do you want me to say in response?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
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
    } ).catch( async noMessage => {
      await interaction.editReply( { content: 'Unable to find message to repyly to.' } );
      await objGuildOwner.send( '<@' + interaction.user.id + '> requested me to reply to a message I couldn\'t find (#' + msgID + '):\n```\n' + myResponse + '\n```' );
      console.log( '%o requested me to reply to a message I couldn\'t find (#%o):\n\t%o',
        strAuthorTag, msgID, myResponse
      );
    } );
	}
}