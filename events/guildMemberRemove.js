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
const duration = require( '../functions/duration.js' );
const botVerbosity = client.verbosity;
const verUserDB = config.verUserDB;
const strScript = chalk.hex( '#FFA500' ).bold( './events/guildMemberRemove.js' );

client.on( 'guildMemberRemove', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild, user } = member;
    const dbExpires = new Date( ( new Date() ).setMonth( ( new Date() ).getMonth() + 1 ) );

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) { await createNewUser( user ); }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const storedUserGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
    const ndxUserGuild = storedUserGuilds.indexOf( guild.id );
    if ( ndxUserGuild != -1 ) {
      let currUserGuild = currUser.Guilds[ ndxUserGuild ];
      if ( botVerbosity >=2 ) { console.log( 'U:%s G:%s Expires: %o', chalk.bold.redBright( currUser.UserName ), chalk.bold.redBright( currUserGuild.GuildName ), dbExpires ); }
      currUserGuild.Expires = dbExpires;
      userConfig.updateOne( { _id: user.id }, currUser, { upsert: true } )
      .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update guild %s (id: %s) for user %s (id: %s) to expire %o in my database in guildMemberRemove.js:\n%o' ), guild.name, guild.id, user.displayName, user.id, dbExpires, updateError ); } );
    }

    const currGuildConfig = await getGuildConfig( guild, true );
    currGuildConfig.Guild.Members = guild.members.cache.size;
    await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
    .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update %s (id: %s) in my database:\n%o' ), guild.name, guild.id, updateError ); } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
} );