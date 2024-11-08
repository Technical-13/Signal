const { model, Schema } = require( 'mongoose' );

let botSchema = new Schema( {
  _id: String,
  Blacklist: [ String ],
  DevGuild: String,
  IssueRepo: String,
  Logs: {
    Default: String,
    Error: String,
    JoinPart: String
  },
  Mods: [ String ],
  Name: String,
  Owner: String,
  Prefix: String,
  Version: Number,
  Whitelist: [ String ]
} );

module.exports = model( 'BotConfig', botSchema );