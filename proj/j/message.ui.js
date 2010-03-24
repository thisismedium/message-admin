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
  
  function toolbar( name, opts ){
    var bar = {};
    
    M.ui.toolbars[ name ] = bar;
  }
  
  function button( name, fook ){
    
  }
  
  var tabs = [],
      selected_tab = 0,
      tab_ul;
  
  function select_tab( tab ){
    var num = 0;
    for(; num < tabs.length; num++ )
      if( tab.guid === tabs[ num ].guid )
        break;
    
    tabs[ selected_tab ].elem.removeClass('selected');
    tabs[ selected_tab ].blur();
    
    tabs[ num ].elem.addClass('selected');
    tabs[ num ].focus();
    
    selected_tab = num;
  }
  
  window.tabs = tabs;
  
  function tab( panel, title, focus, blur ){
    var tab = {
      panel: panel,
      kind: panel.type,
      guid: M.guid(),
      title: title,
      focus: ( focus || function(){} ),
      blur: ( blur || function(){} )
    };
    
    tab.select = function(){
      select_tab( tab );
    };
    
    tab.remove = function(){
      remove_tab( tab );
    };
    
    tab.elem = $(
      M.templates.tab({
        kind: tab.kind,
        selected: false,
        text: title,
        guid: tab.guid
      })
    ).appendTo( tab_ul );
    
    tab.elem.click(function(e){
      tab.panel.show();
    });
    
    tabs.push( tab );
    panel.tab = tab;
  }
  
  $(function(){
    tab_ul = $(
      M.templates.tabs()
    ).appendTo( '#sidebar' );
  });
  
  function panel( arg ){
    if( typeof arg === 'number' )
      return M.ui.panels[ arg ];
    
    else if( typeof arg === 'object' ){
      var guid = M.guid();
      var panel = M.ui.panels[ guid ] = {
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
      };
      
      tab( panel, panel.title );
      return panel;
    }
  }

  function close_panel( panel ){
    if( typeof panel === 'number' )
      panel = M.ui.panels[ panel ];
    if( ! panel ) return;
    
    panel.elem.siblings().first().show();
    panel.elem.remove();
  }
  
  function show_panel( panel ){
    if( typeof panel === 'number' )
      panel = M.ui.panels[ panel ];
    if( ! panel ) return;
    
    panel.elem.show().siblings().hide();
    panel.tab.select();
  }
  
  M.ui.panel = panel;
  M.ui.widget = widget;
  M.ui.toolbar = toolbar;
  M.ui.button = button;
})();
