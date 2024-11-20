const Guild = require( '../../models/GuildConfig.js' );
const jwt = require( 'jsonwebtoken' );

module.exports = async ( req, res, next ) => {
  try {
    const cookies = req.cookies;
    const token = cookies?.token;

    if ( !token ) return next();

    const decodedToken = jwt.verify( token, process.env.JWT_SECRET );

    if ( decodedToken?.id ) {
      const targetUser = await Guild.findOne( { id: decodedToken.id } ).lean();

      if ( targetUser ) req.guild = targetGuild;
    }
  }
  catch ( error ) { console.error( error ); }

  next();
};