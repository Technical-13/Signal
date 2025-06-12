const { ApplicationCommandType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const parse = require( '../../functions/parser.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const cmdData = { group: 'geocaching', name: 'cipher' };
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/' + cmdData.group + '/' + cmdData.name + '.js' );

module.exports = {
  name: cmdData.name,
  group: cmdData.group,
  description: 'Cipher (de|en)coder.',
  type: ApplicationCommandType.ChatInput,
  options: [
    { type: 3, name: 'string', description: 'string to (de|en)code.', required: true },
    { type: 3, name: 'code', description: 'Decode or encode?', required: true,
      choices: [ { name: 'Decode', value: 'decode' }, { name: 'Encode', value: 'encode' } ] },
    { type: 3, name: 'use-type', description: 'Pick a type.',
      choices: [ { name: 'Letters A-Z', value: 'alphabetic' }, { name: 'Letters A-Z & Numbers 0-9', value: 'alphanumeric' }, { name: 'Numbers 0-9', value: 'numeric' } ] },
    { type: 10, name: 'numeric', description: 'Characters in the Latin alphabet. (default 5)', minValue: 1, maxValue: 10 },
    { type: 10, name: 'alphabetic', description: 'Characters in the Latin alphabet. (default 13)', minValue: 1, maxValue: 26 },
    { type: 10, name: 'alphanumeric', description: 'Characters in the Latin alphabet. (default 18)', minValue: 1, maxValue: 36 }
  ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const command = client.slashCommands.get( cmdData.name );
    const { langs, responses } = await getI18n( command );
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, locale, options, user: author } = interaction;
      const guildLang = ( langs.indexOf( guild.preferredLocale ) === -1 ?  'en-US' : guild.preferredLocale );
      const useLang = ( langs.indexOf( locale ) === -1 ? guildLang : locale );
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      return interaction.editReply( { content: responses.soon[ useLang ] } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};