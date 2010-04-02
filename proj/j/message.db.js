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
    // Using a closures to simulate private functions(located at the bottom)
    return {
      // Init is called for every new instance via db()
      init: function( args ){
        this.loaded = false;
        var q;
        
        // Treat a string as a path query
        if( typeof args[0] === 'string' ){
          q = this.base_query = args[0];
          if( /^[^\/]/.test( q ) )
            q = '//' + q;
        }
        // Otherwise, assume an object or an array of objects
        // represent an item in the database, and just wrap them up
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
      original: {},
      original_data: {},
      
      // Sets a property (if present) on all items in current set,
      // and returns the db object.
      set: function( key, val ){
        for( var n = 0, len = this.length; n < len; n++ )
          if( key in this[ n ] )
            this[ n ][ key ] = val;
        return this;
      },
      
      // Returns an array of changed properties for all items in the set,
      // identified by _key, structured like so:
      //   [ { _key: 'a...', title: ['old...','new...'] },
      //     { _key: 'b...', content: ['old...','new...'] } ]
      changes: function(){
        var result = [];
        for( var n = 0, len = this.length; n < len; n++ ) {
          for( var key in this.original[ n ] ){
            if( this.original[ n ][ key ] !== this[ n ][ key ] )
              ( result[ n ] || (result[ n ] = { _key:this[ n ]._key }) )[ key ] =
                [ this.original[ n ][ key ], this[ n ][ key ] ];
          }
        }
        result = _.compact( result );
        return result;
      },
      
      // Returns an array of `true` or `false` for each item in the set,
      // determined by whether any properties have been altered.
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
      // All these methods work by appending to an internal XPath query.
      // This query is reset to the original query from instantiation
      // whenever .get() or .each() are called. Most take an optional selector
      // that will be applied.
      
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
      // These methods actually make calls to the database, based on
      // the current internal query, and pass the result on to a callback function.
      
      // Fetches items for the current query, and passes them along to the callback.
      get: function( cbk ){
        var kore = this,
            callback = cbk;
        return fetch_items.call( this,
          callback ? callback : Noop
        );
      },
      
      // Fetches items for the current query, then iterates over them, calling the
      // specifed callback function on each one.
      each: function( cbk ){
        var kore = this,
            callback = cbk;
        return fetch_items.call( this,
          callback ?
            function(){
              for( var n = 0, len = data.length; n < len; n++ )
                callback.call( data[ n ], n, data[ n ], kore );
            }
          : Noop
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
      
      remove: function( cbk ){
        change.call( this, 'remove', cbk );
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
      var callback = cbk || Noop,
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