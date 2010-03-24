/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI Widgets:
  
  Set of standard widgets for use in the content
  editing panel.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  var widget = M.ui.widget;
  
  widget( 'string', function(){
    return {
      setup: function(){
        this.input = $('<input type="text" value="' + this.value +'" />')
          .appendTo( this.container );
      },
      teardown: function(){
        
      }
    };
  });
  
  
  widget( 'text', function(){
    return {
      setup: function(){
        this.input = $('<textarea>' + this.value +'</textarea>')
          .appendTo( this.container );
      },
      teardown: function(){
      
      }
    };
  });
  
  widget( 'ref.Item', function(){
    return {
      setup: function(){
        $( this.container ).html( '<tt>' + this.value + '</tt>');
      }
    };
  });
  
  
})();
