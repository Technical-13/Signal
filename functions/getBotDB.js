const client = require( '..' );
require( 'dotenv' ).config();
const ENV = process.env;
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const botConfig = require( '../models/BotConfig.js' );
const verBotDB = config.verBotDB;
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getBotDB.js' );

module.exports = async () => {
  try {
    const logChansConfig = ( !config ? null : ( !config.logChans ? null : config.logChans ) );
    const logChansEnv = ( ENV.logChans || null );
    const clientId = ( config.clientID || ENV.CLIENT_ID || client.id || null );
    const botOwnerID = ( config.botOwnerId || ENV.OWNER_ID || null );
    const devGuildId = ( config.devGuildId || ENV.DEV_GUILD_ID || null );
    const newBot = ( await botConfig.countDocuments( { _id: clientId } ) === 0 ? true : false );
    if ( !newBot ) {
      const currConfig = await botConfig.findOne( { _id: clientId } );
      const configVersion = ( !currConfig.Version ? 0 : currConfig.Version );
      if ( configVersion === verBotDB ) { return currConfig; }
      else {
        const currLogs = ( currConfig.Logs || { Default: ( logChansConfig.Default || logChansEnv.Default || null ), Error: ( logChansConfig.Error || logChansEnv.Error || null ), JoinPart: ( logChansConfig.JoinPart || logChansEnv.JoinPart || null ) } );
        const updatedBotConfig = {
          _id: clientId,
          Blacklist: ( currConfig.Blacklist || [] ),
          DevGuild: ( currConfig.DevGuild || devGuildId ),
          IssueRepo: ( currConfig.IssueRepo || config.issueRepo || null ),
          Logs: {
            Default: ( currLogs.Default ),
            Error: ( currLogs.Error ),
            JoinPart: ( currLogs.JoinPart )
          },
          Mods: ( currConfig.Mods || config.moderatorIds || [] ),
          Name: ( currConfig.Name || config.botName || ENV.BOT_USERNAME ),
          Owner: ( currConfig.Owner || botOwnerID ),
          Prefix: ( currConfig.Prefix || config.prefix || '!' ),
          Verbosity: ( currConfig.Verbosity || ENV.VERBOSITY || -1 ),
          Version: verBotDB,
          Whitelist: ( currConfig.Whitelist || [] )
        };
        return await botConfig.updateOne( { _id: clientId }, updatedBotConfig, { upsert: true } )
        .then( updateSuccess => { return updatedBotConfig; } )
        .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update bot config in my database:\n%o' ), updateError ); } );
      }
    }
    else if ( newBot && ( !clientId || !botOwnerID || !devGuildId ) ) {
      let missingRequired = ' missing attempting to initialize bot configuration in my database. Please add it to config.js and/or .env and try again.';
      if ( !clientId ) { throw new Error( chalk.bold.redBright( 'clientId' + missingRequired ) ); }
      if ( !botOwnerID ) { throw new Error( chalk.bold.redBright( 'botOwnerID' + missingRequired ) ); }
      if ( !devGuildId ) { throw new Error( chalk.bold.redBright( 'devGuildId' + missingRequired ) ); }
    }
    else {
      console.log( 'Initializing bot in database...' );
      const newBotConfig = {
        _id: clientId,
        Blacklist: [],
        DevGuild: devGuildId,
        IssueRepo: ( config.issueRepo || null ),
        Logs: {
          Default: ( ( !logChansConfig ? null : logChansConfig.Default ) || ( !logChansEnv ? null : logChansEnv.Default ) || null ),
          Error: ( ( !logChansConfig ? null : logChansConfig.Error ) || ( !logChansEnv ? null : logChansEnv.Error ) || null ),
          JoinPart: ( ( !logChansConfig ? null : logChansConfig.JoinPart ) || ( !logChansEnv ? null : logChansEnv.JoinPart ) || null )
        },
        Mods: ( config.moderatorIds || [] ),
        Name: ( config.botName || ENV.BOT_USERNAME ),
        Owner: botOwnerID,
        Prefix: ( config.prefix || '!' ),
        Verbosity: ( ENV.VERBOSITY || -1 ),
        Version: verBotDB,
        Whitelist: []
      };
      return await botConfig.create( newBotConfig )
      .then( initSuccess => { console.log( chalk.bold.greenBright( 'Bot configuration initialized in my database.' ) ); return newBotConfig; } )
      .catch( initError => { throw new Error( chalk.bold.cyan.inverse( `Error attempting to initialize bot configuration in my database:\n${initError}` ) ); } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};