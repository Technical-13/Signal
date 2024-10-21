const { model, Schema } = require( 'mongoose' );

let guildSchema = new Schema( {
  Guild: String,
  Blacklist: [ String ],
  Whitelist: [ String ],
  Invite: String,
  Logs: {
    Active: Boolean,
    Chat: String,
    Default: String,
    Error: String
  },
  Prefix: String,
  Welcome: {
    Active: Boolean,
    Channel: String,
    Msg: String,
    Role: String
  }
} );

module.exports = model( 'GuildConfig', guildSchema );