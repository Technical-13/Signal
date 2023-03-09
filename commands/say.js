module.exports = {
	name: "say",
	description: "What do you want me to say?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
    const myOwner = client.users.cache.get( process.env.OWNERID );
    const speakChannel = interaction.options.getChannel( 'channel' ) || interaction.channel;
    const mySaying = interaction.options.getString( 'saying' );
    const strAuthorTag = interaction.user.tag;
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );

    if ( mySaying ) {      
      await speakChannel.send( mySaying ).then( async spoke => {
        await interaction.editReply( { content: 'I said the thing!' } );
        await objGuildOwner.send( '<@' + interaction.user.id + '> requested me to speak in `' + spoke.guild.name + '`<#' + spoke.channel.id + '>:\n```\n' + mySaying + '\n```' );
      } ).catch( async muted => {
        switch ( muted.code ) {
          case 50001 :
            const noChan = '<#' + speakChannel + '>';
            await objGuildOwner.send( 'Please give me permission to send to ' + noChan );
            await interaction.editReply( { content: 'I do not have permission to send messages in ' + noChan } );
            break;
          default:
            myOwner.send( 'Error attempting to speak as requested by: <@' + interaction.user.id + '>' +
              ' from `' + interaction.guild.name + '`<#' + interaction.channel.id + '>:\n```\n' + muted + '\n```')
              .then( notified => {
                interaction.editReply( { content: 'Unknown error speaking. My owner, <@' + myOwner.id + '>, has been notified.' } );
              } ).catch( notNotified => {
                interaction.editReply( { content: 'Unknown error speaking. Unable to notify my owner, <@' + myOwner.id + '>.' } );
              } );
            console.error( 'Unable to speak:\n\tCode: %o\n\tMsg: %o\n\tErr: %o', muted.code, muted.message, muted );
        }
      } );
    } else {
      console.error( 'mySaying: %o', mySaying );
      interaction.editReply( { content: 'I don\'t know what to say.' } );
    }
	}
}