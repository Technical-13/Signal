module.exports = {
	name: "lmgt", // Command name
	description: "Let Me Google That", // Set the description
	cooldown: 1000, // Set a cooldown of 1 second
	async run( interaction, client ) {
    const myOwner = client.users.cache.get( process.env.OWNERID );
    const cmdInputUser = interaction.options.getUser( 'target' );
    const tagUser = ( cmdInputUser ? '<@' + cmdInputUser.id + '>: ' : '' );
    const strInputQuery = interaction.options.getString( 'query' );
    const q = encodeURI( strInputQuery.replace( / /g, '+' ) );

    interaction.reply( { content: tagUser + '<https://letmegooglethat.com/?q=' + q + '>' } );
	}
}