const client = require( '..' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const getBotConfig = require( './getBotDB.js' );
const createNewGuild = require( './createNewGuild.js' );
const ENV = process.env;
const chalk = require( 'chalk' );
const verGuildDB = config.verGuildDB;

module.exports = async ( guild ) => {
  try {
    if ( !guild ) { throw new Error( 'No guild to get.' ); }
    const guildOwner = await guild.members.cache.get( guild.ownerId );
    if ( !guildOwner ) {
      await guild.leave()
      .then( left => { throw new Error( 'I left guild %s (id: %s) because its owner with id: %s, is invalid.', guild.name, guild.id, guild.ownerId ); } )
      .catch( stayed => { throw new Error( 'I could NOT leave guild %s (id: %s) with invalid owner id: %s:\n%o', guild.name, guild.id, guild.ownerId, stayed ); } );
    }
    const logClosing = ( defaultId ) => { return '\n' + ( defaultId == null ? 'Please run `/config logs` to have these logs go to a channel in the [' + guild.name + '](<https://discord.com/channels/' + guild.id + '>) server or deactivate them instead of to your DMs.' : '----' ); }

    if ( await guildConfig.countDocuments( { _id: guild.id } ) === 0 ) { await createNewGuild( guild ); }
    const currConfig = await guildConfig.findOne( { _id: guild.id } );
    currConfig.Logs.strClosing = await logClosing( currConfig.Logs.Default );
    return currConfig;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( 'getGuildDB.js' ), errObject.stack ); }
};