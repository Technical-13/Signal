const chalk = require( 'chalk' );
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './commands/info/help.js' );

module.exports = {
	name: 'help',
  group: 'info',
	description: 'Get the bot\'s commands',
	cooldown: 600000,
	run: async ( client, message, args ) => {
    try {
      const { author, guild } = message;
      const { isBotMod, prefix } = await userPerms( author, guild );
      const botCommands = client.commands;
      const helpEmbed = new EmbedBuilder()
        .setTitle( 'Commands available to ' + message.guild.members.cache.get( message.author.id ).displayName )
        .setColor( '#FF00FF' )
        .setTimestamp()
        .setFooter( { text: client.user.tag } );

      botCommands.forEach( cmd => {
        if ( cmd.ownerOnly ) { /* SKIP IT */ }
        else if ( cmd.modOnly && isBotMod ) {
          helpEmbed.addFields( { name: '\u200B', value: '🔐 **`' + prefix + cmd.name + '`** ' + cmd.description, inline: false } );
        }
        else if ( cmd.userPerms ) {
          cmd.userPerms.forEach( permNeeded => {
            if ( message.guild.members.cache.get( message.author.id ).permissions.has( permNeeded ) ) {
              helpEmbed.addFields( { name: '\u200B', value: '🔓 **`' + prefix + cmd.name + '`** ' + cmd.description, inline: false } );
            }
          } );
        }
        else if ( !( cmd.ownerOnly || cmd.modOnly ) ) {
          helpEmbed.addFields( { name: '\u200B', value: '✅ **`' + prefix + cmd.name + '`** ' + cmd.description, inline: false } );
        }
      } );
      message.reply( { embeds: [ helpEmbed ] } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};