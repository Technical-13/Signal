require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const express = require( 'express' );
const router = express.Router();
const Guilds = require( '../../models/GuildConfig.js' );
const htmlGuild = fs.readFileSync( './web/guild.html' );
const htmlGuilds = fs.readFileSync( './web/guilds.html' );

router.get( '/', async ( req, res ) => {
  new Promise( async ( resolve, reject ) => {
    const pageGuilds = cheerio.loadBuffer( htmlGuilds );
    pageGuilds( 'title' ).text( 'Guilds | ' + bot );
    const intGuilds = await Guilds.estimatedDocumentCount();
    pageGuilds( '#guild-selector' ).attr( 'est-guilds', intGuilds );
    const allGuilds = await Guilds.find( {}, '_id Guild', { limit: 10 } );
    for ( let dbGuild of allGuilds ) {
      pageGuilds( '#guild-selector' ).append( '<option data="' + dbGuild._id + '">' + dbGuild.Guild.Name + '</option>' );
    }
    resolve( pageGuilds.html() );
  } )
  .then( ( pageHTML ) => { res.send( pageHTML ); } );
} );

router.get( '/:guildId', async ( req, res ) => {
  const { guildId } = req.params;
  const reqGuild = await Guilds.findOne( { _id: guildId } );
  if ( reqGuild ) {
    res.send(`Are you looking for ${reqGuild.Guild.Name} with ${new Intl.NumberFormat().format( reqGuild.Guild.Members )} members?`);
  }
  else {
    res.send(`Guild id ${guildId} doesn't seem to be in my database.`);
  }
} );

module.exports = router;