const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const errHandler = require( '../../functions/errorHandler.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );

module.exports = {
  name: 'part',
  description: 'Leave the current guild.',
  modOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    try {
      const { author, channel, guild } = message;
      const { isBotOwner, guildOwner } = await userPerms( author, guild );

      if ( isBotOwner ) {
        let allowRejoin = ( args.length >= 1 && typeof( args[ args.length ] ) === 'boolean' ? args.pop() : true );
        const inviteUrl = ( allowRejoin ? client.generateInvite( {
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
        } ) : null );

        var leaveGuild, leaveReason;
        if ( args.length === 0 ) { leaveGuild = guild; }
        if ( args.length >= 1 ) {
          let guildId = args[ 0 ];
          if ( !( /[\d]{18,19}/.test( guildId ) ) && !guildId.startsWith( '||' ) ) { return interaction.editReply( { content: '`' + guildId + '` is not a valid `guild-id`. Please try again.' } ); }
          if ( !client.guilds.cache.get( guildId ) && !guildId.startsWith( '||' ) ) { return interaction.editReply( { content: 'I wasn\'t in any guild with an id of `' + guildId + '`. Please try again.' } ); }
          leaveGuild = client.guilds.cache.get( args.shift() );
        }
        if ( args.length != 0 ) { leaveReason = args.join( ' ' ).replace( /\|{2}/g, '' ); }

        if ( leaveGuild ) {
          const leaveGuildDB = await getGuildConfig( leaveGuild );
          const roleEveryone = leaveGuild.roles.cache.find( role => role.name === '@everyone' );
          const chanWidget = ( leaveGuild.widgetEnabled ? leaveGuild.widgetChannelId : null );
          const chanRules = leaveGuild.rulesChannelId;
          const chanPublicUpdates = leaveGuild.publicUpdatesChannelId;
          const chanSafetyAlerts = leaveGuild.safetyAlertsChannelId;
          const chanSystem = leaveGuild.systemChannelId;
          const chanFirst = Array.from( leaveGuild.channels.cache.filter( chan => !chan.nsfw && chan.permissionsFor( roleEveryone ).has( 'ViewChannel' ) ).keys() )[ 0 ];
          const definedInvite = leaveGuildDB.Invite;
          const chanInvite = ( leaveGuild.id === guild.id ? channel.id : ( definedInvite || chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst ) );
          const leaveIn = 5;
          const msgContent = 'I\'m leaving in ' + leaveIn + ' seconds' + ( !leaveReason ? '' : ' with reason `' + leaveReason + '`' ) + ' as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' );
          await message.reply( { content: msgContent, fetchReply: true } )
          .then( sentLeaving => {
            for ( let i = 1; i < leaveIn; i++ ) {// Countdown...
              setTimeout( async () => {
                newMsg = msgContent.replace( leaveIn, ( leaveIn - i ) );
                await sentLeaving.edit( { content: newMsg } )
                .catch( async errEdit => { await errHandler( errEdit, { command: 'part', channel: channel, type: 'errEdit' } ); } );
              }, i * 1000 );
            }
            setTimeout( () => {// All gone!
              sentLeaving.edit( { content: 'I left' + ( !leaveReason ? '' : ' with reason `' + leaveReason + '`' ) + ' as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' ) } )
              .catch( async errEdit => { await errHandler( errEdit, { command: 'part', channel: channel, type: 'errEdit' } ); } );
            }, leaveIn * 1000 );
            message.delete().catch( async errDelete => { await errHandler( errDelete, { command: 'part', channel: channel, type: 'errDelete' } ); } );
            guildOwner.send( { content: 'I\'m leaving https://discord.com/channels/' + guild.id + '/' + chanInvite + ( !leaveReason ? '' : ' with reason `' + leaveReason + '`' ) + ' as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' ) } )
            .catch( async errSend => { await errHandler( errSend, { command: 'part', channel: channel, type: 'errSend' } ); } );
          } )
          .catch( errSend => { console.error( 'Failed to alert in #%s (id: %s) that I\'m leaving %s (id: %s) as requested by %s (id: %s): %s', channel.name, channel.id, guild.name, guild.id, author.displayName, author.id, errSend.stack ); } );

          setTimeout( async () => {
            await leaveGuild.leave()
            .then( left => { console.error( 'I left guild %s (id: %s) as requested by %s (id: %s)', guild.name, guild.id, author.displayName, author.id ); } )
            .catch( stayed => { console.error( 'I could NOT leave guild %s (id: %s) as requested by %s (id: %s):\n%o', guild.name, guild.id, author.displayName, author.id, stayed ); } );
          }, ( leaveIn + 1 ) * 1000 );
        }
      }
    }
    catch ( objError ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './commands/admin/part.js' ), errObject.stack ); }
  }
};