const { join } = require( 'path' );

const yaml = require( 'write-yaml' );

module.exports = function makeSaveYamlFile( root ) {
    return ( filename, data ) => new Promise( ( resolve ) => {
        yaml( join( root, filename ), data, { lineWidth: 500 }, ( err ) => {
            if ( err ) {
                throw err;
            }

            resolve();
        } );
    } );
};
