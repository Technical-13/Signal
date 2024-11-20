const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const getBotConfig = require( '../functions/getBotDB.js' );
const botVerbosity = client.verbosity;
const verGuildDB = config.verGuildDB;
const strScript = chalk.hex( '#FFA500' ).bold( './functions/createNewGuild.js' );

module.exports = async ( guild ) => {
  try {
    if ( !guild ) { throw new Error( chalk.bold.red( `No guild: ${guild}` ) ); }
    if ( await guildConfig.countDocuments( { _id: guild.id } ) === 0 ) {
      const botConfig = await getBotConfig();
      const globalPrefix = ( botConfig.Prefix || config.prefix || '!' );
      const guildOwner = guild.members.cache.get( guild.ownerId );
      const newGuildConfig = {
        _id: guild.id,
        Bans: [],
        Blacklist: {
          Members: [],
          Roles: []
        },
        Commands: [],
        Expires: null,
        Guild: {
          Name: guild.name,
          Members: guild.members.cache.size,
          OwnerID: guild.ownerId,
          OwnerName: guildOwner.displayName
        },
        Invite: null,
        Logs: {
          Active: true,
          Chat: null,
          Default: null,
          Error: null
        },
        Part: {
          Active: false,
          Channel: null,
          Message: null,
          SaveRoles: true
        },
        Prefix: globalPrefix,
        Premium: true,
        Version: verGuildDB,
        Welcome: {
          Active: false,
          Channel: null,
          Message: null,
          Role: null
        },
        Whitelist: {
          Members: [],
          Roles: []
        }
      };
      return await guildConfig.create( newGuildConfig )
      .then( initSuccess => { return newGuildConfig; } )
      .catch( initError => { throw new Error( chalk.bold.cyan.inverse( `Error attempting to add guild ${guild.name} (id: ${guild.id}) to my database:\n${initError}` ) ); } );
    }
    else { console.error( 'Guild %s (%s) already exists in my database.', user.id, user.displayName ); }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};