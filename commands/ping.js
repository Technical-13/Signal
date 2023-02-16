module.exports = {
	name: "ping", // Command name
	description: "Get the bot ping", // Set the description
	cooldown: 1000, // Set a cooldown of 1 second
	async run( interaction, client ) { // Function to run on call
		interaction.reply( { content: client.ws.ping.toString() + 'ms', ephemeral: true } ); // Respond with the ping in MS
	}
}