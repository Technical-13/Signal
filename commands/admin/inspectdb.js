const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const botConfig = require( '../../models/GuildLogs.js' );
const pagination = require( '../../functions/pagination.js' );

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
        const ownerId = objGuild.ownerId;
        const objGuildOwner = guild.members.cache.get( ownerId );
        const ownerName = ( objGuildOwner ? objGuildOwner.displayName : client.users.cache.get( ownerId ).displayName );
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
        const vanityURLCode = objGuild.vanityURLCode;
        if ( vanityURLCode ) { console.log( '%s has a vanityURLCode: %s', guildName, vanityURLCode ); }
        const chanWidget = ( objGuild.widgetEnabled ? objGuild.widgetChannelId : null );
        const chanRules = objGuild.rulesChannelId;
        const chanPublicUpdates = objGuild.publicUpdatesChannelId;
        const chanSafetyAlerts = objGuild.safetyAlertsChannelId;
        const chanSystem = objGuild.systemChannelId;
        const chanFirst = guild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
        const chanInvite = ( chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
        const chanLinkUrl = 'https://discordapp.com/channels/' + guildId + '/' + chanInvite;
        const guildInvite = await guild.invites.create( chanInvite, {
          maxAge: 300, maxUses: 1, reason: 'Single use invite for my botmod, ' + author.displayName + '.  Expires in 5 minutes if not used.'
        } ).then( invite => { return 'https://discord.gg/invite/' + invite.code; } ).catch( errCreateInvite => {
          switch ( errCreateInvite.code ) {
            case 10003://Unknown Channel
              console.log( 'Unknown channel to create invite for %s:\n\tWidget (%o::%s):%s\n\tRules: %s\n\tPU: %s\n\tSA: %s\n\tSys: %s\n\tFirst: %s',
                guildName, objGuild.widgetEnabled, objGuild.widgetChannelId, chanWidget, chanRules, chanPublicUpdates, chanSafetyAlerts, chanSystem, chanFirst );
              break;
            case 50013://Missing permissions
              objGuildOwner.send( 'Help!  Please give me `CreateInstantInvite` permission in ' + chanLinkUrl + '!' ).catch( errSendGuildOwner => {
                console.error( 'Unable to DM guild owner, %s, for %s to get `CreateInstantInvite` permission:\n%o', objGuildOwner.displayName, guildName, errSendGuildOwner );
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
      await pagination( message, embedGuilds );
    }
  }
};
