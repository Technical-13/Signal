const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const userConfig = require( '../models/BotUser.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const userPerms = require( '../functions/getPerms.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const createNewUser = require( '../functions/createNewUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const botVerbosity = client.verbosity;
const verUserDB = config.verUserDB;
const strScript = chalk.hex( '#FFA500' ).bold( './events/guildMemberUpdate.js' );
Array.prototype.getDiff = function( arrOld ) { return this.filter( o => !arrOld.includes( o ) ) };

client.on( 'guildMemberUpdate', async ( oldMember, newMember ) => {
  try {
    const { guild, user } = newMember;
    const { isGuildOwner } = await userPerms( user, guild );

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) { await createNewUser( user ); }
    var findCurrUser = await userConfig.findOne( { _id: user.id } );
    const findThisGuild = [];
    findCurrUser.Guilds.forEach( ( entry, i ) => { findThisGuild.push( entry._id ); } );
    if ( findThisGuild.indexOf( guild.id ) === -1 ) { await addUserGuild( user.id, guild ); }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const storedUserGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
    const ndxUserGuild = storedUserGuilds.indexOf( guild.id );
    const currUserGuild = currUser.Guilds[ ndxUserGuild ];
    const newName = ( oldMember.displayName != newMember.displayName ? true : false );
    const newRoles = ( oldMember.roles != newMember.roles ? true : false );
    var doUserUpdate = false;
    if ( newName ) {// Changed nickname
      if ( botVerbosity >= 2 ) { console.log( 'Changing U:%s to U:%s in my database...', chalk.bold.red( oldMember.displayName ), chalk.bold.green( newMember.displayName ) ); }
      currUserGuild.UserName = newMember.displayName;
      doUserUpdate = true;
    }
    if ( newRoles ) {// Added or Removed roles
      let newRoleIds = Array.from( newMember.roles.cache.keys() );
      let oldRoleIds = Array.from( oldMember.roles.cache.keys() );
      let addedRoleIds = newRoleIds.getDiff( oldRoleIds );
      if ( botVerbosity >= 2 && addedRoleIds.length >= 1 ) { console.log( 'Added %s role%s to U:%s in my database...', chalk.bold.green( addedRoleIds.length ), ( addedRoleIds.length == 1 ? '' : 's' ), chalk.bold.green( user.displayName ) ); }
      let removedRoleIds = oldRoleIds.getDiff( newRoleIds );
      if ( botVerbosity >= 2 && removedRoleIds.length >= 1 ) { console.log( 'Removed %s role%s from U:%s in my database...', chalk.bold.red( removedRoleIds.length ), ( removedRoleIds.length == 1 ? '' : 's' ), chalk.bold.red( user.displayName ) ); }
      currUserGuild.Roles = newRoleIds;
      doUserUpdate = true;
    }
    if ( doUserUpdate ) {
      if ( botVerbosity >= 2 ) { console.log( '\tUpdating U:%s in my database...', chalk.bold.yellow( user.displayName ) ); }
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .then( updateSuccess => { console.log( '\t\tSuccesfully updated U:%s in my database.', chalk.bold.yellow( user.displayName ) ); } )
      .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( '\t\tError attempting to update guild %s (id: %s) for user %s (id: %s) in my database in getPerms.js:\n%o' ), guild.name, guild.id, user.displayName, user.id, updateError ); } );
    }

    if ( isGuildOwner ) {
      const currGuildConfig = await getGuildConfig( guild, true );
      const newOwnerName = ( newMember.displayName !== currGuildConfig.Guild.OwnerName ? true : false );
      var doGuildUpdate = false;
      if ( newOwnerName ) {
        currGuildConfig.Guild.OwnerName = newMember.displayName;
        doGuildUpdate = true;
      }
      if ( doGuildUpdate ) {
        currGuildConfig.Guild.Members = guild.members.cache.size;
        await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
        .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update %s (id: %s) in my database:\n%o' ), guild.name, guild.id, updateError ); } );
      }
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
} );