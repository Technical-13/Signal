const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/info/ping.js' );

module.exports = {
  name: 'Ping!',
  group: 'info',
//  description: 'Check bot\'s ping.',// No description for ApplicationCommandType.User commands
  type: ApplicationCommandType.User,
  contexts: [ InteractionContextType.Guild, InteractionContextType.BotDM ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      interaction.reply( { content: '🏓 Pong! Latency: **' + Math.round( client.ws.ping) .toString() + 'ms**', ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};