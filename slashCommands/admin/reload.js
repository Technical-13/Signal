const { ApplicationCommandType, InteractionContextType, SlashCommandBuilder } = require('discord.js');
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'admin', name: 'reload', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Reloads commands.',
  description_localizations: l10n.description,
  options: [
    { type: 3, required: true,
      name: 'command', name_localizations: l10n.command.name,
      description: 'The name of the command to reload.',
      description_localizations: l10n.command.description
    },
    { type: 3, name: 'type', name_localizations: l10n.type.name,
      description: 'The type of the command to reload.',
      description_localizations: l10n.type.description,
      choices: [
        { value: 'slash' name: '/slash commands (default)', name_localizations: l10n.type.choices[ 0 ] },
        { value: 'prefix' name: '§prefix commands', name_localizations: l10n.type.choices[ 1 ] }
      ]
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM, InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    await interaction.deferReply( { ephemeral: true } );
    const { guild, locale, options, user: author } = interaction;
      const useLang = ( locale ?? 'en-US' );
    const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
    const cmdType = ( !options.getString( 'type' ) ? 'slash' : options.getString( 'type' ).toLowerCase() );
    const commandName = options.getString( 'command', true ).toLowerCase();
		try {
      if ( isBotMod && !isBotOwner ) { return interaction.editReply( r6e.ownerOnly[ useLang ] ); }
      else if ( !isBotOwner ) { return interaction.editReply( r6e.modOnly[ useLang ] ); }
      else if ( cmdType === 'prefix' ) {
        const command = client.commands.get( commandName );
        if ( !command ) { return interaction.editReply( r6e.noCommand[ useLang ] + ' `' + commandName + '`!' ); }

        delete require.cache[ require.resolve( '../../commands/' + command.group + '/' + command.name + '.js' ) ];

        const newCommand = require( '../../commands/' + command.group + '/' + command.name + '.js' );
        client.commands.set( newCommand.name, newCommand );
      }
      else {
        const command = client.slashCommands.get( commandName );
        if ( !command ) { return interaction.editReply( r6e.noSlashCommand[ useLang ] + ' `' + commandName + '`!' ); }

        delete require.cache[ require.resolve( '../' + command.group + '/' + command.name + '.js' ) ];

        const newCommand = require( '../' + command.group + '/' + command.name + '.js' );
        client.slashCommands.set( newCommand.name, newCommand );
      }
      interaction.editReply( r6e.command[ useLang ] + ' `' + ( cmdType == 'slash' ? '/' : '§' ) + commandName + '` ' + r6e.wasReloaded[ useLang ] );
		}
    catch ( errObject ) {
      interaction.editReply( r6e.errReload[ useLang ] + ' `' + ( cmdType == 'slash' ? '/' : '§' ) + commandName + '`:\n`' + errObject.message + '`' );
      console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack );
		}
	},
};