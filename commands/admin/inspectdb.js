const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const botConfig = require( '../../models/GuildLogs.js' );

module.exports = {
  name: 'inspectdb',
  description: 'Inspect my database.',
  ownerOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    const author = message.author;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    if ( isBotOwner ) {
    
      const first = new ButtonBuilder().setCustomId( 'firstPage' ).setEmoji( '⏪' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
      const prev = new ButtonBuilder().setCustomId( 'prevPage' ).setEmoji( '⏮️' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
      const curr = new ButtonBuilder().setCustomId( 'currPage' ).setLabel( ( intPageNumber + 1 ) + '/' + pages.length ).setStyle( ButtonStyle.Primary ).setDisabled( true );
      const next = new ButtonBuilder().setCustomId( 'nextPage' ).setEmoji( '⏭️' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
      const last = new ButtonBuilder().setCustomId( 'lastPage' ).setEmoji( '⏩' ).setStyle( ButtonStyle.Secondary ).setDisabled( false );
      const buttons = new ActionRowBuilder().addComponents( [ first, prev, curr, next, last ] );
      
      message.delete();
      
      const guildConfigs = await botConfig.find();
      const guildConfigIds = [];
      guildConfigs.forEach( ( entry, i ) => { guildConfigIds.push( entry.Guild ); } );
      const embedGuilds = [];
      const guildIds = Array.from( client.guilds.cache.keys() );
      
      for ( const guildId of guildIds ) {
        const guild = client.guilds.cache.get( guildId );
        const objGuild = guild.toJSON();
        const guildName = objGuild.name;
        const vanityURLCode = objGuild.vanityURLCode;
if ( vanityURLCode ) { console.log( '%s has a vanityURLCode: %s', guildName, vanityURLCode ); }//don't know what this looks like in the API...
        const chanWidget = ( objGuild.widgetEnabled ? objGuild.widgetChannelId : null );
        const chanRules = objGuild.rulesChannelId;
        const chanPublicUpdates = objGuild.publicUpdatesChannelId;
        const chanSafetyAlerts = objGuild.safetyAlertsChannelId;
        const chanSystem = objGuild.systemChannelId;
        const chanFirst = guild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
        const chanInvite = ( chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
        const chanLinkUrl = 'https://discordapp.com/channels/' + guildId + '/' + chanInvite;
        const ownerId = objGuild.ownerId;
        const objGuildOwner = guild.members.cache.get( ownerId );
        if ( !objGuildOwner ) {
          await guild.leave()
            .then( left => { console.log( 'I left guild (%s) with no owner!\n\t%s', left.name, chanLinkUrl ); } )
            .catch( stayed => { console.error( 'I could NOT leave guild with no owner!\n%o', stayed ); } );
          continue;
        }
        const ownerName = objGuildOwner.displayName;
        const iconURL = objGuild.iconURL;
        const memberCount = objGuild.memberCount;
        var maximumMembers = objGuild.maximumMembers;
        if ( maximumMembers > 10**8 ) { maximumMembers = ( Math.trunc( maximumMembers / ( 10**8 ) ) / 100 ) + 'b'; }
        else if ( maximumMembers > 10**5 ) { maximumMembers = ( Math.trunc( maximumMembers / ( 10**5 ) ) / 10 ) + 'm'; }
        else if ( maximumMembers > 10**3 ) { maximumMembers = ( maximumMembers / ( 10**3 ) ).toFixed( 1 ) + 'k'; }
        const intBotMembers = guild.members.cache.filter( mbr => { if ( mbr.user.bot ) { return mbr; } } ).size;
        const preferredLocale = ( objGuild.preferredLocale || 'en-US' );
        const description = objGuild.description;
        const arrVerificationLevels = [ 'None', 'Low (email)', 'Medium (5m on Discord)', 'High (10m in guild)', 'Very High (phone number)' ];
        const verificationLevel = arrVerificationLevels[ ( objGuild.verificationLevel || 0 ) ];
        const mfaLevel = objGuild.mfaLevel;
        const guildInvite = await guild.invites.create( chanInvite, {
          maxAge: 300, maxUses: 1, reason: 'Single use invite for my botmod, ' + author.displayName + '.  Expires in 5 minutes if not used.'
        } ).then( invite => { return 'https://discord.gg/invite/' + invite.code; } ).catch( errCreateInvite => {
          switch ( errCreateInvite.code ) {
            case 10003://Unknown Channel
              console.log( 'Unknown channel to create invite for %s:\n\tLink: %s\n\tFirst: %s\n\tObjGuild:%o', guildName, chanLinkUrl, chanFirst, objGuild );
              break;
            case 50013://Missing permissions
              objGuildOwner.send( 'Help!  Please give me `CreateInstantInvite` permission in ' + chanLinkUrl + '!' ).catch( errSendGuildOwner => {
                console.error( 'Unable to DM guild owner, %s, for %s to get `CreateInstantInvite` permission:\n%o', ownerName, guildName, errSendGuildOwner );
              } );
              break;
            default:
              console.error( 'Unable to create an invite for %s:\n%o', guildName, errCreateInvite );
              return null;
          }
        } );
        const aboutInfo = '**Owner**: __' + ownerName + '__ (<@' + ownerId + '>)' +
            '\n**Members**: __' + memberCount + '/' + maximumMembers + '__ (' + intBotMembers + ' bots)' +
            '\n**Verification Level**: __' + verificationLevel + '__' + ( mfaLevel === 0 ? '' : ' (👮)' );
        const thisGuild = new EmbedBuilder()
          .setTitle( guildName )
          .setURL( guildInvite ? guildInvite : chanLinkUrl )
          .setDescription( aboutInfo )
          .setColor( '#FF00FF' )
          .setTimestamp()
          .setThumbnail( iconURL )
          .setFooter( { text: author.displayName + ' requested /guilds information (' + guildIds.length + ')' } );
  
        if ( description ) { thisGuild.addFields( { name: 'Description', value: description } ); }

        if ( guildConfigIds.indexOf( guildId ) != -1 ) {
          const indexOfGuild = guildConfigIds.indexOf( guildId )
          const guildChans = guildConfigs[ indexOfGuild ].Logs;
          thisGuild.addFields(
            { name: '\u200B', value: 'Default Log Channel: <#' + guildChans.Default + '>' },
            { name: '\u200B', value: 'Error Log Channel: <#' + guildChans.Error + '>' },
            { name: '\u200B', value: 'Chat Log Channel: <#' + guildChans.Chat + '>' }
          );
        } else {
          thisGuild.addFields( { name: '\u200B', value: 'This server not configured.  All logs go to <@' + ownerId + '>' } );
        }
  
        embedGuilds.push( thisGuild );
      }

      let intPageNumber = 0;
      
      const msg = await message.reply( { embeds: [ pages[ intPageNumber ] ], components: [ buttons ], fetchReply: true } );
  
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
  
      collector.on( 'end', async () => {
        await msg.delete();
      } );
    }
  }
};
