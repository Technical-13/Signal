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
		interaction.reply( { content: 'https://cdn2.project-gc.com/statbar.php?includeLabcaches&quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + '&user=' + encodeURI( 'Technical_13' ).replace( '&', '%26' ) } );
	}
}