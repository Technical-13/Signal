require( 'dotenv' ).config();
const ENV = process.env;
const bot = ( ENV.BOT_USERNAME || 'Server' );
const fs = require( 'fs' );
const cheerio = require( 'cheerio' );
const express = require( 'express' );
const router = express.Router();
const Users = require( '../../models/BotUser.js' );
const htmlUser = fs.readFileSync( './web/user.html' );
const htmlUsers = fs.readFileSync( './web/users.html' );

router.get( '/', ( req, res ) => {
  new Promise( async ( resolve, reject ) => {
    const pageUsers = cheerio.loadBuffer( htmlUsers );
    pageUsers( 'title' ).text( 'Users | ' + bot );
    const intUsers = await Users.estimatedDocumentCount();
    pageUsers( '#user-selector' ).attr( 'est-users', intUsers );
    const allUsers = await Users.find( {}, '_id UserName', { limit: 10 } );
    for ( let dbUser of allUsers ) {
      pageUsers( '#user-selector' ).append( '<option data="' + dbUser._id + '">' + dbUser.UserName + '</option>' );
    }
    resolve( pageUsers.html() );
  } )
  .then( ( pageHTML ) => { res.send( pageHTML ); } );
} );

router.get( '/:userId', async ( req, res ) => {
  const { userId } = req.params;
  const reqUser = await Users.findOne( { _id: userId } );
  if ( reqUser ) {
    res.send(`Are you looking for ${reqUser.UserName}?`);
  }
  else {
    res.send(`User id ${userId} doesn't seem to be in my database.`);
  }
} );

module.exports = router;