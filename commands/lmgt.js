module.exports = {
	name: "lmgt",
	description: "Let Me Google That",
	cooldown: 1000,
	async run( interaction, client ) {
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );
    const cmdInputUser = interaction.options.getUser( 'target' );
    const tagUser = ( cmdInputUser ? '<@' + cmdInputUser.id + '>: ' : '' );
    const strInputQuery = interaction.options.getString( 'query' );
    const q = encodeURI( strInputQuery.replace( / /g, '+' ) );

    interaction.reply( { content: tagUser + '<https://letmegooglethat.com/?q=' + q + '>' } );
	}
}