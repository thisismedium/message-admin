/******* ------------------------------------------------------------
 db API
 ***/
(function(){
  
  var db = window.db = M.db = function(){
    return new db.fn.init( arguments );
  };
  
  db.fn = db.prototype = (function(){
    
    // Helpers &c.
    
    return {
      init: function( args ){
        this.loaded = false;
        
        var q = this.base_query = args[0];
        if( /^[^\/]/.test( q ) )
          q = '//' + q;
        
        this.query = q;
        this.intial_query = q;
        return this;
      },
      
      
      // ----- JS Object methods ----- //
      properties: {},
      original: {},
      original_data: {},
    
      set: function(){
        
      },
    
      changes: function(){
      
      },
    
      has_changed: function( key ){
      
      },
    

      // ----- Query-building methods ----- //
      parent: function( selector ){
        this.query += '/parent::' + ( selector || '*' );
        return this;
      },
      
      ancestor: function( selector ){
        this.query += '/ancestors::' + ( selector || '*' ) + '[0]';
        return this;
      },
      
      ancestors: function(){
        this.query += '/ancestors::*';
        return this;
      },
      
      children: function( selector ){
        this.query += '/descendant::' + ( selector || '*' )
        return this;
      },
      
      siblings: function( selector ){
        this.query += '/sibling::' + ( selector || '*' );
        return this;
      },
      
      find: function( selector ){
        this.query += '/descendant::' + ( selector || '*' );
        return this;
      },
      
      
      // ----- Remote methods ----- //
      get: function( cbk ){
        var kore = this,
            callback = cbk;
        
        M.db.query( this.query, function( expr, results ){
          var data = kore.parse_response.call( kore, results );
          if( callback )
            callback.call( kore, data );
        });
        
        return this;
      },
      
      each: function( cbk ){
        var kore = this,
            callback = cbk;
        
        M.db.query( this.query, function( expr, results ){
          var data = kore.parse_response.call( kore, results );
          
          if( callback )
            for( var n = 0, len = data.length; n < len; n++ )
              callback.call( data[ n ], n, data[ n ], kore );
        });

        return this;
      },
      
      parse_response: function( resp ){
        var data;
        try {
          data = eval( resp );
          
          Array.prototype.splice.call( this, 0, this.length );
          Array.prototype.push.apply( this, data );
          
          this.data = data.slice();
          this.original_data = data.slice();
        }
        catch( e ) {
          data = 'Error parsing database response.';
          M.log( data, 1 );
          M.log( e.message, 1 );
        }
        finally {
          this.query = this.original_query;
          return data;
        }
      },
      
      save: function(){
        
      },
      
      update: function(){
        
      },
      
      remove: function(){
        
      },
      
      move: function(){
        
      },
      
      copy: function(){
        
      }
    };
  })();
  
  db.fn.init.prototype = db.fn;
  
})();