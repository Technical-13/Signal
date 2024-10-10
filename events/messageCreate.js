const client = require( '..' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const ms = require( 'ms' );
const prefix = client.prefix;
const cooldown = new Collection();
const cacheinfo = require( '../functions/cacheinfo.js' );
const gcCacheTypeIcons = require( '../eventTypes.json' );
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const OWNER_ID = process.env.OWNER_ID;

client.on( 'messageCreate', async message => {
  const { author, channel, content, guild, mentions } = message;
  const bot = client.user;
  if ( author.bot ) return;
  if ( channel.type !== 0 ) return;
  const isDevGuild = ( guild.id == DEV_GUILD_ID );
  const botOwner = client.users.cache.get( OWNER_ID );
  const isBotOwner = ( author.id === botOwner.id ? true : false );
// Get botMods, isBotMod
  const objGuildMembers = guild.members.cache;
  const objGuildOwner = objGuildMembers.get( guild.ownerId );
  const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
  const msgAuthor = await guild.members.cache.get( author.id );

  var hasCodes = {
    GC: false,// Geocache
    TB: false,// Trackable
    WM: false,// Waymark
    GL: false,// Geocache Log
    TL: false,// Trackable Log
    PR: false,// User Profile
    BM: false,// Bookmark
    GT: false//  GeoTour  
  };
  const arrGcCodes = [];
  const arrOtherCodes = [];
  const arrContent = content.trim().split( ' ' );
  const arrOtherTypeCodes = [ 'GC', 'TB', 'WM', 'GL', 'TL', 'PR', 'BM', 'GT' ];
  for ( let word of arrContent ) {
    word = word.trim();
    let wordPrefix = word.slice( 0, 2 );
    word = word.match( /(GC|TB|WM|GL|TL|PR|BM|GT)[A-Z0-9]*/ );
    word = ( word ? word[ 0 ] : [] );
    if ( word.length >= 4 && word.length <= 8 ) {
      if ( word.startsWith( 'GC' ) ) {
        arrGcCodes.push( word.toUpperCase() );
        hasCodes.GC = true;
      }
      else if ( arrOtherTypeCodes.indexOf( wordPrefix ) != -1 ) {
        arrOtherCodes.push( word.toUpperCase() );
        hasCodes[ wordPrefix ] = true;
      }
    }
  }
  
  const hasPrefix = content.startsWith( prefix );
  const meMentionPrefix = '<@' + CLIENT_ID + '>';
  const mePrefix = content.startsWith( meMentionPrefix );
  const mentionsMe = mentions.users.has( CLIENT_ID );
  var args = [];
  if ( hasPrefix ) { args = content.slice( prefix.length ).trim().split( / +/g ); }
  else if ( mePrefix ) {
    args = content.slice( meMentionPrefix.length ).trim().split( / +/g );
    if ( args[ 0 ].startsWith( prefix ) ) {
      args[ 0 ] = args[ 0 ].slice( prefix.length ).trim();
      if ( args[ 0 ].length == 0 ) { args = args.shift(); }
    }
  }
  const cmd = ( args.shift() || [] );
  if ( cmd.length != 0 ) {
    let command = client.commands.get( cmd.toLowerCase() );
    if ( !command ) command = client.commands.get( client.aliases.get( cmd ) );
  
    if ( command ) {
      const isOwnerOnly = command.ownerOnly;
      const isModOnly = command.modOnly;
      if ( isOwnerOnly && ( !isBotOwner ) ) {// || isBotMod 
  //      if ( isBotMod ) {
          return message.reply( { content: `This is an **owner only command**, speak to <@${botOwner.id}>/` } );
  //      } else { /* DO NOTHING */ }
  //    } else if ( isModOnly && !isBotMod ) {
          /* DO NOTHING */
      } else {
        if ( command.cooldown ) {
          if ( cooldown.has( `${command.name}${author.id}` ) ) {
            return channel.send( { content: `You are on \`${ms(cooldown.get(`${command.name}${author.id}`) - Date.now(), {long : true})}\` cooldown!` } );
          }
          if ( command.userPerms || command.botPerms ) {
            if ( !message.member.permissions.has( PermissionsBitField.resolve( command.userPerms || [] ) ) ) {
              const userPerms = new EmbedBuilder()
              .setDescription( `🚫 ${author}, You don't have \`${command.userPerms}\` permissions to use this command!` )
              .setColor( 'Red' )
              return message.reply( { embeds: [ userPerms ] } );
            }
            if ( !objGuildMembers.get( bot.id ).permissions.has( PermissionsBitField.resolve( command.botPerms || [] ) ) ) {
              const botPerms = new EmbedBuilder()
              .setDescription( `🚫 ${author}, I don't have \`${command.botPerms}\` permissions to use this command!` )
              .setColor( 'Red' )
              return message.reply( { embeds: [ botPerms ] } );
            }
          }
    
          command.run( client, message, args );
          cooldown.set( `${command.name}${author.id}`, Date.now() + command.cooldown );
          setTimeout( () => { cooldown.delete( `${command.name}${author.id}` ) }, command.cooldown );
        } else {
          if ( command.userPerms || command.botPerms ) {
            if ( !message.member.permissions.has( PermissionsBitField.resolve( command.userPerms || [] ) ) ) {
              const userPerms = new EmbedBuilder()
              .setDescription( `🚫 ${message.author}, You don't have \`${command.userPerms}\` permissions to use this command!` )
              .setColor( 'Red' )
              return message.reply( { embeds: [userPerms] } );
            }
    
            if ( !objGuildMembers.get( bot.id ).permissions.has( PermissionsBitField.resolve( command.botPerms || [] ) ) ) {
              const botPerms = new EmbedBuilder()
              .setDescription( `🚫 ${author}, I don't have \`${command.botPerms}\` permissions to use this command!` )
              .setColor( 'Red' )
              return message.reply( { embeds: [ botPerms ] } );
            }
          }
          command.run( client, message, args );
        }
      }
    }
  }
  
  if ( Object.values( hasCodes ).some( b => b ) ) {
    const intCodes = arrGcCodes.length + arrOtherCodes.length;
    const strPlural = ( intCodes === 1 ? '' : 's' );
    let arrCodeTypes = [];
    Object.entries( hasCodes ).forEach( entry => { if ( entry[ 1 ] ) { arrCodeTypes.push( entry[ 0 ] ) } } );
    const intCodeTypes = arrCodeTypes.length;
    let strCodeTypes = '';
    switch ( intCodeTypes ) {
      case 0: break;
      case 1:
        strCodeTypes = arrCodeTypes.pop();
        break;
      case 2:
        strCodeTypes = arrCodeTypes.join( ' and ' );
        break;
      default:
        let lastType = arrCodeTypes.pop();
        strCodeTypes = arrCodeTypes.join( ', ' ) + ', and ' + lastType;
    }
    let strCodes = strCodeTypes + ' code' + strPlural + ' detected, here ' + ( intCodes === 1 ? 'is the ' : 'are ' ) + 'link' + strPlural + ':';
    const codesResponse = await channel.send( strCodes );
    for ( let gcCode of arrGcCodes ) {
      await codesResponse.edit( strCodes + '\n<:Signal:398980726000975914> ...attempting to gather information about [' + gcCode + '](<https://coord.info/' + gcCode + '>)...' );
      let objCache = await cacheinfo( gcCode );
      if ( objCache.failed ) {
        strCodes += '\n<:RIP:1015415145180176535> **Failed to get information about __[' + gcCode + '](<https://coord.info/' + gcCode + '>)__: ' + objCache.error + '...**';
        await codesResponse.edit( strCodes );
      } else {
        let cacheName = encodeURIComponent( objCache.name ).replace( /%20/g, ' ' );
        let cacheTypeIcon = ( Object.keys( gcCacheTypeIcons ).indexOf( objCache.type ) != -1 ? gcCacheTypeIcons[ objCache.type ] : '⁉' );
        strCodes += '\n';
        if ( objCache.pmo ) { strCodes += '<:PMO:1293693055127519315>'; }
        if ( objCache.archived || objCache.locked ) { strCodes += '<:archived:467385636173905942>'; }
        else if ( objCache.disabled ) { strCodes += '<:disabled:467385661415227393>'; }
        let dtURL = '[[' + objCache.difficulty + '/' + objCache.terrain + ']](<https://www.geocaching.com/help/index.php?pg=kb.page&inc=1&id=82>)';
        strCodes += cacheTypeIcon + ' [' + cacheName + '](<https://coord.info/' + objCache.code + '>) by ' + objCache.nameCO + ' ' + dtURL;
        await codesResponse.edit( strCodes );
      }
    }
    for ( let code of arrOtherCodes ) { strCodes += '\n\t' + code + ' :link: <https://coord.info/' + code + '>'; }
    codesResponse.edit( strCodes );
  }
} );
