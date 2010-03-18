/******* ------------------------------------------------------------
 Base UI
 ***/
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
