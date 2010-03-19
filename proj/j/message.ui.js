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
  
  function widget( kind, build, destroy ){
    widgets[ kind ] = { build: build, destroy: destroy };
  }
  
  function toolbar( name, opts ){
    var bar = {};
    
    M.ui.toolbars[ name ] = bar;
  }
  
  function button( name, fook ){
    
  }
  
  function panel( arg ){
    if( typeof arg === 'number' )
      return M.ui.panels[ arg ];
    
    else if( typeof arg === 'object' ){
      var guid = M.guid();
      return M.ui.panels[ guid ] = {
        guid: guid,
        elem: $( M.templates.panel({ guid: guid }) ).appendTo( '#main' ),
        type: ( arg.kind || 'Panel' ),
        title: ( arg.title || 'Panel' )
      };
    }
  }
  
  function show_panel( panel ){
    if( typeof panel === 'number' )
      panel = panels[ panel ];
    if( ! panel ) return;
    
    panel.elem.show().siblings().hide();
  }
  
  M.ui.panel = panel;
  M.ui.show_panel = show_panel;
  M.ui.widget = widget;
  M.ui.toolbar = toolbar;
  M.ui.button = button;
})();
