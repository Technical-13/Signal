const { ApplicationCommandType } = require( 'discord.js' );
const chalk = require( 'chalk' );

module.exports = {
  name: 'ping',
  description: "Check bot's ping.",
  type: ApplicationCommandType.ChatInput,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      interaction.reply( { content: `🏓 Pong! Latency: **` + Math.round( client.ws.ping) .toString() + 'ms**', ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './slashCommands/info/ping.js' ), errObject.stack ); }
  }
};