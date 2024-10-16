const { model, Schema } = require( 'mongoose' );

let logSchema = new Schema( {
  Guild: String,
  Invite: String,
  Logs: {
    Chat: String,
    Default: String,
    Error: String
  },
  Welcome: {
    Active: Boolean,
    Channel: String,
    Msg: String,
    Role: String
  }
} );

module.exports = model( 'GuildConfig', logSchema );