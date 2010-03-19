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
      schemas[ kind ] = eval( '('+schema_str+')' ); }
    catch( e ){
      schema = null; }
    finally {
      return schema; }
  }
  
  function schema( item, cbk ){
    if( item.kind in schemas )
      cbk( schemas[ item.kind ] );
    else
      get_schema( item.kind, cbk );
  }
  
  $(function(){
    M.schema_for = schema;
  });
  
})();