module.exports = {
	name: "ftf",
	description: "Tell someone how to get their FTF (First To Find) noticed on Project-GC",
	cooldown: 1000,
	async run( interaction, client ) {
    await interaction.deferReply();
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );
    const { channel, options } = interaction;
    const objAuthor = interaction.user;
    const msgID = interaction.options.getString( 'message-id' );
    const cmdInputUser = interaction.options.getUser( 'target' );
    const FTFinfo = 'here are two ways for Project-GC to detect your FTFs (**F**irst **T**o **F**inds). Either you tag your logs with one of these tags: `{*FTF*}`, `{FTF}`, or `[FTF]`. Alternatively you can add an FTF bookmark list under <https://project-gc.com/User/Settings/> that will be checked once per day. Please understand that FTF isn\'t anything offical and not everyone tags their FTFs. Therefore this list won\'t be 100% accurate.';

    if ( msgID && isNaN( msgID ) ) {
      interaction.editReply( '`' + msgID + '` is not a valid message-id.' );
    } else if ( msgID ) {
      channel.messages.fetch( msgID ).then( message => {
        interaction.deleteReply();
        message.reply( 'T' + FTFinfo );
      } ).catch( noMessage => {
        objAuthor.send( 'Unable to find message to repyly to for `\\FTF`.' );
        interaction.editReply( 'Unable to find specific message to respond to. T' + FTFinfo );
        console.error( 'Unable to find message with ID:%o\n\t%o', msgID, noMessage );
      } );
    } else if ( cmdInputUser ) {
      interaction.editReply( '<@' + cmdInputUser.id + '>, t' + FTFinfo );
    } else {
      interaction.editReply( 'T' + FTFinfo );
    }
	}
}