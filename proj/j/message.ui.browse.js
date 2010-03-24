/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI.Browse:
  
  This is the content browsing UI component, used in the
  main UI, and in any modal boxes, or anywhere else.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var browse = function( opts ){
    return new bp.init( Array.prototype.slice.call( arguments ) );
  };
  
  var bp = browse.prototype = {
    defaults: {
      mode: 'grid',
      sort: 'index',
      icon_size: 76,
    },
    
    init: function( args ){
      this.guid = M.guid();
      this.panel = args[0];
      
      var el = $( this.panel.elem ),
          loc = args[1],
          opts = args[2];
      
      if( typeof loc !== 'string' ){
        opts = loc;
        loc = '';
      }      
      this.opts = $.extend( {}, this.defaults, opts );
      
      this.container = $( M.templates.browser() );
      el.empty().append( this.container );
      this.container.attr({ id: 'browser-' + this.guid });
      
      this.grid_el = el.find('.grid').hide();
      this.list_el = el.find('.list').hide();
        
      this.path = loc;
      this.display();
      
      return this;
    },
    
    open: function( item ){
      var kore = this;
      this.panel.show();
      
      M.log('Opening this: ' + item, 1 );
      
      if( typeof item === 'string' ){
        var path = item.replace(/\/$/,'');
        if( path === this.path ) return;
        
        if( path.length === 0 ){
          this.path = '';
          this.display();  }
        else
          db( path ).get(function(){
            kore.open.call( kore, this[0] );
          });
      }
      else if( item._kind === 'Folder' ){
        this.path = item._path;
        this.display();
        M.history( this.path );
      }
      else
        M.ui.edit( item );
    },
    
    display: function( path, mode ){
      var path = path || this.path,
          kore = this;
          
      if( mode )
        this.opts.mode = mode;
        
      function load_items(){
        db( kore.path + '/*' ).get(function(){
          kore.items = this;
          kore[ kore.opts.mode ].call( kore, this );
        });
      }
      
      if( M.db.is_connected() )
        load_items();
      else
        M.db.listen( 'connected', load_items );
    },
    
    list: function( items ){
      
    },
    
    grid: function( items ){
      var kore = this,
          ul = kore.grid_el.find('ul').empty();
      
      $.each( this.items, function(i, item){
        var li = $(
          M.templates[ 'browser-icon' ]({
            is_folder: /^Folder$/.test( item._kind ),
            name: item.title,
            kind: item._kind,
            icon: '/i/icn-' + item._kind.toLowerCase() + '.png'
          })
        );
        
        li[ 0 ].item = item;
        ul.append( li );
      });
      
      ul.find('li')
        .mousedown(function( e ){
          kore.select_icon.call( kore, this, e );
        })
        .click(function( e ){
          e.stopPropagation();
        })
        .dblclick(function( e ){
          kore.open_icon.call( kore, this, e );
        });
      
      kore.grid_el.show();
      kore.container
        .unbind('click')
        .click(function( e ){
          kore.deselect_all.call( kore );
        });
      
      this.resize( this.opts.icon_size );
    },
    
    open_icon: function( item, e ){
      this.open( item.item );
    },
    
    select_icon: function( item, e ){
      if( e ) e.stopPropagation();
      
      if( e.shiftKey )
        $( item ).toggleClass( 'selected' );
      else
        $( item )
          .addClass( 'selected' )
          .siblings().removeClass( 'selected' );
    },
    
    deselect_all: function( e ){
      if( e ) e.preventDefault();
      
      this.container.find( '.list-item, .icon-item' )
        .removeClass( 'selected' );
    },
    
    resize: function( size ){
      this.opts.icon_size = size;
      
      var style = $( '#grid-style-' + this.guid );
      if( ! style.size() )
        style = $( '<style type="text/css" id="grid-style-'+style+'"></style>' )
          .appendTo( this.container );
      
      style.text(
        '#browser-' + this.guid + ' .grid li {' +
          'width: ' + size + 'px; height: ' + size + 'px;' +
        '}'
      );
    }
  };
  bp.init.prototype = bp;
  
  $(function(){
    var browse_panel = M.ui.panel({ title:'Browse', kind:'Browser' });
    M.ui.browser = browse( browse_panel, { icon_size: 120 } );
    
    M.ui.browse = browse;
    
    M.history.listen( 'b', function( path ){
      M.ui.browse.open( path );
    });
  });
  
})();
