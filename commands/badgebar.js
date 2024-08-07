module.exports = {
	name: "badgebar",
	description: "Show Project-GC badgebar for user",
	cooldown: 3000,
	async run( interaction, client ) {
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );

    // Figure what username to use
    const objGuildMembers = interaction.guild.members.cache;
    
    const today = ( new Date() );
    const intYear = today.getFullYear();
    const intMonthNow = today.getMonth();
    const intMonth = ( intMonthNow < 9 ? '0' + ( intMonthNow + 1 ).toString() : ( intMonthNow + 1 ).toString() );
    const intDayNow = today.getDate();
    const intDay = ( intDayNow <= 9 ? '0' + intDayNow.toString() : intDayNow.toString() );
    
    const strAuthorName = interaction.user.username;
    const strGlobalName = interaction.user.global_name;
    const strAuthorNick = objGuildMembers.get( interaction.user.id ).nickname;
    const useAuthorName = ( ( strAuthorNick ?? strGlobalName ) ?? strAuthorName );
    
    const objInputUser = ( interaction.options.getUser( 'discord-user' ) ?? null );
    var useUserName;
    
    if ( objInputUser != null ) {
      const strUserName = objInputUser.username;
      const strUserNick = interaction.guild.members.cache.get( objInputUser.id ).nickname;
      useUserName = ( strUserNick ?? strUserName );
    }
    
    const strInputName = ( interaction.options.getString( 'gc-name' ) || null );
    
    const useName = ( strInputName ?? ( useUserName ?? useAuthorName ) );
    const encName = encodeURI( useName ).replace( '&', '%26' );

    // Send result
		interaction.reply( { content: 'BadgeBar for: ' + ( objInputUser == null ? useName : '<@' +  objInputUser + '>' ) + '\nhttps://cdn2.project-gc.com/BadgeBar/' + encName + '.png#' + intYear + '-' + intMonth + '-' + intDay } );
	}
}
