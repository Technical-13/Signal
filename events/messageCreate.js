const client = require( '..' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const ms = require( 'ms' );
const prefix = client.prefix;
const cooldown = new Collection();
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

  var hasGC = false, hasTB = false;
  const arrGcTbCodes = [];
  const arrContent = content.trim().split( ' ' );
  for ( let word of arrContent ) {
    word = word.trim().toUpperCase();
    if ( word.startsWith( 'GC' ) ) {
      arrGcTbCodes.push( word );
      hasGC = true;
    } else if ( word.startsWith( 'TB' ) ) {
      arrGcTbCodes.push( word );
      hasTB = true;
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
  
  if ( hasGC || hasTB ) {
console.log( 'I found the following codes!\n\t%o', arrGcTbCodes );
    let strCodes = ( hasGC ? ( hasTB ? 'GC & TB' : 'GC' ) : 'TB' ) + ' code(s) detected, here are links:';
console.log( 'strCodes:\n\t%o', strCodes );
    for ( let code of arrGcTbCodes ) { strCodes += '\n\t' + code + ' :link: https://coord.info/' + code; }
console.log( 'strCodes final:\n\t%o', strCodes );
    channel.send( strCodes );
  }
} );
