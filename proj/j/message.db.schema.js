/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  DB Schema:
  
  Provides a jQuery-style API for fetching and manipulating
  database objects.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var schemas = {};
  
  function get_schema( kind, cbk ){
    var callback = cbk;
    M.db.get_schema( kind,
      function( kind, key, schema ){
        callback(
          add_schema( kind, schema )
        );
      },
      function( message ){
        M.log( message, -1 );
      });
  }
  
  function add_schema( kind, schema_str ){
    var schema;
    try {
      schemas[ kind ] = schema = eval( '('+schema_str+')' ); }
    catch( e ){
      schema = null; }
    return schema;
  }
  
  function schema( item, cbk ){
    var kind = ( typeof item === 'string' ) ? item : item._kind,
        callback = cbk || function(){};
    if( kind in schemas ){
      callback( schemas[ kind ] );
      return schemas[ kind ];  }
    else
      get_schema( kind, callback );
  }
  
  function stub_out( schema, path ){
    var path = ( path || '' ).replace( /\/?$/, '/' ),
        title = 'Untitled ' + schema.name,
        obj = {
          _kind: schema.name,
          _path: path + M.slugify( title ),
          _stub: true,
          title: title
        };
        
    _.each( schema.fields, function( field ){
      obj[ field.name ] = obj[ field.name ] || '';
    });
    
    return obj;
  }
  
  M.ready(function(){
    M.schema_for = schema;
    M.db.stub = stub_out;
    M.schemas = schemas;
  });
  
})();