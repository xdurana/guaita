/* Avoid `console` errors in browsers that lack a console. */
(function() {
    var method;
    var noop = function () {};
    var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());


/* Spin plugin */
$.fn.spin = function(opts, color) {
    return this.each(function() {
      var $this = $(this),
        data = $this.data();

      if (data.spinner) {
        data.spinner.stop();
        delete data.spinner;
      }
      if (opts !== false) {
        opts = $.extend(
          { color: color || $this.css('color') },
          $.fn.spin.presets[opts] || opts
        )
        data.spinner = new Spinner(opts).spin(this)
      }
    })
}

$.fn.spin.presets = {
    tiny: { lines: 8, length: 2, width: 2, radius: 3, speed: 1.3, trail: 50 },
    small: { lines: 9, length: 3, width: 2, radius: 4, speed: 1.3, trail: 50 },
    large: { lines: 10, length: 8, width: 4, radius: 8, speed: 1.3, trail: 50 }
}