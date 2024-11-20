require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const express = require( 'express' );
const router = express.Router();
const Users = require( '../../models/BotUser.js' );
const Guilds = require( '../../models/GuildConfig.js' );

router.get( '/g/:guildName', async ( req, res ) => {
  const { guildName } = req.params;
  const reqGuilds = await Guilds.find( { Name: guildName }, '_id Guild', { limit: 10 } );
  const data = {};
  for ( let match of reqGuilds ) {
    data[ match._id ] = match.Guild.Name;
  }
  res.json( data );
} );

router.get( '/u/:userName', async ( req, res ) => {
  const { userName } = req.params;
  const regexName = new RegExp( userName, 'i' );
  const reqUsers = await Users.find( { UserName: regexName }, '_id UserName', { limit: 10 } );
  const data = {};
  for ( let match of reqUsers ) {
    data[ match._id ] = match.UserName;
  }
  res.json( data );
} );

module.exports = router;