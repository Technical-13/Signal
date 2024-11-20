const express = require( 'express' );

const router = express.Router();

router.use( '/', require( './home/home.js' ) );
//router.use( '/auth', require( './auth' ) );
router.use( '/api', require( './api/api.js' ) );
router.use( '/guilds', require( './guilds/guilds.js' ) );
router.use( '/users', require( './users/users.js' ) );

module.exports = router;