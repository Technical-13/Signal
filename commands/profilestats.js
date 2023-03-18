module.exports = {
	name: "profilestats",
	description: "Show link to Project-GC ProfileStats page for user",
	cooldown: 300000,
	async run( interaction, client ) {
    const myOwner = client.users.cache.get( process.env.OWNERID );

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
    
    const useName = ( strInputName ?? ( useUserName ?? useAuthorName ) );
    const encName = encodeURI( useName ).replace( '&', '%26' );

    // Send result
		interaction.reply( { content: 'ProfileStats link for: ' + ( objInputUser == null ? useName : '<@' +  objInputUser + '>' ) + '\n<https://project-gc.com/Profile/ProfileStats?profile_name=' + encName + '>' } );
	}
}