module.exports = {
	name: "say",
	description: "What do you want me to say?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
    const speakChannel = interaction.options.getChannel( 'channel' ) || interaction.channel;
    const mySaying = interaction.options.getString( 'saying' );
    const strAuthorTag = interaction.user.tag;
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );

    if ( mySaying ) {      
      return speakChannel.send( mySaying ).then( async spoke => {
        await interaction.editReply( { content: 'Said the thing!' } );
        await objGuildOwner.send( '<@' + interaction.user.id + '> requested me to speak in `' + spoke.guild.name + '`<#' + spoke.channel.id + '>:\n```\n' + mySaying + '\n```' );
        console.log( '%o requested me to speak in %o#%o:\n\t%o',
          strAuthorTag, spoke.guild.name, spoke.channel.name, mySaying
        );
      } ).catch( async muted => {
        switch ( muted.code ) {
          case 50001 :
            let noChan = '<#' + speakChannel + '>';
            await objGuildOwner.send( 'Please give me permission to send to ' + noChan );
            await interaction.editReply( {
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