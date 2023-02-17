module.exports = {
	name: "badgebar", // Command name
	description: "Show P-GC badgebar for user", // Set the description
	cooldown: 3000, // Set a cooldown of 3 seconds
	async run( interaction, client ) { // Function to run on call

    // Figure what username to use
    const strAuthorNick = interaction.guild.members.cache.get( interaction.user.id ).nickname;
    const strInputName = interaction.options.getString( 'user' );
    const useName = encodeURI( strInputName ?? strAuthorNick ).replace( '&', '%26' );

    // Send result
		interaction.reply( { content: 'https://cdn2.project-gc.com/BadgeBar/' + useName + '.png' } );
	}
}