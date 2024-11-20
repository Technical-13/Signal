const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const userConfig = require( '../models/BotUser.js' );
const createNewUser = require( './createNewUser.js' );
const botVerbosity = client.verbosity;
const strScript = chalk.hex( '#FFA500' ).bold( './functions/addUserGuild.js' );

module.exports = async ( id, guild ) => {
  try {
    if ( !id ) { throw new Error( chalk.bold.red( `No id: ${id}` ) ); }
    if ( !( /[\d]{17,19}/.test( id ) ) ) { throw new Error( chalk.bold.red( `id is not a snowflake: ${id}` ) ); }
    if ( !guild ) { throw new Error( chalk.bold.red( `No guild for userId:${id}: ${guild}` ) ); }
    const user = client.users.cache.get( id );
    if ( !user ) { throw new Error( chalk.bold.red( `id in ${strScript} (${id}) is not a known user.id: ${user}` ) ); }
    const member = guild.members.cache.get( id );
    if ( !member ) { throw new Error( chalk.bold.red( `Member id:${id} for ${user.displayName} was not found in guild id${guild.id} for ${guild.name}: ` ) + Array.from( guild.members.cache.keys() ) ); }
    if ( await userConfig.countDocuments( { _id: id } ) === 0 ) { await createNewUser( user ); }
    const currUser = await userConfig.findOne( { _id: id } );
    const addGuild = {
      _id: guild.id,
      Corrections: [],
      Expires: null,
      GuildName: guild.name,
      MemberName: member.displayName,
      Roles: Array.from( member.roles.cache.keys() ),
      Score: 0
    };
    currUser.Guilds.push( addGuild );
    currUser.Guildless = null;
    return userConfig.updateOne( { _id: id }, currUser, { upsert: true } )
    .then( updatedUser => { return currUser; } )
    .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( `Error attempting to add guild ${guild.name} (id: ${guild.id}) to user ${user.displayName} (id: ${id}) in my database in addUserGuild.js:\n${updateError}` ) ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};