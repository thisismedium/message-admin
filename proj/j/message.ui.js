/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  Base UI:
  
  Provides registries for reusable UI widgets, buttons, and
  toolbars. Also coordinates various UI components.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  M.load_template( 'tab', 'tabs', 'panel' );
  
  M.ui = {
    widgets: {},
    toolbars: {},
    buttons: {},
    panels: {}
  };
  
  function widget( kind, def ){
    var definition,
        base = {
          val: function(){
            return this.container.find(':input').val();
          }
        };
    if( typeof def === 'function' )
      definition = $.extend( base, def() );
    else if( typeof def === 'object' )
      definition = $.extend( {}, base, def );
    
    return M.ui.widgets[ kind ] = function( container, value ){
      return $.extend({
          container: container,
          guid: M.guid(),
          value: value
        }, definition );
    };
  }
  
  
  function button( name, opts ){
    opts = ( typeof opts === 'function' ) ? opts() : opts;
    
    var o = $.extend({
      name: name,
      markup: '<button>' + name + '</button>',
      position: 'left',
      click: Noop,
      setup: function(){
        var kore = this;
        this.elem = $( this.markup )
          .mousedown(function( e ){
            kore.click.call( kore, e );
          })
          .appendTo( this.container );
      },
      teardown: function(){
        this.elem.remove();
      }
    }, opts );
    
    var btn = function( toolbar ){
      var args = Array.prototype.slice.call( arguments, 1 );
      return $.
        extend( {}, o, {
          init: function(){
            this.guid = M.guid();
            this.toolbar = toolbar;
            this.container = toolbar.container;
            this.panel = this.toolbar.panel;
            this.setup.apply( this, args );
            return this;
          }
        }).init( args );
    };
    
    return M.ui.buttons[ name ] = btn;
  }
  
  window.toolbars = [];
  
  function toolbar( name, opts ){
    opts = ( typeof opts === 'function' ) ? opts() : opts;
    
    var o = $.extend({
        buttons: [],
        name: name,
        markup: '',
        spacing: { x: 7, y: 5 },
        pre: Noop,
        setup: Noop,
        teardown: Noop,
        update: Noop
      }, opts );
      
    var bar = function( panel, elem ){
      var args = Array.prototype.slice.call( arguments, 1 );
      
      function init_buttons( btns, toolbar ){
        var buttons = [];
        for( var n = 0; n < btns.length; n++ )
          buttons.push(
            ( M.ui.buttons[ btns[ n ]] || Noop )( toolbar )
          );
        return _( buttons ).compact();
      }

      return $.
        extend( {}, o, {
          init: function( args ){
            this.panel = panel;
            this.container = elem;
            this.pre.apply( this, args );
            this.guid = M.guid();
            
            this.buttons = init_buttons( this.buttons, this );
            this.adjust();
            
            this.setup.apply( this, args );
            return this;
          },
          
          adjust: function(){
            var spacing = this.spacing;
                right = spacing.x * 2,
                left = spacing.x * 2;
            
            _( this.buttons ).each(function( btn, n ){
              if( btn.position === 'right' ){
                btn.elem.css({ position:'absolute', top: spacing.y, right: right });
                right += btn.elem.outerWidth() + spacing.x;
              }
              else if( btn.position === 'left' ){
                btn.elem.css({ position:'absolute', top: spacing.y, left: left });
                left += btn.elem.outerWidth() + spacing.x;
              }
            });
          }
      }).init();
        
    };
    
    return M.ui.toolbars[ name ] = bar;
  }

  var tabs = [],
      selected_tab = 0,
      tab_ul;
  
  function select_tab( tab ){
    var num = 0;
    for(; num < tabs.length; num++ )
      if( tab.guid === tabs[ num ].guid )
        break;
    
    tabs[ selected_tab ].elem.removeClass( 'selected' );
    tabs[ selected_tab ].blur();
    
    tabs[ num ].elem.addClass( 'selected' );
    tabs[ num ].focus();
    
    selected_tab = num;
  }
  
  function remove_tab( tab ){
    var num = 0;
    for(; num < tabs.length; num++ )
      if( tab.guid === tabs[ num ].guid )
        break;
    
    tabs[ num ].elem.remove();
    tabs.splice( num, 1 );
    selected_tab = 0;
    select_tab( tabs[0] );
  }
  
  window.tabs = tabs;
  
  function tab( panel, title, focus, blur ){
    var tab = {
      panel: panel,
      kind: panel.type,
      guid: M.guid(),
      title: title,
      focus: ( focus || Noop ),
      blur: ( blur || Noop )
    };
    
    tab.select = function(){
      select_tab( tab );
    };
    
    tab.remove = function(){
      remove_tab( tab );
    };
    
    tab.retitle = function( str ){
      this.title = str;
      this.elem.find('.text').text( str );
    };
    
    tab.elem = $(
      M.templates.tab({
        kind: tab.kind,
        selected: false,
        text: title,
        guid: tab.guid
      })
    ).appendTo( tab_ul );
    
    tab.elem.mousedown(function( e ){
      e.preventDefault();
      tab.panel.show();
    });
    
    tabs.push( tab );
    panel.tab = tab;
  }
  
  M.ready(function(){
    tab_ul = $(
      M.templates.tabs()
    ).appendTo( '#sidebar' );
  });
  
  function panel( arg ){
    if( typeof arg === 'number' )
      return M.ui.panels[ arg ];
    
    else if( typeof arg === 'object' ){
      var guid = M.guid();
      var panel = M.ui.panels[ guid ] = (function(){
        var focii = [],
            blurs = [];
        
        function focus( fn ){
          if( fn ) return focii.push( fn );
          _( focii ).each(function( f ){
            f();
          });
        }
        
        function blur( fn ){
          if( fn ) return blurs.push( fn );
          _( blur ).each(function( f ){
            f();
          });
        }
        
        return {
          guid: guid,
          elem: $( M.templates.panel({ guid: guid }) )
            .appendTo( '#main' )
            .hide(),
          type: ( arg.kind || 'Panel' ),
          title: ( arg.title || 'Panel' ),
          show: function(){
            show_panel( guid );
          },
          close: function(){
            close_panel( guid );
          },
          focus: focus,
          blur: blur
        };
      })();
      
      tab( panel, panel.title );
      return panel;
    }
  }

  function close_panel( panel ){
    if( typeof panel === 'number' )
      panel = M.ui.panels[ panel ];
    if( ! panel ) return;
    
    delete M.ui.panels[ panel.guid ];
    panel.elem.siblings().first().show();
    panel.elem.remove();
    
    panel.tab.remove();
  }
  
  function show_panel( panel ){
    if( typeof panel === 'number' )
      panel = M.ui.panels[ panel ];
    if( ! panel ) return;
    
    panel.elem.show().siblings().hide();
    panel.tab.select();
    panel.focus();
  }
  
  M.ui.panel = panel;
  M.ui.widget = widget;
  M.ui.toolbar = toolbar;
  M.ui.button = button;
})();
