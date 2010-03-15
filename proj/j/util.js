$.fn.scrollbar = function scrollbar(opts) {
  return this.each(function(n, item) {
    var cbks, down, drag_off, draggin, handle, kore, max_pos, move, pos, trck_off, up, update, val;
    kore = $(item);
    handle = kore.find('.handle:first').css({
      position: 'absolute',
      top: 0
    });
    cbks = opts;
    draggin = false;
    drag_off = 0;
    val = 0;
    pos = 0;
    max_pos = kore.height() - handle.height();
    trck_off = 0;
    down = function down(e) {
      e.preventDefault();
      draggin = true;
      trck_off = kore.offset().top;
      drag_off = e.pageY - trck_off - pos;
      if (cbks.start && typeof cbks.start === 'function') {
        return cbks.start(e);
      }
    };
    move = function move(e) {
      max_pos = kore.height() - handle.height();
      var nu_val;
      if (!(draggin)) {
        return true;
      }
      e.preventDefault();
      pos = e.pageY - trck_off - drag_off;
      pos = (function() {
        if (pos < 0) {
          return 0;
        } else if (pos > max_pos) {
          return max_pos;
        } else {
          return pos;
        }
      })();
      nu_val = pos / max_pos;
      val = nu_val;
      return update(e);
    };
    up = function up(e) {
      if (!(draggin)) {
        return true;
      }
      e.preventDefault();
      draggin = false;
      if (cbks.end && typeof cbks.end === 'function') {
        return cbks.end(e);
      }
    };
    update = function update(e,evt) {
      handle.css({
        top: pos
      });
      if (!evt && cbks.move && typeof cbks.move === 'function') {
        return cbks.move(e, val);
      }
    };
    item.val = function(newval, evt) {
      val = newval;
      pos = val * max_pos;
      return update(null, evt);
    };
    item.scroll = function scroll(delta) {
      val += delta;
      val = (function() {
        if (val < 0) {
          return 0;
        } else if (val > 1) {
          return 1;
        } else {
          return val;
        }
      })();
      pos = val * max_pos;
      return update();
    };
    $(document).mousemove(move).mouseup(up);
    return handle.mousedown(down);
  });
};
