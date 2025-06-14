const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getBotConfig = require( '../../functions/getBotDB.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'info', name: 'bot', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Bot information and message management.',
  description_localizations: l10n.description,
  options: null,
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM, InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    try {
      await interaction.deferReply( { ephemeral: true } );// ephemeral: interaction.inGuild()
      const { channel, guild, locale, options, user: author } = interaction;
      const useLang = ( locale ?? 'en-US' );
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      return interaction.editReply( { content: r6e.soon[ useLang ] } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};