/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI.Edit:
  
  This is the content editor UI component. It handles rendering
  an interactive form for editing a content, and common
  widgets for the standard set of types.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var edit = function( opts ){
    return new ep.init( Array.prototype.slice.call( arguments ) );
  };
  
  var ep = edit.prototype = {
    defaults: {
    },
    
    init: function( args ){
      this.guid = M.guid();
      this.panel = args[0];
      
      var el = $( this.panel.elem ),
          loc = args[1],
          opts = args[2],
          kore = this;
      
      if( typeof loc !== 'string' ){
        opts = loc;
        loc = '';  }
      
      this.opts = $.extend( {}, this.defaults, opts );
      this.panel.focus(function(){
        kore.display_path.call( kore );
      });
      
      this.container = $( M.templates.editor() )
        .appendTo( this.panel.elem );
      this.panel.show();
      
      this.toolbar = M.ui.toolbars.editor(
        this, this.container.siblings( '.edit-toolbar' ));
      
      this.load( this.opts.item );
      return this;
    },
    
    load: function( item ){
      var kore = this;
      if( typeof item === 'string' ) {
        if( item === this.path ) return;
        
        db( item ).get(function(){
          kore.load.call( kore, this );
        });
      }
      else if( typeof item === 'object' ){
        this.item = item;
        this.db_item = db( item );
        this.path = this.item._path;
        this.get_schema(function(){
          kore.render.call( kore );
        });
      }
    },
    
    display_path: function(){
      if( ! this.db_item ) return;
      M.ui.location.path( this.db_item[0]._path );
      // console.log( 'e:' + this.db_item[0]._path );
      M.history( 'e:' + this.db_item[0]._path );
    },
    
    get_schema: function( cbk ){
      var callback = cbk || function(){},
          kore = this;
      M.schema_for( this.item, function( schema ){
        kore.schema = schema;
        callback.call( kore, schema );
      });
    },
    
    render: function(){
      this.container.find('.title h1')
        .text( this.item.title );
        
      if( this.panel.elem.is(':visible') )
        this.display_path();
            
      var ul = this.container.find('ul.properties'),
          kore = this;
      _( this.schema.fields ).each(function( field ){        
        var li =
          $( M.templates['editor-property']({
              kind: field.type,
              name: field.name,
              description: 'Jeg vet ikke hva.'
            })
          );
        li.appendTo( ul );
        
        li[0].widget = M.ui.widgets[ field.type ](
          li.find( '.widget' ),
          kore.item[ field.name ]
        );
        li[0].widget.setup();
        
        li.find(':input').blur(function(){
          kore.serialize.call( kore );
        });
      });
    },
    
    close: function(){
      this.serialize();
      if( ! this.db_item.has_changed() )
        true;
      else if( confirm("If you close you will lose all unsaved changes.") )
        true;
      else
        return;
      this.panel.close();
      close_editor( this );
    },
    
    save: function( cbk ){
      this.serialize();
      
      if( '_stub' in this.db_item[0] ) {
        delete this.db_item[0]['_stub'];
        var to_go = $.extend( {}, this.db_item[0] );
        delete to_go['name'];
        delete to_go['folder'];
        
        M.db.change(
          [{ method:'create', data: to_go }],
          function(){
            M.log("Created.");
            if( cbk ) cbk();
          },
          function( msg ){
            M.log( "Error:" + msg );
          }
        );
      }
      else      
        M.db.change(
          [{ method:'save', data: this.db_item[0] }],
          function(){
            M.log("Saved.");
            if( cbk ) cbk();
          },
          function( msg ){
            M.log( "Error:" + msg );
          }
        );
    },
    
    serialize: function(){
      console.log('serialize');
      var result = {},
          kore = this;
      _( this.schema.fields ).each(function( field ){
        var li = kore.container.find('ul.properties li.property-' + field.name )[ 0 ];
        result[ field.name ] = li.widget.val();
      });
      return $.extend( this.db_item[0], result );
    }
    
  };
  ep.init.prototype = ep;
  
  var editors = [];
  
  function close_editor( editor ){
    var no = 0,
        guid = ( typeof editor === 'object' ) ? editor.guid : editor;
    for( var n = 0, len = editors.length; n < len; n++ )
      if( editors[ n ].guid === guid )
        no = n;
    editors.splice( no, 1 );
  }
  
  function editing( item, path_only ){
    var editor = false;
    for( var n = 0, len = editors.length; n < len; n++ )
      if( ( path_only && ( editors[ n ].path === item ) ) ||
          ( editors[ n ].item._path === item._path ) )
        editor = editors[ n ];

    return editor;
  }
  
  function dispatch( item, change_event ){
    if( typeof item === 'string' ){
      var current = editing( item, true );
      if( current )
        current.panel.show();
      else
        db( item ).get(function(){
          dispatch( this[0] );
        });
    }
    else if( typeof item === 'object' ){
      var current = editing( item );
      if( current )
        current.panel.show();
      else
        editors.push(
          edit(
            M.ui.panel({ title: item.title, kind: 'Editor' }),
            { item: item }
          )
        );
    }
    
    if( ! change_event )
      M.history( 'e:' + item._path );
  }
  
  M.ready(function(){
    M.ui.edit = dispatch;
    M.ui._editors = editors;
    
    M.history.listen( 'e', function( path ){
      dispatch( path, true );
    });
  });
  
})();
