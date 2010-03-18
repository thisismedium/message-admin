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
    buttons: {}
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
  
  M.ui.widget = widget;
  M.ui.toolbar = toolbar;
  M.ui.button = button;
})();
