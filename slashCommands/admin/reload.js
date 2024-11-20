const { ApplicationCommandType, InteractionContextType, SlashCommandBuilder } = require('discord.js');
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/admin/reload.js' );

module.exports = {
  name: 'reload',
  group: 'admin',
  description: 'Reloads a slashCommand.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild, InteractionContextType.BotDM ],
  options: [
    { type: 3, name: 'command', description: 'The name of the command to reload.', required: true },
    { type: 3, name: 'type', description: 'The type of the command to reload.', choices: [
      { name: '/slash commands (default)', value: 'slash' },
      { name: '§prefix commands', value: 'prefix' }
    ] }
  ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
		try {
      const { guild, options, user: author } = interaction;
      const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
      const cmdType = options.getString( 'type' ).toLowerCase() ?? 'slash';
      const commandName = options.getString( 'command', true ).toLowerCase();

      if ( isBotMod && !isBotOwner ) { return interaction.editReply( 'This is currently an **owner only** command.  Please talk to <@' + botOwner.id + '> if you need assistance.' ); }
      else if ( !isBotOwner ) { return interaction.editReply( 'This is an **owner only** command.' ); }
      else if ( cmdType === 'prefix' ) {
        const command = client.commands.get( commandName );
        if ( !command ) { return interaction.editReply( 'I have no command named `' + commandName + '`!' ); }

        delete require.cache[ require.resolve( '../../commands/' + command.group + '/' + command.name + '.js' ) ];

        const newCommand = require( '../../commands/' + command.group + '/' + command.name + '.js' );
        client.commands.set( newCommand.name, newCommand );
      }
      else {
        const command = client.slashCommands.get( commandName );
        if ( !command ) { return interaction.editReply( 'I have no slashCommand named `' + commandName + '`!' ); }

        delete require.cache[ require.resolve( '../' + command.group + '/' + command.name + '.js' ) ];

        const newCommand = require( '../' + command.group + '/' + command.name + '.js' );
        client.slashCommands.set( newCommand.name, newCommand );
      }
      interaction.editReply( 'Command `' + newCommand.name + '` was reloaded!' );
		}
    catch ( errObject ) {
      interaction.editReply( 'There was an error while reloading command `' + command.name + '`:\n`' + errObject.message + '`' );
      console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack );
		}
	},
};