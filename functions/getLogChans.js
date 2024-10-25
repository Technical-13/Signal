const client = require( '..' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../models/GuildConfig.js' );

module.exports = async ( guild ) => {
  const ownerId = ( config.botOwnerId || process.env.OWNER_ID );
  const botOwner = client.users.cache.get( ownerId );
  const strConsole = '  Please check the console for details.';
  
  const globalPrefix = ( client.prefix || config.prefix || '!' );
  
  try {
    var guildConfig = { Logs: { Active: true, Chat: null, Default: null, Error: null } };
    var doLogs = false;
    var chanDefault = null;
    var chanError = null;
    var chanChat = null;
    var strClosing = '';
    
    if ( guild ) {
      const createConfig = {
        Guild: guild.id,
        Blacklist: { Members: [], Roles: [] },
        Commands: [],
        Invite: null,
        Logs: { Active: true, Chat: null, Default: null, Error: null },
        Prefix: globalPrefix,
        Premium: true,
        Welcome: { Active: false, Channel: null, Msg: null, Role: null },
        Whitelist: { Members: [], Roles: [] }
      };
      guildConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( async errFind => {
        console.error( 'Error attempting to find %s (ID:%s) in my database in config.js:\n%s', guild.name, guild.id, errFind.stack );
        await guildConfigDB.create( createConfig )
        .then( createSuccess => {
          console.log( 'Created a default DB entry for %s that was not set up.', guild.name );
          botOwner.send( 'Error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database, so I created it with default config.' );
        } )
        .catch( createError => {
          console.error( 'Error attempting to create %s (ID:%s) guild configuration in my database in config.js:\n%s', guild.name, guild.id, createError.stack );
          botOwner.send( 'Error attempting to create `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database.  Please check console for details.' );
        } );
        return createConfig;
      } );
      if ( !guildConfig ) {
        await guildConfigDB.create( createConfig )
        .then( createSuccess => {
          console.log( 'Created a default DB entry for %s that was not set up.', guild.name );
          botOwner.send( 'Error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database, so I created it with default config.' );
        } )
        .catch( createError => {
          console.error( 'Error attempting to create %s (ID:%s) guild configuration in my database in config.js:\n%s', guild.name, guild.id, createError.stack );
          botOwner.send( 'Error attempting to create `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database.  Please check console for details.' );
        } );
        guildConfig = createConfig;
      }
    
      doLogs = ( guildConfig.Logs.Active || true );
      guildOwner = guild.members.cache.get( guild.ownerId );
      chanDefault = ( guildConfig.Logs.Default ? guild.channels.cache.get( guildConfig.Logs.Default ) : guildOwner );
      chanError = ( guildConfig.Logs.Error ? guild.channels.cache.get( guildConfig.Logs.Error ) : chanDefault );
      chanChat = ( guildConfig.Logs.Chat ? guild.channels.cache.get( guildConfig.Logs.Chat ) : chanDefault );
      
      strClosing = '\n' + ( chanDefault == guildOwner ? '\nPlease run `/config set` to have these logs go to a channel in the [' + guild.name + '](<https://discord.com/channels/' + guild.id + '>) server or deactivate them instead of to your DMs.' : '\n----' );
    }
  
    return {
      doLogs: doLogs,
      chanDefault: chanDefault,
      chanError: chanError,
      chanChat: chanChat,
      strClosing: strClosing
    };
  } catch ( errLogChans ) { console.error( 'Error in getLogChans.js: %s', errLogChans.stack ); }
};