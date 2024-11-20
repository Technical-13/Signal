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
  Prefix: { type: String, default: "!" },
  Verbosity: { type: Number, default: 5 },
  Version: Number,
  Whitelist: [ String ]
}, { timestamps: true } );

module.exports = model( 'BotConfig', botSchema );