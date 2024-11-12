const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/pagination.js' );

module.exports = async ( interaction, pages, options = { intPageNumber: 0, time: 30 } ) => {
  try {
    intPageNumber = ( options.intPageNumber || 0 );
    time = ( ( options.time || 30 ) * 1000 );

    if ( !interaction ) { throw new Error( '[PAGINATION] no interaction.' ); }
    if( !pages || !pages > 0 ) { throw new Error( '[PAGINATION] no pages.' ); }

    if ( !interaction.deferred ) { await interaction.deferReply(); }

    if ( pages.length === 1 ) { return await interaction.editReply( { embeds: pages, components: [], fetchReply: true } ); }

    const first = new ButtonBuilder().setCustomId( 'firstPage' ).setEmoji( '⏪' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
    const prev = new ButtonBuilder().setCustomId( 'prevPage' ).setEmoji( '⏮️' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
    const curr = new ButtonBuilder().setCustomId( 'currPage' ).setLabel( ( intPageNumber + 1 ) + '/' + pages.length ).setStyle( ButtonStyle.Primary ).setDisabled( true );
    const next = new ButtonBuilder().setCustomId( 'nextPage' ).setEmoji( '⏭️' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
    const last = new ButtonBuilder().setCustomId( 'lastPage' ).setEmoji( '⏩' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );

    if ( intPageNumber === 0 ) { first.setDisabled( true ); prev.setDisabled( true ); }
    else if ( intPageNumber === ( pages.length - 1 ) ) { next.setDisabled( true ); last.setDisabled( true ); }

    const buttons = new ActionRowBuilder().addComponents( [ first, prev, curr, next, last ] );

    const msg = await interaction.editReply( { embeds: [ pages[ intPageNumber ] ], components: [ buttons ], fetchReply: true } );

    const collector = await msg.createMessageComponentCollector( { componentType: ComponentType.Button, time } );

    collector.on( 'collect', async buttonInteraction => {
      if ( buttonInteraction.user.id != interaction.user.id ) { return await buttonInteraction.reply( { content: 'These buttons are not for you <@' + buttonInteraction.user.id + '>!', ephemeral: true } ); }

      await buttonInteraction.deferUpdate();

      if ( buttonInteraction.customId === 'firstPage' ) { intPageNumber = 0; }
      else if ( buttonInteraction.customId === 'prevPage' ) { if ( intPageNumber > 0 ) { intPageNumber-- } }
      else if ( buttonInteraction.customId === 'nextPage' ) { if ( intPageNumber < ( pages.length - 1 ) ) { intPageNumber++; } }
      else if ( buttonInteraction.customId === 'lastPage' ) { intPageNumber = ( pages.length - 1 ); }
      curr.setLabel( ( intPageNumber + 1 ) + '/' + pages.length );

      if ( intPageNumber === 0 ) { first.setDisabled( true ); prev.setDisabled( true ); }
      else { first.setDisabled( false ); prev.setDisabled( false ); }

      if ( intPageNumber === ( pages.length - 1 ) ) { next.setDisabled( true ); last.setDisabled( true ); }
      else { next.setDisabled( false ); last.setDisabled( false ); }

      await msg.edit( { embeds: [ pages[ intPageNumber ] ], components: [ buttons ] } ).catch( errEditPage => { console.error( 'Error in pagination.js editing page:\n%o', errEditPage ); } );

      collector.resetTimer();
    } );

    collector.on( 'end', async () => { await msg.delete(); } );

  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};