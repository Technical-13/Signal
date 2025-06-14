const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'info', name: 'ping', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Check bot\'s ping.',// No description for ApplicationCommandType.User commands
  description_localizations: l10n.description,
  options: null,
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM , InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    try {
      const { locale } = interaction;
      const useLang = ( locale ?? 'en-US' );
      interaction.reply( { content: r6e.pong[ useLang ], ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};