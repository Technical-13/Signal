module.exports = {
	name: "say",
	description: "What do you want me to say?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
    const speakChannel = interaction.options.getChannel( 'channel' ) || interaction.channel;
    const mySaying = interaction.options.getString( 'saying' );

    if ( mySaying ) {      
      return speakChannel.send( mySaying ).then( spoke => {
          interaction.editReply( { content: 'Said the thing!' } );                    } ).catch( muted => {
          switch ( muted.code ) {
            case 50001 :
              let noChan = '<#' + speakChannel + '>';
              interaction.editReply( {
                content: 'I do not have permission to send messages in ' + noChan
              } );
              break;
            default:
              console.error( 'Unable to speak: %o', muted );
              interaction.editReply( { content: 'Couldn\'t say the thing!' } );
          }
        } );
    }
    console.error( 'mySaying: %o', mySaying );
    interaction.editReply( { content: 'I don\'t know what to say. :(' } );
	}
}