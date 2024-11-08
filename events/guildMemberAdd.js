const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const createNewUser = require( '../functions/createNewUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const errHandler = require( '../functions/errorHandler.js' );
const parse = require( '../functions/parser.js' );
const verUserDB = config.verUserDB;

client.on( 'guildMemberAdd', async ( member ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const { guild, user } = member;

    if ( await userConfig.countDocuments( { _id: user.id } ) === 0 ) { await createNewUser( user ); }
    const currUser = await userConfig.findOne( { _id: user.id } );
    const storedUserGuilds = [];
    currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
    if ( storedUserGuilds.indexOf( guild.id ) === -1 ) { await addUserGuild( user.id, guild ); }

    const currGuildConfig = await getGuildConfig( guild );
    currGuildConfig.Guild.Members = guild.members.cache.size;
    await guildConfig.updateOne( { _id: guild.id }, currGuildConfig, { upsert: true } )
    .catch( updateError => { throw new Error( chalk.bold.black.bgCyan( 'Error attempting to update %s (id: %s) to my database:\n%o' ), guild.name, guild.id, updateError ); } );

    const doLog = ( !currGuildConfig ? false : ( !currGuildConfig.Logs ? false : ( currGuildConfig.Logs.Active || false ) ) );
    const chanDefaultLog = ( !doLog ? null : member.guild.channels.cache.get( currGuildConfig.Logs.Default ) );
    const chanErrorLog = ( !doLog ? null : member.guild.channels.cache.get( currGuildConfig.Logs.Error ) );
    const doWelcome = ( !currGuildConfig ? false : ( !currGuildConfig.Welcome ? false : ( currGuildConfig.Welcome.Active || false ) ) );
    if ( doWelcome ) {
      const welcomeChan = ( !currGuildConfig.Welcome.Channel ? member : member.guild.channels.cache.get( currGuildConfig.Welcome.Channel ) );
      const welcomeMsg = await parse( currGuildConfig.Welcome.Msg || 'Welcome {{member.ping}}!\n**{{server.name}}** now has {{server.members}} members!\nPlease reach out to the server owner, {{server.owner.ping}} if you need any help!', { member: member } );
      const welcomeRole = ( !currGuildConfig.Welcome.Role ? null : member.guild.roles.cache.get( currGuildConfig.Welcome.Role ) );
      welcomeChan.send( { content: welcomeMsg } )
      .then( welcomeSent => {
        if ( welcomeRole ) {
          member.roles.add( welcomeRole, 'New member! - use `/config welcome` to change.' )
          .then( roleAdded => {
            if ( doLog && chanDefaultLog ) {
              chanDefaultLog.send( { content: 'Successfully welcomed <@' + member.id + '> to the server and gave them the <@&' + welcomeRole + '> role.' } );
            }
          } )
          .catch( async errRole => {
            if ( doLog && chanErrorLog ) {
              chanErrorLog.send( await errHandler( errRole, { command: 'guildMemberAdd', type: 'errRole' } ) );
            }
          } );
        }
        if ( !welcomeRole && doLog && chanDefaultLog ) {
          chanDefaultLog.send( { content: 'Successfully welcomed <@' + member.id + '> to the server.' } );
        }
      } )
      .catch( async errSend => {
        if ( doLog && chanErrorLog ) {
          chanErrorLog.send( await errHandler( errSend, { command: 'guildMemberAdd', type: 'errSend' } ) );
        }
      } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( 'guildMemberAdd.js' ), errObject.stack ); }
} );