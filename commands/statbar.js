module.exports = {
	name: "statbar",
	description: "Show P-GC statbar for user",
	cooldown: 3000,
	async run( interaction, client ) {
    const today = ( new Date() );
    const intYear = today.getFullYear();
    const intMonthNow = today.getMonth();
    const intMonth = ( intMonthNow < 9 ? '0' + ( intMonthNow + 1 ).toString() : ( intMonthNow + 1 ).toString() );
    const intDayNow = today.getDate();
    const intDay = ( intDayNow <= 9 ? '0' + intDayNow.toString() : intDayNow.toString() );

    // Figure what username to use
    const objGuildMembers = interaction.guild.members.cache;
    
    const strAuthorName = interaction.user.username;    
    const strAuthorNick = objGuildMembers.get( interaction.user.id ).nickname;
    const useAuthorName = ( strAuthorNick ?? strAuthorName );
    
    const objInputUser = ( interaction.options.getUser( 'discord-user' ) ?? null );
    var useUserName;
    
    if ( objInputUser != null ) {
      const strUserName = objInputUser.username;
      const strUserNick = interaction.guild.members.cache.get( objInputUser.id ).nickname;
      useUserName = ( strUserNick ?? strUserName );
    }
    
    const strInputName = ( interaction.options.getString( 'gc-name' ) || null );
    
    const useName = encodeURI( strInputName ?? ( useUserName ?? useAuthorName ) ).replace( '&', '%26' );

    // Send result
		interaction.reply( { content: 'https://cdn2.project-gc.com/statbar.php?includeLabcaches&quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + '&user=' + useName } );
	}
}