require( 'dotenv' ).config();
const ENV = process.env;
const config = require( '../../config.json' );
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './commands/info/invite.js' );

module.exports = {
	name: 'invite',
  group: 'info',
	description: 'Get the bot\'s invite link.',
	cooldown: 3000,
	run: async ( client, message, args ) => {
    try {
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
      .setURL( inviteUrl )
      .setDescription( 'Invite ' + ( client.user.displayName || config.botName || ENV.BOT_USERNAME || 'the bot' ) + ' to your server. [Click here](' + inviteUrl + ')\nThis message self-destructs in three minutes!' )
      .setColor( '#FF00FF' )
      .setTimestamp()
      .setThumbnail( client.user.displayAvatarURL() )
      .setFooter( { text: client.user.tag } )

      const actionRow = new ActionRowBuilder().addComponents( [ new ButtonBuilder().setLabel( 'Invite' ).setURL( inviteUrl ).setStyle( 5 ) ] );
      const msgInvite = await message.reply( { embeds: [ embed ], components: [ actionRow ] } );
      setTimeout( () => {// two minutes!
        embed.setDescription( embed.data.description.replace( 'three minutes!', 'two minutes!' ) );
        msgInvite.edit( { embeds: [ embed ], components: [ actionRow ] } );
      }, 60000 );
      setTimeout( () => {// one minute!
        embed.setDescription( embed.data.description.replace( 'two minutes!', 'one minute!' ) );
        msgInvite.edit( { embeds: [ embed ], components: [ actionRow ] } );
      }, 120000 );
      setTimeout( () => {// 30 seconds!
        embed.setDescription( embed.data.description.replace( 'one minute!', '30 seconds!' ) );
        msgInvite.edit( { embeds: [ embed ], components: [ actionRow ] } );
      }, 150000 );
      setTimeout( () => {// 15 seconds!
        embed.setDescription( embed.data.description.replace( '30 seconds!', '15 seconds!' ) );
        msgInvite.edit( { embeds: [ embed ], components: [ actionRow ] } );
      }, 165000 );
      for ( let countDown = 1; countDown <= 10; countDown++ ) {// 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 seconds?!
        setTimeout( () => {// #?# seconds?!
          embed.setDescription( embed.data.description.replace( /[\d]{1,2} seconds?!/, ( 11 - countDown ) + ' second' + ( ( 11 - countDown ) === 1 ? '' : 's' ) + '!' ) );
          msgInvite.edit( { embeds: [ embed ], components: [ actionRow ] } );
        }, ( 170000 + ( countDown * 1000 ) ) );
      }
      setTimeout( () => { msgInvite.delete(); }, 180000 );
      message.delete();
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
	}
};