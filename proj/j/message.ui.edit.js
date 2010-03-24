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
      
      this.container = $( M.templates.editor() )
        .appendTo( this.panel.elem );
      this.panel.show();
      
      
      
      
      
      $('<a/>', {
        href: '#lol',
        text: 'SAAAAAAAAAAVE',
        css: {
          background: '#000',
          color: '#fff',
          padding: 10
        },
        click: function( e ){
          e.preventDefault();
          kore.save.call( kore );
        }
      }).appendTo( this.container );
      
      
      
      
      
      
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
        this.path = this.item._path;
        this.get_schema(function(){
          kore.render.call( kore );
        });
      }
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
        
      });
    },
    
    save: function(){
      M.db.change([{ method:'save', data: this.serialize() }], function(){ M.log("SAVED!") }, function(){ M.log("FACK!"); });
    },
    
    serialize: function(){
      var result = {},
          kore = this;
      _( this.schema.fields ).each(function( field ){
        var li = kore.container.find('ul.properties li.property-' + field.name )[ 0 ];
        result[ field.name ] = li.widget.val();
      });
      return $.extend( {}, this.item, result );
    }
    
  };
  ep.init.prototype = ep;
  
  var editors = [];
  function new_edit( item ){
    
  }
  
  function editing( item, path_only ){
    var editor = false;
    for( var n = 0, len = editors.length; n < len; n++ )
      if( _.isEqual( editors[ n ].item, item ) )
        editor = editors[ n ];

    return editor;
  }
  
  function dispatch( item, change_event ){
    
    
    
    if( typeof item === 'string' ){
      var current = editing( item, true );
      M.log( 'current' + current, 1 );
      if( current )
        M.ui.show_panel( current.panel );
      else
        db( item ).get(function(){
          dispatch( this[0] );
        });
    }
    else if( typeof item === 'object' ){
      edit(
        M.ui.panel({ title: item.title, kind: 'Editor' }),
        { item: item }
      );
    }
    
    if( ! change_event )
      M.history( 'e:' + item._path );
  }
  
  $(function(){
    M.ui.edit = dispatch;
    
    M.history.listen( 'e', function( path ){
      dispatch( path, true );
    });
  });
  
})();
