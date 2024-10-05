const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
	name: 'help',
	description: 'Get the bot\'s commands',
	cooldown: 600000,    
	run: async ( client, message, args ) => {
        const prefix = client.prefix;
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