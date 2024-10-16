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
    Guild: String,
    Channel: String,
    Msg: String,
    Role: String
  }
} );

module.exports = model( 'GuildConfig', logSchema );