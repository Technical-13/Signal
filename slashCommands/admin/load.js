const { ApplicationCommandType, InteractionContextType, SlashCommandBuilder } = require('discord.js');
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/admin/load.js' );

module.exports = {
  name: 'load',
  group: 'admin',
  description: 'Loads commands.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild, InteractionContextType.BotDM ],
  options: [
    { type: 3, name: 'command', description: 'The name of the command to load.', required: true },
    { type: 3, name: 'type', description: 'The type of the command to load.', choices: [
      { name: '`/slash commands` (default)', value: 'slash' },
      { name: '`§prefix commands`', value: 'prefix' }
    ] }
  ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { guild, options, user: author } = interaction;
    const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
    const cmdType = ( !options.getString( 'type' ) ? 'slash' : options.getString( 'type' ).toLowerCase() );
    const commandName = options.getString( 'command', true ).toLowerCase();
		try {
      const { guild, options, user: author } = interaction;
      const { botOwner, isBotOwner, isBotMod } = await userPerms( author, guild );
      if ( isBotMod && !isBotOwner ) { return interaction.editReply( 'This is currently an **owner only** command.  Please talk to <@' + botOwner.id + '> if you need assistance.' ); }
      else if ( !isBotOwner ) { return interaction.editReply( 'This is an **owner only** command.' ); }
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

      interaction.editReply( 'Command `' + ( cmdType == 'slash' ? '/' : '§' ) + newCommand.name + '` was ' + ( !isRe ? '' : 're' ) + 'loaded!' );
		}
    catch ( errObject ) {
      interaction.editReply( 'There was an error loading command `' + ( cmdType == 'slash' ? '/' : '§' ) + commandName + '`:\n`' + errObject.message + '`' );
      console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack );
		}
	},
};