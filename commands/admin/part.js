const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './commands/admin/part.js' );

module.exports = {
  name: 'part',
  group: 'admin',
  description: 'Leave the current guild.\n\t§part [guild.id (default: current guild)] [\`reason\`] [allowRejoin (default: `TRUE`)]',
  modOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    try {
      const { author, channel, guild } = message;
      const { botOwner, isBotOwner, isBotMod, guildOwner } = await userPerms( author, guild );

      if ( isBotMod ) {
        let allowRejoin = ( args.length >= 1 && ( args[ args.length - 1 ]?.toUpperCase() === 'TRUE' || args[ args.length - 1 ]?.toUpperCase() === 'FALSE' ) ? ( args.pop()?.toUpperCase() === 'TRUE' ? true : false ) : true );
        const inviteUrl = ( allowRejoin ? client.generateInvite( {// permissions, scopes } ) : null );
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
          if ( !( /[\d]{17,19}/.test( guildId ) ) && !guildId.startsWith( '`' ) ) { return interaction.editReply( { content: '`' + guildId + '` is not a valid `guild-id`. Please try again.' } ); }
          if ( !client.guilds.cache.get( guildId ) && !guildId.startsWith( '`' ) ) { return interaction.editReply( { content: 'I wasn\'t in any guild with an id of `' + guildId + '`. Please try again.' } ); }
          leaveGuild = client.guilds.cache.get( args.shift() );
        }
        if ( args.length != 0 ) { leaveReason = args.join( ' ' ).replace( /`{1,3}/g, '' ); }

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
                .catch( async errEdit => { interaction.editReply( await errHandler( errEdit, { command: 'part', channel: channel, type: 'errEdit' } ) ); } );
              }, i * 1000 );
            }
            setTimeout( () => {// All gone!
              sentLeaving.edit( { content: 'I left' + ( !leaveReason ? '' : ' with reason `' + leaveReason + '`' ) + ' as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' ) } )
              .catch( async errEdit => { interaction.editReply( await errHandler( errEdit, { command: 'part', channel: channel, type: 'errEdit' } ) ); } );
            }, leaveIn * 1000 );
            message.delete().catch( async errDelete => { interaction.editReply( await errHandler( errDelete, { command: 'part', channel: channel, type: 'errDelete' } ) ); } );
            guildOwner.send( { content: 'I\'m leaving [' + guild.name + '](<https://discord.com/channels/' + guild.id + '/' + chanInvite + '>)' + ( !leaveReason ? '' : ' with reason `' + leaveReason + '`' ) + ' as requested by <@' + author.id + '>.' + ( !inviteUrl ? '' : '  Please feel free to [re-add me](<' + inviteUrl + '>) if you wish!' ) } )
            .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'part', channel: channel, type: 'errSend' } ) ); } );
          } )
          .catch( async errReply => { author.send( await errHandler( errReply, { author: author, command: 'part', type: 'errReply' } ) ); } );

          setTimeout( async () => {
            await leaveGuild.leave()
            .then( left => { console.error( 'I left guild %s (id: %s) as requested by %s (id: %s)', guild.name, guild.id, author.displayName, author.id ); } )
            .catch( stayed => { console.error( 'I could NOT leave guild %s as requested by %s:\n%o', '[' + guild.name + '](<https://discord.com/channels/' + guild.id + '/' + chanInvite + '>)', author.displayName, stayed ); } );
          }, ( leaveIn + 1 ) * 1000 );
        }
      }
    }
    catch ( objError ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};