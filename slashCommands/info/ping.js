const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'info', name: 'ping', type: 'slashCommands' };
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );
const localizations = getI18n( modData );
/* I don't think I need this anymore, but I'll leave it for now in case.
const getResponses = async ( interaction ) => {
  const { guild, locale, user } = interaction;
  const { langs, responses } = await getI18n( command );
  const guildLang = ( langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
  const useLang = ( langs.indexOf( locale ) === -1 ? guildLang : locale );
  const results = {}; results[ useLang ] = {}; results[ guildLang ] = {};
  const arrResponses = Object.entries( responses );
  arrResponses.forEach( async resp => {
    results[ useLang ][ resp[ 0 ] ] = await parse( resp[ 1 ][ useLang ], { author: user, guild: guild } );
    results[ guildLang ][ resp[ 0 ] ] = await parse( resp[ 1 ][ guildLang ], { author: user, guild: guild } );
    results[ 'en-US' ][ resp[ 0 ] ] = await parse( resp[ 1 ][ 'en-US' ], { author: user, guild: guild } );
  } );
  return results;
}//*/

module.exports = {
  name: modData.name,
  name_localization: localizations.name,
  group: modData.group,
  description: 'Check bot\'s ping.',// No description for ApplicationCommandType.User commands
  description_localization: localizations.description,
  options: null,
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM , InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const { langs } = await getI18n( modData );
    try {
      const { guild, locale } = interaction;
      interaction.reply( { content: 'TBD', ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};