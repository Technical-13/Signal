const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
//const ActivityTypes = { Playing: 0, Streaming: 1, Listening: 2, Watching: 3, Custom: 4, Competing: 5 };

module.exports = {
  name: 'presence',
  description: 'Change activity and status for bot.',
  modOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    message.delete();
    
    const { author, channel, guild } = message;
    const { botOwner, isBotOwner, isDevGuild } = await userPerms( client, author, guild );
    const bot = client.user;

    const embedPresence = new EmbedBuilder()
    .setTitle( 'setPresence' )
    .setDescription( 'Set my activity, description, and status.' )
    .setColor( '#FF00FF' )
    .setTimestamp()
    .setThumbnail( bot.displayAvatarURL() )
    .setFooter( { text: bot.tag } );

    const statusButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel( 'Offline' ).setCustomId( 'offline' ).setStyle( ButtonStyle.Secondary ),
      new ButtonBuilder().setLabel( 'Do Not Disturb' ).setCustomId( 'dnd' ).setStyle( ButtonStyle.Danger ),
      new ButtonBuilder().setLabel( 'Idle' ).setCustomId( 'idle' ).setStyle( ButtonStyle.Primary ),
      new ButtonBuilder().setLabel( 'Online' ).setCustomId( 'online' ).setStyle( ButtonStyle.Success ) );

    const embedInterface = await message.reply( { embeds: [ embedPresence ], components: [ statusButtons ] } );
    const clickFilter = ( clicker ) => { clicker.user.id === author.id };
    const buttonClicks = embedInterface.createMessageComponentCollector( { componentType: ComponentType.Button, clickFilter, max: 1 } );

    buttonClicks.on( 'collect', interaction => {
      const { customId, label } = interaction;
      bot.setPresence( { status: customId } ).then( newPresence => {
        interaction.reply( 'I am now **`' + label + '`**!' );
        if ( !isBotOwner ) {
          console.log( '%s changed my presence to: %o', author.displayName, newPresence );
        }
      } ).catch( errSetPresence => {
        console.error( 'Encountered an error setting status to %s%s:\n%o', customId, ( isBotOwner ? '' : ' for ' + author.displayName ), errSetPresence );
        botOwner.send( { content: 'Encountered an error setting status to ' + customId + ( isBotOwner ? '' : ' for ' + author.displayName ) + '. See console for details.' } )
          .then( dmSent => {
            if ( !isBotOwner ) { channel.send( 'Encountered an error setting status to ' + customId + '. My owner has been notified.' ); }
          } )
          .catch( errSend => {
            if ( !isBotOwner ) { channel.send( 'Encountered an error setting status to ' + customId + '.' ); }
            console.error( 'Error DMing you about above error: %o', errSend );
          } );
      } );
    } );

    buttonClicks.on( 'end', () => { setTimeout( () => { embedInterface.delete(); }, 3000 ); } );
  }
};