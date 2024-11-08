const { model, Schema } = require( 'mongoose' );

let guildSchema = new Schema( {
  _id: String,
  Bans: [ {
    _id: String,
    BanBy: {
      ID: String,
      Name: String
    },
    Expires: Date
  } ],
  Blacklist: {
    Members: [ String ],
    Roles: [ String ]
  },
  Commands: [ String ],
  Expires: Date,
  Guild: {
    Name: String,
    Members: Number,
    OwnerID: String,
    OwnerName: String
  },
  Invite: String,
  Logs: {
    Active: Boolean,
    Chat: String,
    Default: String,
    Error: String,
    JoinPart: String
  },
  Part: {
    Active: Boolean,
    Channel: String,
    Message: String,
    SaveRoles: Boolean
  },
  Prefix: String,
  Premium: Boolean,
  Version: Number,
  Welcome: {
    Active: Boolean,
    Channel: String,
    Message: String,
    Role: String
  },
  Whitelist: {
    Members: [ String ],
    Roles: [ String ]
  }
} );

module.exports = model( 'GuildConfig', guildSchema );