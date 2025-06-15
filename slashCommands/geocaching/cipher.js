const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'geocaching', name: 'cipher', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Cipher (de|en)coder.',
  description_localizations: l10n.description,
  options: [
    { type: 3, required: true, name: 'string', name_localizations: l10n.options.string.name,
      description: 'string to (de|en)code.',
      description_localizations: l10n.options.string.description
    },
    { type: 3, required: true, name: 'code', name_localizations: l10n.options.code.name,
      description: 'Decode or encode?',
      description_localizations: l10n.options.code.description,
      choices: [
        { value: 'decode', name: 'Decode', name_localizations: l10n.options.code.choices[ 0 ] },
        { value: 'encode', name: 'Encode', name_localizations: l10n.options.code.choices[ 1 ] }
      ]
    },
    { type: 3, name: 'use-type', name_localizations: l10n.options[ 'use-type' ].name,
      description: 'Pick a type.',
      description_localizations: l10n.options[ 'use-type' ].description,
      choices: [
        { value: 'alphabetic', name: 'Letters A-Z', name_localizations: l10n.options[ 'use-type' ].choices[ 0 ] },
        { value: 'alphanumeric', name: 'Letters A-Z & Numbers 0-9', name_localizations: l10n.options[ 'use-type' ].choices[ 1 ] },
        { value: 'numeric', name: 'Numbers 0-9', name_localizations: l10n.options[ 'use-type' ].choices[ 2 ] }
      ]
    },
    { type: 10, minValue: 1, maxValue: 10,
      name: 'numeric', name_localizations: l10n.options.numeric.name,
      description: 'Characters in the Latin alphabet. (default 5)',
      description_localizations: l10n.options.numeric.description
    },
    { type: 10, minValue: 1, maxValue: 26,
      name: 'alphabetic', name_localizations: l10n.options.alphabetic.name,
      description: 'Characters in the Latin alphabet. (default 13)',
      description_localizations: l10n.options.alphabetic.description
    },
    { type: 10, minValue: 1, maxValue: 36,
      name: 'alphanumeric', name_localizations: l10n.options.alphanumeric.name,
      description: 'Characters in the Latin alphabet. (default 18)',
      description_localizations: l10n.options.alphanumeric.description
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  devOnly: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, locale, options, user: author } = interaction;
      const useLang = ( locale ?? 'en-US' );
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      return interaction.editReply( { content: r6e.soon[ useLang ] } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};