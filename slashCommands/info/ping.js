const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const parse = require( '../../functions/parser.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const cmdData = { group: 'info', name: 'ping' };
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/' + cmdData.group + '/' + cmdData.name + '.js' );
const getResponses = async ( interaction ) => {
  const { guild, locale, user } = interaction;
  const { langs, responses } = await getI18n( command );
  const guildLang = ( langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
  const useLang = ( langs.indexOf( locale ) === -1 ? guildLang : locale );
  const results = {}; results[ useLang ] = {}; results[ guildLang ] = {};
  const arrResponses = Object.entries( responses );
  arrResponses.forEach( resp => {
    results[ useLang ][ resp[ 0 ] ] = await parse( resp[ 1 ][ useLang ], { author: user, guild: guild } );
    results[ guildLang ][ resp[ 0 ] ] = await parse( resp[ 1 ][ guildLang ], { author: user, guild: guild } );
    results[ 'en-US' ][ resp[ 0 ] ] = await parse( resp[ 1 ][ 'en-US' ], { author: user, guild: guild } );
  } );
  return results;
}

module.exports = {
  name: cmdData.name,
  group: cmdData.group,
  description: 'Check bot\'s ping.',// No description for ApplicationCommandType.User commands
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const command = client.slashCommands.get( cmdData.name );
    try {
      const { guild, locale } = interaction;
      const guildLang = ( langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
      const useLang = ( langs.indexOf( locale ) === -1 ? guildLang : locale );
      const useResponses = getResponses( interaction );
      interaction.reply( { content: await parse( useResponses[ useLang ].pong ), ephemeral: interaction.inGuild() } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};