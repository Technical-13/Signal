module.exports = {
	name: "reply",
	description: "What do you want me to say in response?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
    const { channel, options } = interaction;
    const msgID = interaction.options.getString( 'message-id' );
    const myResponse = interaction.options.getString( 'response' );

    channel.messages.fetch( msgID ).then( message => {
      message.reply( myResponse );
      interaction.editReply( { content: 'Responded!' } );
    } ).catch( noMessage => {
      interaction.editReply( { content: 'Unable to find message to repyly to.' } );
    } );
	}
}