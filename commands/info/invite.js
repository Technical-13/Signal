const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );

module.exports = {
	name: 'invite',
	description: 'Get the bot\'s invite link.',
	cooldown: 3000,
	userPerms: [ 'Administrator' ],
	botPerms: [ 'Administrator' ],
	run: async ( client, message, args ) => {
		const inviteUrl = client.generateInvite( {
      permissions: [
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ManageWebhooks,
        PermissionFlagsBits.UseApplicationCommands
      ],
      scopes: [
        OAuth2Scopes.Bot,
        OAuth2Scopes.ApplicationsCommands
      ],
    } );
		const embed = new EmbedBuilder()
		.setTitle( 'Invite me' )
		.setDescription( 'Invite ' + ( process.env.BOT_USERNAME || 'the bot' ) + ' to your server. [Click here](' + inviteUrl + ')\nThis message self-destructs in three minutes!' )
		.setColor( '#FF00FF' )
		.setTimestamp()
		.setThumbnail( client.user.displayAvatarURL() )
		.setFooter( { text: client.user.tag } )

		const actionRow = new ActionRowBuilder()
		.addComponents( [
			new ButtonBuilder()
			.setLabel( 'Invite' )
			.setURL( inviteUrl )
			.setStyle( 5 )
		] )
		const msgInvite = await message.reply( { embeds: [ embed ], components: [ actionRow ] } );
    setTimeout( () => { msgInvite.delete(); }, 180000 );
    message.delete();
	}
};
