const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'info', name: 'ping', type: 'slashCommands' };
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );
const l10n = getI18n( modData );

module.exports = {
  name: modData.name,
  name_localizations: l10n.name,
  group: modData.group,
  description: 'Check bot\'s ping.',// No description for ApplicationCommandType.User commands
  description_localizations: l10n.description,
  options: null,
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM , InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      const { locale } = interaction;
      const useLang = ( locale ?? 'en-US' );
      interaction.reply( { content: l10n.responses.pong[ useLang ], ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};