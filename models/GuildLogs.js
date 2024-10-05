const { model, Schema } = require( 'mongoose' );

let logSchema = new Schema( {
  Guild: String,
  Invite: String,
  Logs: {
    Default: String,
    Error: String,
    Chat: String
  },
  Welcome: {
    Active: Boolean,
    Message: String
  }
} );

module.exports = model( 'GuildLogs', logSchema );
