const thisBotName = process.env.BOT_USERNAME;
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../../models/BotConfig.js' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
	name: 'help',
	description: 'Get the bot\'s commands',
	cooldown: 600000,    
	run: async ( client, message, args ) => {
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => {  console.error( 'Unable to find botConfig:\n%o', errFindBot );  } );
    const guildConfig = await guildConfigDB.findOne( { Guild: message.guild.id } )
      .catch( errFindBot => {  console.error( 'Unable to find guildConfig:\n%o', errFindBot );  } );
    const globalPrefix = botConfig.Prefix;
    const guildPrefix = guildConfig.Prefix;
    const prefix = ( guildPrefix || globalPrefix || client.prefix );
    const botCommands = client.commands;
		const helpEmbed = new EmbedBuilder()
      .setTitle( 'Commands available to ' + message.guild.members.cache.get( message.author.id ).displayName )
      .setColor( '#FF00FF' )
      .setTimestamp()
      .setFooter( { text: client.user.tag } );
        
    botCommands.forEach( cmd => {
      if ( cmd.ownerOnly ) { /* SKIP IT */ }
      else if ( cmd.userPerms ) {
        cmd.userPerms.forEach( permNeeded => {
          if ( message.guild.members.cache.get( message.author.id ).permissions.has( permNeeded ) ) {
            helpEmbed.addFields( { name: '\u200B', value: '🔓 **`' + prefix + cmd.name + '`** ' + cmd.description, inline: false } );
          }
        } );
      } else {
        helpEmbed.addFields( { name: '\u200B', value: '✅ **`' + prefix + cmd.name + '`** ' + cmd.description, inline: false } );
      }
    } );
    message.reply( { embeds: [ helpEmbed ] } );
  }
};