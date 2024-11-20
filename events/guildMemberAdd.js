const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const createNewUser = require( '../functions/createNewUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const errHandler = require( '../functions/errorHandler.js' );
const parse = require( '../functions/parser.js' );
const botVerbosity = client.verbosity;
const verUserDB = config.verUserDB;
const strScript = chalk.hex( '#FFA500' ).bold( './events/guildMemberAdd.js' );

client.on( 'guildMemberAdd', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild, user } = member;
    const currGuildConfig = await getGuildConfig( guild, true );

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) { await createNewUser( user ); }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const storedUserGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
    let ndxUserGuild = storedUserGuilds.indexOf( guild.id );
    if ( ndxUserGuild === -1 ) {
      if ( botVerbosity >= 2 ) { console.log( 'Adding G:%s to U:%s.', chalk.bold.green( guild.name ), chalk.bold.green( user.displayName ) ); }
      await addUserGuild( user.id, guild );
    }
    else {
      if ( botVerbosity >= 2 ) { console.log( 'Clearing %s Date from G:%s for U:%s.', chalk.bold.red( 'Expires' ), chalk.bold.green( guild.name ), chalk.bold.green( user.displayName ) ); }
      let currUserGuild = currUser.Guilds[ ndxUserGuild ];
      if ( currGuildConfig.Part.SaveRoles && currUserGuild.Roles.length != 0 ) {
        member.roles.add( currUserGuild.Roles, 'Restoring user roles on rejoin.' )
        .then( rolesAdded => {
          if ( botVerbosity >=2 ) { console.log( '\tRestored %s roles in G:%s for U:%s', chalk.bold.green( currUserGuild.Roles.length ), chalk.bold.green( guild.name ), chalk.bold.green( user.displayName ) ); }
        } )
        .catch( async errRoles => {
          if ( doLog && chanError ) { chanError.send( await errHandler( errRoles, { command: strScript, member: member, type: 'errRole', debug: true } ) ); }
          throw new Error( chalk.bold.cyan.inverse( `\tError attempting to restore roles in G:${guild.name} for U:${currUser.UserName} from my database in ${strScript}:\n${errRoles}` ) );
        } );
      }
      currUserGuild.Expires = null;
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( `\tError attempting to update G:${guild.name} for U:${currUser.UserName} to expire ${dbExpires} in my database in ${strScript}:\n${updateError}` ) ); } );
    }

    currGuildConfig.Guild.Members = guild.members.cache.size;
    await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
    .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( `\tError attempting to update G:${guild.name} in my database:\n${updateError}` ) ); } );

    const { Active: doLog, chanDefault, chanError } = currGuildConfig;
    const doWelcome = ( !currGuildConfig ? false : ( !currGuildConfig.Welcome ? false : ( currGuildConfig.Welcome.Active || false ) ) );
    if ( doWelcome ) {
      const welcomeChan = ( !currGuildConfig.Welcome.Channel ? member : member.guild.channels.cache.get( currGuildConfig.Welcome.Channel ) );
      const welcomeMsg = await parse( currGuildConfig.Welcome.Msg || 'Welcome {{member.ping}}!\n**{{server.name}}** now has {{server.members}} members!\nPlease reach out to the server owner, {{server.owner.ping}} if you need any help!', { member: member } );
      const welcomeRole = ( !currGuildConfig.Welcome.Role ? null : member.guild.roles.cache.get( currGuildConfig.Welcome.Role ) );
      welcomeChan.send( { content: welcomeMsg } )
      .then( welcomeSent => {
        if ( welcomeRole ) {
          member.roles.add( welcomeRole, 'New member! - use `/config welcome` to change.' )
          .then( roleAdded => {
            if ( doLog && chanDefault ) {
              chanDefault.send( { content: 'Successfully welcomed <@' + member.id + '> to the server and gave them the <@&' + welcomeRole + '> role.' } );
            }
          } )
          .catch( async errRole => {
            if ( doLog && chanError ) { chanError.send( await errHandler( errRole, { command: strScript, member: member, type: 'errRole', debug: true } ) ); }
          } );
        }
        if ( !welcomeRole && doLog && chanDefault ) {
          chanDefault.send( { content: 'Successfully welcomed <@' + member.id + '> to the server.' } );
        }
      } )
      .catch( async errSend => {
        if ( doLog && chanError ) {
          chanError.send( await errHandler( errSend, { command: 'guildMemberAdd', type: 'errSend' } ) );
        }
      } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
} );