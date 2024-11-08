const mongoose = require( 'mongoose' );
const chalk = require( 'chalk' );
const guildConfig = require( './models/GuildConfig.js' );
const config = require( './config.json' );
require( 'dotenv' ).config();
const ENV = process.env;
const strConnectDB = ( ENV.mongodb || '' );
mongoose.set( 'strictQuery', false );

try {
  mongoose.disconnect()
  .then( async dbDisconnected => {
    console.log( chalk.yellow( 'MongoDB closed.' ) );
    await mongoose.connect( strConnectDB )
    .then( async dbConnected => {
      console.log( chalk.greenBright( 'Connected to MongoDB.' ) );
      const dbGuilds = await guildConfig.find();
      for ( let dbGuild of dbGuilds ) {
        let Blacklist = ( dbGuild.Blacklist || { Members: [], Roles: [] } );
        let Logs = ( dbGuild.Logs || { Active: true, Chat: null, Default: null, Error: null, strClosing: logClosing( null ) } );
        let Welcome = ( dbGuild.Welcome || { Active: false, Channel: null, Message: null, Role: null } );
        let Whitelist = ( dbGuild.Whitelist || { Members: [], Roles: [] } );
        let updatedEntry = {
          _id: dbGuild.Guild,
          Bans: [],
          Blacklist: Blacklist,
          Commands: dbGuild.Commands,
          Expires: dbGuild.Expires,
          Guild: {
            Name: '',
            Members: 0,
            OwnerID: '',
            OwnerName: ''
          },
          Invite: dbGuild.Invite,
          Logs: Logs,
          Part: {
            Active: false,
            Channel: null,
            Message: null,
            SaveRoles: false
          },
          Prefix: ( dbGuild.Prefix || config.prefix || '!' ),
          Premium: dbGuild.Premium,
          Version: 0,
          Welcome: Welcome,
          Whitelist: Whitelist
        };
        guildConfig.create( updatedEntry )
        .then( createNew => {
          console.log( 'Created new entry for %s from %s.', dbGuild.Guild, dbGuild._id );
          guildConfig.deleteOne( { _id: dbGuild._id } )
          .then( deleteOld => { console.log( 'Deleted old entry for %s.', dbGuild._id ); } )
          .catch( deleteFailed => { console.error( 'Failed to delete dbGuild for %s: %o', dbGuild._id, createFailed ); } );
        } )
        .catch( createFailed => { console.error( 'Failed to create updatedEntry for %s: %o', dbGuild._id, createFailed ); } );
      }
    } )
    .catch( dbConnectErr => { console.error( chalk.bold.red( 'Failed to connect to MongoDB:\n%s' ), dbConnectErr.stack ); } );
  } )
  .catch( dbDisconnectErr => { console.error( chalk.bold.red( 'Failed to disconnect from MongoDB:\n%s' ), dbDisconnectErr.stack ); } );
}
catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './FixDB.js' ), errObject.stack ); }