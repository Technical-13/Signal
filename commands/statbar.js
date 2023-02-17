module.exports = {
	name: "statbar", // Command name
	description: "Show P-GC statbar for user", // Set the description
	cooldown: 3000, // Set a cooldown of 3 seconds
	async run( interaction, client ) { // Function to run on call
    const today = ( new Date() );
    const intYear = today.getFullYear();
    const intMonthNow = today.getMonth();
    const intMonth = ( intMonthNow < 9 ? '0' + ( intMonthNow + 1 ).toString() : ( intMonthNow + 1 ).toString() );
    const intDayNow = today.getDate();
    const intDay = ( intDayNow <= 9 ? '0' + intDayNow.toString() : intDayNow.toString() );

    // Figure what username to use
    const strAuthorNick = interaction.guild.members.cache.get( interaction.user.id ).nickname;
    const strInputName = interaction.options.getString( 'user' );
    const useName = encodeURI( strInputName ?? strAuthorNick ).replace( '&', '%26' );

    // Send result
		interaction.reply( { content: 'https://cdn2.project-gc.com/statbar.php?includeLabcaches&quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + '&user=' + useName } );
	}
}