const { ApplicationCommandType, EmbedBuilder } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const pagination = require( '../../functions/pagination.js' );


module.exports = {
  name: 'guilds',
  description: 'Get information about the guilds I\'m in.',
  type: ApplicationCommandType.ChatInput,
  options: [
    { type: 3, name: 'guild', description: 'Start with a specific guild by ID (invalid input will be ignored). (default current or first guild)' }
  ],
  cooldown: 300000,
  modCmd: true,
  run: async ( client, interaction ) => {
    await interaction.deferReply();

    const guildConfigs = await guildConfigDB.find();
    const guildConfigIds = [];
    guildConfigs.forEach( ( entry, i ) => { guildConfigIds.push( entry.Guild ); } );

    const bot = client.user;
    const { channel, guild, options, user: author } = interaction;
    const { content } = await userPerms( author, guild, true );
    if ( content ) { return interaction.editReply( { content: content } ); }

    const embedGuilds = [], myInvites = [];
    const guildIds = Array.from( client.guilds.cache.keys() );
    const currGuild = ( guildIds.indexOf( guild.id ) != -1 ? guildIds.indexOf( guild.id ) : null );
    const strInputGuild = options.getString( 'guild' );
    if ( !( /\d{18,19}/.test( strInputGuild ) ) ) { /* NOT A GUILD ID */ }
    const inputGuild = ( guildIds.indexOf( strInputGuild ) != -1 ? guildIds.indexOf( strInputGuild ) : null );
    const startGuild = ( inputGuild || currGuild || 0 );

    for ( const guildId of guildIds ) {
      const doGuild = client.guilds.cache.get( guildId );
      const objGuild = doGuild.toJSON();
      const guildName = objGuild.name;
      const vanityURLCode = objGuild.vanityURLCode;
if ( vanityURLCode ) { console.log( '%s has a vanityURLCode: %s', guildName, vanityURLCode ); }//don't know what this looks like in the API...
      const chanWidget = ( objGuild.widgetEnabled ? objGuild.widgetChannelId : null );
      const chanRules = objGuild.rulesChannelId;
      const chanPublicUpdates = objGuild.publicUpdatesChannelId;
      const chanSafetyAlerts = objGuild.safetyAlertsChannelId;
      const chanSystem = objGuild.systemChannelId;
      const chanFirst = doGuild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
      const doneConfig = ( guildConfigIds.indexOf( guildId ) != -1 ? true : false );
      const definedInvite = ( doneConfig ? guildConfigs[ guildConfigIds.indexOf( guildId ) ].Invite : null );
      const chanInvite = ( definedInvite || chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
      const chanLinkUrl = 'https://discordapp.com/channels/' + guildId + '/' + chanInvite;
      const ownerId = objGuild.ownerId;
      const objGuildOwner = doGuild.members.cache.get( ownerId );
      if ( !objGuildOwner ) {
        await doGuild.leave()
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
      const intBotMembers = doGuild.members.cache.filter( mbr => { if ( mbr.user.bot ) { return mbr; } } ).size;
      const preferredLocale = ( objGuild.preferredLocale || 'en-US' );
      const description = objGuild.description;
      const arrVerificationLevels = [ 'None', 'Low (email)', 'Medium (5m on Discord)', 'High (10m in guild)', 'Very High (phone number)' ];
      const verificationLevel = arrVerificationLevels[ ( objGuild.verificationLevel || 0 ) ];
      const mfaLevel = objGuild.mfaLevel;
      const guildInvite = await doGuild.invites.create( chanInvite, {
        maxAge: 900,
        reason: 'Invite created by ' + author.displayName + ' with `/guilds`.'
      } )
      .then( invite => {
        myInvites.push( { guildId: doGuild.id, invite: invite.code } );
        return 'https://discord.gg/invite/' + invite.code;
      } )
      .catch( async errInvite => { await errHandler( errInvite, { command: 'guilds', type: 'errInvite', channel: channel, guild: guild, inviteChanURL: chanInvite } ); } );
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

      embedGuilds.push( thisGuild );
    }
    await pagination( interaction, embedGuilds, { intPageNumber: startGuild } );
  }
};