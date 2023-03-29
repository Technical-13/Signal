module.exports = {
	name: "ping", // Command name
	description: "Get the bot ping", // Set the description
	cooldown: 1000, // Set a cooldown of 1 second
	async run( interaction, client ) { // Function to run on call
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );
		interaction.reply( { content: client.ws.ping.toString() + 'ms', ephemeral: interaction.inGuild() } );
	}
}