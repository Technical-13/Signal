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
      console.log('guildConfigs:\n%o',guildConfigs);
      console.log('guildConfigs.toJSON():\n%o',guildConfigs.toJSON());
        
        botConfig.find().then( entries => {
        entries.forEach( ( entry, i ) => {
          setTimeout( async () => {
            const guildId = entry.Guild;
            const guild = client.guilds.cache.get( guildId );
            const objGuildOwner = guild.members.cache.get( guild.ownerId );
            const objGuild = guild.toJSON();
            const guildName = objGuild.name;
            const memberCount = objGuild.memberCount;
            var maximumMembers = objGuild.maximumMembers;
            if ( maximumMembers > 10**9 ) { maximumMembers = ( maximumMembers / ( 10**9 ) ).toFixed( 2 ) + 'b'; }
            else if ( maximumMembers > 10**6 ) { maximumMembers = ( maximumMembers / ( 10**6 ) ).toFixed( 2 ) + 'm'; }
            else if ( maximumMembers > 10**3 ) { maximumMembers = ( maximumMembers / ( 10**3 ) ).toFixed( 1 ) + 'k'; }
            const intBotMembers = guild.members.cache.filter( mbr => { if ( mbr.user.bot ) { return mbr; } } ).size;
            const vanityURLCode = objGuild.vanityURLCode;
            if ( vanityURLCode ) { console.log( '%s has a vanityURLCode: %s', guildName, vanityURLCode ); }
            const iconURL = objGuild.iconURL;
            const preferredLocale = ( objGuild.preferredLocale || 'en-US' );
            const arrVerificationLevels = [ 'None', 'Low (email)', 'Medium (5m on Discord)', 'High (10m in guild)', 'Very High (phone number)' ];
            const verificationLevel = arrVerificationLevels[ ( objGuild.verificationLevel || 0 ) ];
            const mfaLevel = objGuild.mfaLevel;
            const chanWidget = ( objGuild.widgetEnabled ? objGuild.widgetChannelId : null );
            const chanRules = objGuild.rulesChannelId;
            const chanPublicUpdates = objGuild.publicUpdatesChannelId;
            const chanSafetyAlerts = objGuild.safetyAlertsChannelId;
            const chanSystem = objGuild.systemChannelId;
            const chanFirst = guild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
            const chanInvite = ( chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
            const chanLinkUrl = 'https://discordapp.com/channels/' + guildId + '/' + chanInvite;
            const guildInvite = await guild.invites
            .create( chanInvite, {
              maxAge: 300, maxUses: 1, reason: 'Single use invite for my botmod, ' + author.displayName + '.  Expires in 5 minutes if not used.'
            } ).then( invite => { return 'https://discord.gg/invite/' + invite.code; } ).catch( errCreateInvite => {
              switch ( errCreateInvite.code ) {
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
            const logDefaultId = entry.Logs.Default;
            const logErrorId = entry.Logs.Error;
            const logChatId = entry.Logs.Chat;
            botOwner.send( {
              content:
                guildName + ' (:id: ' + guildId + ' lang:' + preferredLocale + ')' +
                '\n\tSingle Use Invite: ' + ( guildInvite ? guildInvite : ':scream: ' + chanLinkUrl ) +
                '\n\tVerification Level: ' + verificationLevel + ( mfaLevel === 0 ? '' : ' (👮)' ) +
                '\n\tGuild Owner: <@' + guild.ownerId + '>' +
                '\n\tMembers: ' + memberCount + '/' + maximumMembers + ' (' + intBotMembers + ' bots)' +
                '\n\tDefault Log Channel: <#' + logDefaultId + '>' +
                '\n\tError Log Channel: <#' + logErrorId + '>' +
                '\n\tChat Log Channel: <#' + logChatId + '>',
              files: ( iconURL ? [ iconURL ] : null )
            } ).catch( errSend => { console.error( 'Error trying to show contents of the DB as you requested.\n%o', errSend ); } );//*/
          }, i*2000 );
        } );
      } ).catch( err=> { console.error( 'Error trying to inspect botConfig.DB:\n%o', err ); } );
    }
  }
};
