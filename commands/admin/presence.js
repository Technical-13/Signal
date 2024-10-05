const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require( 'discord.js' );

module.exports = {
  name: 'presence',
  description: 'Change activity and status for bot.',
  ownerOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    const { author, channel, guild } = message;
    const bot = client.user;
    
console.log( '&presence recieved arguments:\n%o', args );

    message.delete();

    const ActivityTypes = { Playing: 0, Streaming: 1, Listening: 2, Watching: 3, Custom: 4, Competing: 5 };
    
    const embedPresence = new EmbedBuilder()
    .setTitle( 'setPresence' )
    .setDescription( 'Set my activity, description, and status.' )
    .setColor( '#FF00FF' )
    .setTimestamp()
    .setThumbnail( bot.displayAvatarURL() )
    .setFooter( { text: bot.tag } )

    const statusButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel( 'Offline' ).setCustomId( 'offline' ).setStyle( ButtonStyle.Secondary ),
      new ButtonBuilder().setLabel( 'Do Not Disturb' ).setCustomId( 'dnd' ).setStyle( ButtonStyle.Danger ),
      new ButtonBuilder().setLabel( 'Idle' ).setCustomId( 'idle' ).setStyle( ButtonStyle.Primary ),
      new ButtonBuilder().setLabel( 'Online' ).setCustomId( 'online' ).setStyle( ButtonStyle.Success ) );
    const embedInterface = await message.reply( { embeds: [ embedPresence ], components: [ statusButtons ] } );
    const clickFilter = ( clicker ) => { clicker.user.id === author.id };
    const buttonClicks = embedInterface.createMessageComponentCollector( { componentType: ComponentType.Button, clickFilter, max: 1 } );

    buttonClicks.on( 'collect', interaction => {
      switch ( interaction.customId ) {
        case 'offline':
          bot.setPresence( { status: 'offline' } ).then( newPresence => {
            interaction.reply( 'I am now **`Offline`**!' );
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', interaction.customId, errSetPresence ); } );
          break;
        case 'dnd':
          bot.setPresence( { status: 'dnd' } ).then( newPresence => {
            interaction.reply( 'I am now **`Do Not Disturb`**!' );   
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', interaction.customId, errSetPresence ); } );       
          break;
        case 'idle':
          bot.setPresence( { status: 'idle' } ).then( newPresence => {
            interaction.reply( 'I am now **`Idle`**!' );
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', interaction.customId, errSetPresence ); } );
          break;
        case 'online': default:
          bot.setPresence( { status: 'online' } ).then( newPresence => {
            interaction.reply( 'I am now **`Online`**!' );
          } ).catch( errSetPresence => { console.error( 'Encountered an error setting status to %s:\n%o', interaction.customId, errSetPresence ); } );
      }
    } );

    buttonClicks.on( 'end', () => {
      setTimeout( () => { embedInterface.delete(); }, 3000 );
    } );
  }
};
