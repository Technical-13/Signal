const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const parse = require( '../../functions/parser.js' );
const i18n = require( '../../functions/getInternationalizations.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/info/ping.js' );

module.exports = {
  name: 'ping',
  group: 'info',
  description: 'Check bot\'s ping.',// No description for ApplicationCommandType.User commands
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const command = client.slashCommands.get( 'ping' );
    try {
      const responses = i18n( command, 'en-US' ).responses;
      interaction.reply( { content: await parse( responses.pong ), ephemeral: interaction.inGuild() } );
      // interaction.reply( { content: '🏓 Pong! Latency: **' + Math.round( client.ws.ping ).toString() + 'ms**', ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};