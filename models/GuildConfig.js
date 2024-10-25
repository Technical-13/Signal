const { model, Schema } = require( 'mongoose' );

let guildSchema = new Schema( {
  Guild: String,
  Blacklist: { Members: [ String ], Roles: [ String ] },
  Commands: [ String ],
  Invite: String,
  Logs: {
    Active: Boolean,
    Chat: String,
    Default: String,
    Error: String
  },
  Prefix: String,
  Premium: Boolean,
  Welcome: {
    Active: Boolean,
    Channel: String,
    Msg: String,
    Role: String
  },
  Whitelist: { Members: [ String ], Roles: [ String ] }
} );

module.exports = model( 'GuildConfig', guildSchema );