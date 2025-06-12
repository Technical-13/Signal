const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const parse = require( '../../functions/parser.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
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
      const i18n = getI18n( command );
      const { guild, locale } = interaction;
      const guildLang = ( i18n.langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
      const useLang = ( i18n.langs.indexOf( locale ) === -1 ? guildLang : locale );
      interaction.reply( { content: await parse( responses.pong[ useLang ] ), ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};