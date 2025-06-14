const { ApplicationCommandType, InteractionContextType, SlashCommandBuilder } = require('discord.js');
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'admin', name: 'load', type: 'slashCommands' };
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );
const l10n = getI18n( modData );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Reloads commands.',
  description_localizations: l10n.description,
  options: [
    { type: 3, required: true,
      name: 'command', name_localizations: l10n.options.command.name,
      description: 'The name of the command to reload.',
      description_localizations: l10n.options.command.description
    },
    { type: 3, name: 'type', name_localizations: l10n.options.type.name,
      description: 'The type of the command to reload.',
      description_localizations: l10n.options.type.description,
      choices: [
        { value: 'slash', name: '/slash commands (default)', name_localizations: l10n..optionstype.choices[ 0 ] },
        { value: 'prefix', name: '§prefix commands', name_localizations: l10n.options.type.choices[ 1 ] }
      ]
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM, InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    await interaction.deferReply( { ephemeral: true } );
    const { guild, options, user: author } = interaction;
    const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
    const cmdType = ( !options.getString( 'type' ) ? 'slash' : options.getString( 'type' ).toLowerCase() );
    const commandName = options.getString( 'command', true ).toLowerCase();
		try {
      const { guild, options, user: author } = interaction;
      const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
      if ( isBotMod && !isBotOwner ) { return interaction.editReply( r6e.ownerOnly[ useLang ] ); }
      else if ( !isBotOwner ) { return interaction.editReply( r6e.modOnly[ useLang ] ); }
      var isRe = false;
      var command = client[ ( cmdType == 'prefix' ? 'commands' : 'slashCommands' ) ].get( commandName );
      if ( !command ) {
        fs.readdirSync( cmdType == 'prefix' ? './commands/' : './' ).forEach( async dir => {
/* TRON */console.log('Looking for /%s/%s.js',dir,commandName);/* TROFF */

          if ( fs.readdirSync( ( cmdType == 'prefix' ? './commands/' : './slashCommands/' ) + dir + '/' ).filter( file => {/* TRON */console.log( 'file: %o', file );/* TROFF */return file == commandName + '.js'} ).length !== 1 ) {
            command = { group: dir, name: commandName };
          }
        } );
        if ( !command ) { return interaction.editReply( 'I have no ' + ( cmdType == 'prefix' ? 'command' : 'slashCommand' ) + ' named `' + commandName + '`!' ); }
      }
      else {
        isRe = true;
        delete require.cache[ require.resolve( ( cmdType == 'prefix' ? './commands/' : './slashCommands/' ) + command.group + '/' + command.name + '.js' ) ];
      }
      const newCommand = require( ( cmdType == 'prefix' ? './commands/' : './slashCommands/' ) + command.group + '/' + command.name + '.js' );
      client[ ( cmdType == 'prefix' ? 'commands' : 'slashCommands' ) ].set( newCommand.name, newCommand );

      interaction.editReply( r6e.command[ useLang ] + ' `' + ( cmdType == 'slash' ? '/' : '§' ) + newCommand.name + '` was ' + ( !isRe ? '' : 're' ) + 'loaded!' );
		}
    catch ( errObject ) {
      interaction.editReply( r6e.errReload[ useLang ] + ' `' + ( cmdType == 'slash' ? '/' : '§' ) + commandName + '`:\n`' + errObject.message + '`' );
      console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack );
		}
	},
};