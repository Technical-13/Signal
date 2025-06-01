const client = require( '..' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const ms = require( 'ms' );
const chalk = require( 'chalk' );
const cooldown = new Collection();
const gcCacheTypeIcons = require( '../jsonObjects/eventTypes.json' );
const cacheinfo = require( '../functions/cacheinfo.js' );
const userPerms = require( '../functions/getPerms.js' );
const botVerbosity = client.verbosity;
const strScript = chalk.hex( '#FFA500' ).bold( './events/messageCreate.js' );
const getDebugString = ( thing ) => {
  if ( Array.isArray( thing ) ) { return '{ object-Array: { length: ' + thing.length + ' } }'; }
  else if ( Object.prototype.toString.call( thing ) === '[object Date]' ) { return '{ object-Date: { ISOstring: ' + thing.toISOString() + ', value: ' + thing.valueOf() + ' } }'; }
  else if ( typeof( thing ) != 'object' ) { return thing; }
  else {
    let objType = ( thing ? 'object-' + thing.constructor.name : typeof( thing ) );
    let objId = ( thing ? thing.id : 'no.id' );
    let objName = ( thing ? ( thing.displayName || thing.globalName || thing.name ) : 'no.name' );
    return '{ ' + objType + ': { id: ' + objId + ', name: ' + objName + ' } }';
  }
};

client.on( 'messageCreate', async ( message ) => {
  try {
    const { author, channel, content, guild, mentions } = message;
    if ( channel.type !== 0 && channel.type !== 10 && channel.type !== 11 && channel.type !== 12 ) return;//Not a text channel within a guild
    const { applicationId, authorId, webhookId } = message.toJSON();
    if ( !applicationId && webhookId === authorId ) return;//It's a webhook
    const allowedBots = [];
    const isAllowedBot = ( allowedBots.indexOf( author.id ) != -1 ? true : false );
    if ( author.bot && !isAllowedBot ) return;//It's a bot that is not allowed
    const { botOwner, checkPermission, clientId, errors, isBlacklisted, isBotMod, isBotOwner, isDevGuild, isGlobalWhitelisted, isGuildBlacklisted, prefix } = await userPerms( author, guild );
    if ( errors.hasNoMember ) {
      throw new Error( errors.noMember.console + '\n\tisBot: ' + ( author.bot ? 'true' : 'false' ) + '\n\tapplicationId: ' + applicationId + '\n\twebhookId: ' + webhookId );
    }
    const bot = client.user;
    const members = guild.members.cache;

    const gcWhitelist = [ 'GCD' ];
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
    var arrGcCodes = [], arrPrCodes = [], arrTbCodes = [], arrOtherCodes = [];
    const arrContent = content.trim().split( ' ' );
    const arrOtherTypeCodes = [ 'GC', 'TB', 'WM', 'GL', 'TL', 'PR', 'BM', 'GT' ];
    const oldRegex = new RegExp('^((?:GC|TB|WM|GL|TL|PR|BM|GT)[a-fA-F0-9]{2,3})', 'g' );
    const newRegex = new RegExp('^((?:GC|TB|WM|GL|TL|PR|BM|GT)[a-hjkmnp-rtv-zA-HJKMNP-RTV-Z0-9]{4,7})', 'g' );
    for ( let word of arrContent ) {
      let arrWord = word.trim().match( word.length <= 5 ? oldRegex : newRegex );
      let code = ( arrWord ? arrWord[ 0 ].toUpperCase() : ( gcWhitelist.indexOf( word ) != -1 ? word.toUpperCase() : '' ) );
      let wordPrefix = code.slice( 0, 2 );
      if ( wordPrefix === 'GC' ) {
        arrGcCodes.push( code );
        hasCodes.GC = true;
      }
      else if ( wordPrefix === 'PR' ) {
        arrPrCodes.push( code );
        hasCodes.PR = true;
      }
      else if ( wordPrefix === 'TB' ) {
        arrTbCodes.push( code );
        hasCodes.TB = true;
      }
      else if ( arrOtherTypeCodes.indexOf( wordPrefix ) != -1 ) {
        arrOtherCodes.push( code );
        hasCodes[ wordPrefix ] = true;
      }
    }
    arrGcCodes = arrGcCodes.filter( ( val, i, arr ) => { return i == arr.indexOf( val ); } );
    arrPrCodes = arrPrCodes.filter( ( val, i, arr ) => { return i == arr.indexOf( val ); } );
    arrTbCodes = arrTbCodes.filter( ( val, i, arr ) => { return i == arr.indexOf( val ); } );
    arrOtherCodes = arrOtherCodes.filter( ( val, i, arr ) => { return i == arr.indexOf( val ); } );

    const hasPrefix = ( content.startsWith( prefix ) || content.startsWith( '§' ) );
    const meMentionPrefix = '<@' + clientId + '>';
    const mePrefix = content.startsWith( meMentionPrefix );
    const mentionsMe = mentions.users.has( clientId );
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

      if ( isBlacklisted && !isGlobalWhitelisted ) {
        return message.reply( { content: 'You\'ve been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server.' : '.' ) } );
      }
      else if ( command ) {
        const isOwnerOnly = command.ownerOnly;
        const isModOnly = command.modOnly;
        if ( isOwnerOnly && !isBotOwner ) {
          if ( isBotMod ) { return message.reply( { content: `That is an **owner only command**, speak to <@${botOwner.id}>.` } ); }
          else { /* DO NOTHING */ }
        }
        else if ( isModOnly && !isBotMod ) { /* DO NOTHING */ }
        else {
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
              if ( !members.get( bot.id ).permissions.has( PermissionsBitField.resolve( command.botPerms || [] ) ) ) {
                const botPerms = new EmbedBuilder()
                .setDescription( `🚫 ${author}, I don't have \`${command.botPerms}\` permissions to use this command!` )
                .setColor( 'Red' )
                return message.reply( { embeds: [ botPerms ] } );
              }
            }

            command.run( client, message, args );
            cooldown.set( `${command.name}${author.id}`, Date.now() + command.cooldown );
            setTimeout( () => { cooldown.delete( `${command.name}${author.id}` ) }, command.cooldown );
          }
          else {
            if ( command.userPerms || command.botPerms ) {
              if ( !message.member.permissions.has( PermissionsBitField.resolve( command.userPerms || [] ) ) ) {
                const userPerms = new EmbedBuilder()
                .setDescription( `🚫 ${message.author}, You don't have \`${command.userPerms}\` permissions to use this command!` )
                .setColor( 'Red' )
                return message.reply( { embeds: [userPerms] } );
              }

              if ( !members.get( bot.id ).permissions.has( PermissionsBitField.resolve( command.botPerms || [] ) ) ) {
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
      const intCodes = arrGcCodes.length + arrPrCodes.length + arrTbCodes.length + arrOtherCodes.length;
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
      const codesResponse = await message.reply( strCodes );
      for ( let prCode of arrPrCodes ) {
        await codesResponse.edit( strCodes + '\n<:Signal:398980726000975914> ...attempting to gather information about [' + prCode + '](<https://coord.info/' + prCode + '>)...' );
        let objUser = await cacheinfo( prCode );
        if ( objUser.failed ) {
          strCodes += '\n<:RIP:1015415145180176535> **Failed to get info for __[' + prCode + '](<https://coord.info/' + prCode + '>)__: ' + objUser.error + '...**';
          await codesResponse.edit( strCodes );
        } else {
          let userName = objUser.username;
          userName = userName.replace( /\p{Emoji_Presentation}/gu, '�' );
          strCodes += '\n';
          if ( objUser.basic ) { strCodes += '<:basic:398980530017927198>'; }
          else { strCodes += '<:premium:398980560963239936>'; }//Premium, Lacky, Reviewer --- no idea --- just use premium icon
          strCodes += ' [`' + prCode + '`: ' + userName + '](<https://coord.info/' + objUser.code + '>)';
          if ( objUser.basic ) { strCodes += ' (🎁 [Gift Membership](<https://payments.geocaching.com/gift?uguid=' + objUser.guid + '>))'; }
          await codesResponse.edit( strCodes );
        }
      }
      for ( let gcCode of arrGcCodes ) {
        await codesResponse.edit( strCodes + '\n<:Signal:398980726000975914> ...attempting to gather information about [' + gcCode + '](<https://coord.info/' + gcCode + '>)...' );
        let objCache = await cacheinfo( gcCode );
        if ( objCache.failed ) {
          strCodes += '\n<:RIP:1015415145180176535> **Failed to get info for __[' + gcCode + '](<https://coord.info/' + gcCode + '>)__: ' + objCache.error + '...**';
          await codesResponse.edit( strCodes );
        } else {
          let cacheName = objCache.name;
          cacheName = cacheName.replace( /\p{Emoji_Presentation}/gu, '�' );
          let cacheTypeIcon = ( Object.keys( gcCacheTypeIcons ).indexOf( objCache.type ) != -1 ? gcCacheTypeIcons[ objCache.type ] : '⁉' );
          if ( cacheTypeIcon === '⁉' ) { botOwner.send( { content: '`' + objCache.type + '` for __[' + gcCode + '](<https://coord.info/' + gcCode + '>)__ in https://discord.com/channels/' + guild.id + '/' + channel.id + ' is not a known type of cache.' } ) }
          strCodes += '\n';
          if ( objCache.pmo ) { strCodes += '<:PMO:1293693055127519315>'; }
          if ( objCache.archived || objCache.locked ) { strCodes += '<:archived:467385636173905942>'; }
          else if ( objCache.disabled ) { strCodes += '<:disabled:467385661415227393>'; }
          let dtURL = '[[' + objCache.difficulty + '/' + objCache.terrain + ']](<https://www.geocaching.com/help/index.php?pg=kb.page&inc=1&id=82>)';
          strCodes += cacheTypeIcon + ' [`' + gcCode + '`: ' + cacheName + '](<https://coord.info/' + objCache.code + '>) by ' + objCache.nameCO + ' ' + dtURL;
          await codesResponse.edit( strCodes );
        }
      }
      for ( let tbCode of arrTbCodes ) {//SOON™
        await codesResponse.edit( strCodes + '\n<:Signal:398980726000975914> ...attempting to gather information about [' + tbCode + '](<https://coord.info/' + tbCode + '>)...' );
        let objTrack = await cacheinfo( tbCode );
        if ( objTrack.failed ) {
          strCodes += '\n<:RIP:1015415145180176535> **Failed to get info for __[' + tbCode + '](<https://coord.info/' + tbCode + '>)__: ' + objTrack.error + '...**';
          await codesResponse.edit( strCodes );
        } else {
          let tbName = objTrack.name;
          tbName = tbName.replace( /\p{Emoji_Presentation}/gu, '�' );
          strCodes += '\n';
          strCodes += ' [`' + tbCode + '`: ' + tbName + '](<https://coord.info/' + objTrack.code + '>)';
          await codesResponse.edit( strCodes );
        }
      }
      for ( let code of arrOtherCodes ) { strCodes += '\n\t' + code + ' :link: <https://coord.info/' + code + '>'; }
      codesResponse.edit( strCodes );
    }
  }
  catch ( errObject ) {
    const { author, channel, content, guild } = message;
    console.error( 'Uncaught error in %s:\n\t%s\n\tI was processing a message from %s in https://discord.com/channels/%s/%s\n%s\n-----',
    strScript, errObject.stack, getDebugString( author ), guild.id, channel.id, content );
  }
} );