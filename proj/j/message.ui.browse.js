/******* ------------------------------------------------------------
 UI - Browse
 ***/
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
      
      var el = $( args[0] ),
          loc = args[1],
          opts = args[2];
      
      if( typeof loc !== 'string' ){
        opts = loc;
        loc = '';
      }      
      this.opts = $.extend( {}, this.defaults, opts );
      
      this.con_el = $( M.templates.browser() );
      el.empty().append( this.con_el );
      this.con_el.attr({ id: 'browser-' + this.guid });
      
      this.grid_el = el.find('.grid').hide();
      this.list_el = el.find('.list').hide();
        
      this.path = loc;
      this.display();
      
      return this;
    },
    
    open: function( item ){
      var kore = this;
      if( typeof item === 'string' )
        db( item ).get(function(){
          kore.open.call( kore, this );
        });

      if( item.kind === 'Folder' ){
        this.path += '/' + item.name;
        this.display(); }
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
            is_folder: /^Folder$/.test( item.kind ),
            name: item.title,
            kind: item.kind,
            icon: '/i/icn-' + item.kind.toLowerCase() + '.png'
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
      kore.con_el
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
      
      this.con_el.find( '.list-item, .icon-item' )
        .removeClass( 'selected' );
    },
    
    resize: function( size ){
      this.opts.icon_size = size;
      
      var style = $( '#grid-style-' + this.guid );
      if( ! style.size() )
        style = $( '<style type="text/css" id="grid-style-'+style+'"></style>' )
          .appendTo( this.con_el );
      
      style.text(
        '#browser-' + this.guid + ' .grid li {' +
          'width: ' + size + 'px; height: ' + size + 'px;' +
        '}'
      );
    }
  };
  bp.init.prototype = bp;
  
  $(function(){
    var browse_con = $( "<div class='panel' />" ).appendTo( '#main' );
    M.ui.browse = browse( browse_con, { icon_size: 120 } );
  });
  
})();
