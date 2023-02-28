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

    channel.messages.fetch( msgID ).then( async message => {
      await message.reply( myResponse ).then( responded => {
        interaction.editReply( { content: 'Responded!' } );
        console.log( '%o requested me to reply to %o in `%o`#%o:\n\t%o',
          strAuthorTag, message.author.tag, message.guild.name, message.channel.name, myResponse
        );
      } );
    } ).catch( noMessage => {
      interaction.editReply( { content: 'Unable to find message to repyly to.' } );
      console.log( '%o requested me to reply to a message I couldn\'t find (#%o):\n\t%o',
        strAuthorTag, msgID, myResponse
      );
    } );
	}
}