/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  Db API:
  
  Provides a jQuery-style API for fetching and manipulating
  database objects.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var db = window.db = function(){
    return new db.fn.init( arguments );
  };
  
  db.fn = db.prototype = (function(){
    return {
      init: function( args ){
        this.loaded = false;
        var q;
        
        if( typeof args[0] === 'string' ){
          q = this.base_query = args[0];
          if( /^[^\/]/.test( q ) )
            q = '//' + q;
        }
        else if( typeof args[0] === 'object' ){
          if( /Array/.test( args[0].constructor ) ){
            Array.prototype.splice.call( this, 0, this.length );
            Array.prototype.push.apply( this, args[0] );
            q = this.base_query = args[0]['_path'];
            this.loaded = true;
          }
          else{
            this[0] = args[0];
            q = this.base_query = args[0]['_path'];
            this[0] = this[0];
            this.length = 1;
            this.original[0] = _.extend( {}, this[0] );
            this.loaded = true;
          }
        }
        
        this.intial_query = this.query = q;
        return this;
      },
      
      
      // ----- JS Object methods ----- //
      properties: {},
      original: {},
      original_data: {},
    
      set: function( key, val ){
        for( var n = 0, len = this.length; n < len; n++ )
          if( key in this[ n ] )
            this[ n ][ key ] = val;
        return this;
      },
    
      changes: function(){
        var result = [];
        for( var n = 0, len = this.length; n < len; n++ ) {
          console.log( 'item', n );
          for( var key in this.original[ n ] ){
            if( this.original[ n ][ key ] !== this[ n ][ key ] )
              ( result[ n ] || (result[ n ] = { _key:this[ n ]._key }) )[ key ] =
                [ this.original[ n ][ key ], this[ n ][ key ] ];
          }
        }
        result = _.compact( result );
        return results;
        // return ( result.length === 1 ) ? result[ 0 ] : result;
      },
    
      has_changed: function( key ){
        var kore = this,
        result = _.map( this, function( item, n ){
          return ( typeof key === 'undefined' ) ? 
            ! (_.isEqual( kore.original[ n ], kore[ n ] )) :
            ( kore.original[ n ][ key ] !== kore[ n ][ key ] );
        });
        
        return ( result.length === 1 ) ? result[ 0 ] : result;
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
        return fetch_items.call( this,
          callback ? callback : function(){}
        );
      },
      
      each: function( cbk ){
        var kore = this,
            callback = cbk;
        return fetch_items.call( this,
          callback ?
            function(){
              for( var n = 0, len = data.length; n < len; n++ )
                callback.call( data[ n ], n, data[ n ], kore );
            }
          : function(){}
        );
        return this;
      },
      
      save: function( cbk ){
        change.call( this, 'save', cbk );
        return this;
      },
      
      update: function(){
        return this;
      },
      
      remove: function(){
        return this;
      },
      
      move: function(){
        return this;
      },
      
      copy: function(){
        return this;
      },
      
      create: function(){
        
      }
    };
    
    function fetch_items( callback ){
      var kore = this;
      
      M.db.query( this.query, function( expr, results ){
        var data = parse_response.call( kore, results );
        kore.original_data = data;
        kore.original = [];
        kore.loaded = true;
        
        _( data ).each(function( item, n ){
          kore.original[ n ] = _.extend( {}, item )
        });
        
        if( callback )
          callback.call( kore, data );
      });
      
      return this;
    }
    
    function parse_response( resp ){
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
    }
    
    function change( method, cbk ){
      var callback = cbk || function(){},
          kore = this;
      M.db.change(
        _.map( kore, function( item, n ){
          return {
            method: method,
            data: kore[ n ]
          };
        }),
        callback,
        function(){
          callback( 'Error saving.' );
        }
      );
    }
  })();
  
  db.fn.init.prototype = db.fn;
  
})();