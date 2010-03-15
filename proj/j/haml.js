var Haml = {}, undefined;  // Just in case some fool overwrote the global 'undefined'
try { if (exports) Haml = exports; } catch (e) {}

(function (Haml) {
  
  // RegEx's for use in e_
  var self_closing = /^(?:img|br|link|meta|input|area|hr|base)$/i,
      s_quo = /'/gm;

  // 'e_' is a helper function to render a single html element.
  // It's used included in the compiled templates for rendering.
  // - 'name' is the element, e.g. 'div'
  // - 'attrs' is an object with attributes, e.g. {'href':'/blog'}
  // - 'val' can either be a string or function for its contents
  var e_ = function(name, attrs, val) {
    // Loop through atributes object and create strings for 'em
    var as = [''];
    for (a in attrs)
      as.push( a +"='"+ attrs[a].replace(s_quo, "\\'") +"'" );
  
    // Return the element
    return '<'+name + as.join(' ') + (
      // If it's self-closing, close it...
      self_closing.test(name) ? ' />' :
      // ...otherwise add in the content
      '>' + (
        (typeof val === 'function') ? val() :
        (typeof val === 'string') ? val : ''
      ) + '</'+name+'>'); // ...and close
  };

  // 'esc' is another helper function to escape single quotes
  var esc = function esc(s){ return ( s || '').replace(s_quo,"\\'"); }


  // 'prelude' is a wrapper for local vars, and the rendering helper functions.
  //  It gets included in compiled templates.
  var prelude = 'var context = context || {};' +
                'with(context){' +
                  'var self_closing = ' + self_closing.toString() + ', ' +
                  'esc = ' + esc.toString() + ', ' +
                  'e_ = ' + e_.toString() + ', ' +
                  's_quo = ' + s_quo.toString() +
                  '; return \'\' ';
  
  // RegEx's for the different Haml line types, etc. for use in compile
  var blank = /^[\t\n\r\s]*$/,
      tag = /^( *)(%[a-z0-9]+)?((?:[\.#][a-z0-9_-]+)*)(\{[^}]+\})?(=)? ?([\S\s]*)?$/i,
      text = /^( *)([^ %=#.-][\S\s]*)$/i,
      js = /^( *)(-|=) ([\S\s]+)$/,
      js_prefix = /[=-]/, js_block = /^(?:if|else|for|while|with|do)/, elze = /^else/,
      css_class = /(\.[a-z0-9-_]+)/gim, css_id = /(#[a-z0-9-_]+)/gim;

  // 'Haml.compile' takes a string of Haml, and returns a compiled function
  // that can be executed later, with local vars, to render the HTML.
  Haml.compile = function (haml) {
    if (haml === undefined) return false; // Break if we got nothin'
    
    var lines = haml.split('\n'), line,
        // Array to hold the function's code fragments
        out = [prelude],
        // Keep track of current state during while reading
        virgin = true, x = 0, col = 0, open = [], self_close = false;
    
    // Loop through every line, skipping blanks
    // for(var n = 20; n < 0; n++){
    for ( var n = 0, len = lines.length; n < len; n++ ) {
      if ( blank.test(lines[n]) ) continue;
      
      // Determine line type: executable js, plain text, haml tag
      line = lines[n].match(js) || lines[n].match(text) || lines[n].match(tag);
      if (!line) continue;
      
      // How indented is this line? also if this is the 1st one, set current indent too
      col = line[1].length;
      if (virgin) { x = col; virgin = false; }
      
      // Before we add in stuff for this line, figure out how it relates to the last one.
      // Close control structure, append to siblings, or start return value
      if (col < x)
        for ( var m = 0, cols = (x - col) / 2; m < cols; m++ ) {
          if (elze.test(line[3]) && open.shift())
            out.push( ' } ' );
          else if ( open.shift() )
            out.push( '; } return _$_;})()'+ ((m == cols-1) ? ' + ' : ' ') );
          else if ( self_close )
            out.push( '; })'+ ((m == cols-1) ? ' + ' : ' ')  ); 
          else {
            out.push( 'return \'\'; }) ; }) + ');
            open.shift();
          }
        }
      else if ((col === x) && (open[0] == false) && !self_close) {
        out.push( 'return \'\'; }) + ');
        open.shift();
      }
      else if ((col === x) || open[0])
        out.push( ' + ' );
      else
        out.push( 'return ' );
        
        
        $("#blah .foo bar")
        $("#blah").children().find('bar')

      
      // Now to the line processing...
      // - Executable JS (-/= ...)
      if ( js_prefix.test(line[2]) ) {
        
        // If the line start's with '=' pass the js for later evaluation
        if ( line[2] === '=' )
          out.push('('+ line[3] +').toString()');
          
        // If it starts with '-', open a new control structure in an
        // immediately executing closure with a temp-var
        else if ( js_block.test(line[3]) ) {
          if ( elze.test(line[3]) )
            out.push(line[3] + ' { _$_ = _$_');
          else
            out.push('(function(){var _$_ = ""; ' + line[3] + ' { _$_ = _$_');
          open.unshift(true);
        }
      
      // - Haml tag (%el ... / #id.class ...)
      } else if (line.length == 7) {
        // Grab the tagname (default to div), the attributes, and any classes/id
        var name = (line[2] || '%div').slice(1),
            as = eval('('+line[4]+')') || {},
            classes = line[3].match(css_class),
            ids = line[3].match(css_id);
        
        // Merge css-style class/id with ones specified in attributes
        if (classes) as['class'] = ((as['class']||'') +' ' + classes.join(' ')).replace(/\.|^ | $/g,'');
        if (ids) as['id'] = (as['id'] || ids[0]).replace(/#/g,'');
      
        // Build a object-esque string from the attributes
        var attrs = [];
        for (a in as) attrs.push( "'"+esc(a)+"':'"+esc(as[a])+"'" );
        attrs = '{'+ attrs.join(', ') +'}';
        
        self_close = true;
        // If there's no in-line text, and this isn't a self-closing tag, push a new tag
        if ( blank.test(line[6]) && !self_closing.test(name)) {
          out.push( "e_('"+name+"', "+attrs+", function(){");
          // Add to stack of open elements & control structures (false => non-control)
          open.unshift(false); 
          self_close = false;
        }
        
        // If the tag ends in '=', make new el, and wrap its js
        else if (line[5])
          out.push( "e_('"+name+"', "+attrs+", ("+line[6]+").toString())");
          
        // Otherwise push a vanilla element with some text
        else {
          out.push( "e_('"+name+"', "+attrs+", '"+esc(line[6])+"')"); 
        }
      }
      
      // - Plain text line
      else out.push( "'" + esc(line[2]||'') + "'" );
      
      // Set last x-position to this line's
      x = col;
    }
    
    // Close up any open elements & control structures
    for (var n = 0, len = open.length; n<len; n++)
      out.push( open.shift() ? '; } return _$_;})()' : '; })' );
    out.push( " + '';}" );
    // console.log(out.join(''));
    // Finally return a new function from our string
    try {
      return new Function( 'context', out.join('') );
    } catch(e) {
      return function(){ return 'Error: ' + e.message };
    }
  };
  
  // 'Haml.render' is a convenience function to compile a template
  // and render it to HTML with local vars in one fell swoop
  Haml.render = function (haml, vars) {
    return Haml.compile( haml ) ( vars || {} );
  };
  
  
})( Haml );