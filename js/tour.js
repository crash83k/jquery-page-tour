$.fn.PageTour = function (opts) {
  var
    _o = $.extend({
      prefix : 'tour',
      horizontalPadding : 20,
      verticalPadding : 5,
      generalPadding : 5,
      nextText : 'Next',
      prevText : 'Previous',
      exitText : 'Exit',
      nextClass : 'btn btn-primary',
      prevClass : 'btn btn-default',
      exitClass : 'btn btn-danger',
      defaultIndex : 9999,
      styleOverwrites : {}
    }, opts),
    programmatic = false,
    programmaticNext = function () {},
    programmaticPrev = function () {},
    dims = {},
    doms = [],
    elId = 0,
    resizeTimer,
    elements = {
      body : $('body'),
      style : $('<style></style>'),
      overlay : $('<div></div>', { id : _o.prefix + '_overlay' }),
      tour : $('<div></div>', { id : _o.prefix + '_tour' }),
      title : $('<div></div>', {
        class : _o.prefix + '_title ' + _o.prefix + '_box_transition'
      }),
      description : $('<div></div>', {
        class : _o.prefix + '_description ' + _o.prefix + '_box_transition'
      }),
      descriptionText : $('<span></span>'),
      controls : $('<div></div>', {
        class : _o.prefix + '_controls'
      }),
      targets : $('<div></div>', {
        id : _o.prefix + '_targets',
        class : _o.prefix + '_element_transition ' + _o.prefix + '_glow ' + _o.prefix + '_animation_delay2'
      }),
      nextBtn : $('<a></a>', {
        html : _o.nextText,
        class : _o.nextClass
      }),
      prevBtn : $('<a></a>', {
        html : _o.prevText,
        class : _o.prevClass
      }),
      exit : $('<a></a>', {
        html : _o.exitText,
        class : _o.exitClass
      }),
      shadow : $('<div></div>', { class : _o.prefix + '_shade' })
    };

  function __init() {
    var
      medTarg = $('<div></div>', {
        class : _o.prefix + '_target ' +
        _o.prefix + '_target_medium ' +
        _o.prefix + '_element_transition ' +
        _o.prefix + '_glow ' +
        _o.prefix + '_animation_delay1'
      }),
      smTarg = $('<div></div>', {
        class : _o.prefix + '_target ' +
        _o.prefix + '_target_small ' +
        _o.prefix + '_element_transition ' +
        _o.prefix + '_glow'
      });

    medTarg.append(smTarg);
    elements.targets.append(medTarg);

    elements.prevBtn.on('click', prev);
    elements.nextBtn.on('click', next);
    elements.exit.on('click', exit);

    elements.description
      .append(elements.descriptionText);

    elements.controls
      .append(
        elements.prevBtn,
        elements.nextBtn,
        elements.exit
      );

    elements.tour
      .css({ display : 'none', top : 0, left : 0 })
      .append(
        elements.overlay,
        elements.title,
        elements.description,
        elements.controls,
        elements.targets
      );

    elements.overlay
      .css({ position : 'absolute', top : 0, left : 0 })
      .append(elements.shadow);

    elements.body.prepend(elements.tour);

    $(window).resize(function () {
      clearTimeout(resizeTimer);
      if (elements.tour.is(':visible')) {
        resizeTimer = setTimeout(function () {
          run();
        }, 100);
      }
    });

    setupStyle();
    elements.body.append(elements.style);

    return {
      switchTo : switchTo,
      next : next,
      prev : prev,
      open : open,
      exit : exit
    };
  }

  function open() {
    discoverDoms();

    if (doms.length === 0) {
      console.log("No tour elements.");
    } else {
      elements.tour.show();
      run();
    }
  }

  function switchTo(selector, options) {
    if (! options) options = {};
    programmatic = true;
    updateTourTitle(options.title || '');
    updateTourDesc(options.description || '');

    if (options.next) {
      programmaticNext = options.next;
      elements.nextBtn.show();
    } else {
      elements.nextBtn.hide();
    }
    if (options.prev) {
      elements.prevBtn.show();
      programmaticPrev = options.prev;
    } else {
      elements.prevBtn.hide();
    }

    elements.tour.show();

    var dom = typeof selector === 'string' ? $(selector) : selector;

    doTourCalculations(dom);
    shadowElement();
    flowTargets();
    flowTour(dom)
  }

  function run() {
    programmatic = false;
    updateTourTitle(doms[ elId ].attr('data-' + _o.prefix + '-title') || '');
    updateTourDesc(doms[ elId ].attr('data-' + _o.prefix + '-description') || '');
    doTourCalculations();
    shadowElement();
    flowTargets();
    flowTour()
  }

  function next() {
    if (! programmatic) {
      elId = elId + 1 === doms.length ? 0 : elId + 1;
      run();
    } else if (typeof programmaticNext === 'function') {
      programmaticNext();
    }
  }

  function prev() {
    if (! programmatic) {
      elId = elId === 0 ? doms.length - 1 : elId - 1;
      run();
    } else if (typeof programmaticPrev === 'function') {
      programmaticPrev();
    }
  }

  function exit() {
    elements.tour.hide();
  }

  function shadowElement() {
    elements.shadow.css({
      height : dims[ 'elHeight' ] + (_o.generalPadding * 4),
      width : dims[ 'elWidth' ] + (_o.generalPadding * 4),
      left : dims[ 'elLeft' ] - (_o.generalPadding * 2),
      top : dims[ 'elTop' ] - (_o.generalPadding * 2),
      'box-shadow' : '0px 0px 4px 5px rgba(0,0,0,0.8) inset, 0px 0px 5px 3000px rgba(0,0,0,0.8)'
    });
  }

  function discoverDoms() {
    // Rediscover means we're starting over
    elId = 0;

    doms = [];
    $('[data-' + _o.prefix + '-title], [data-' + _o.prefix + '-description]')
      .each(function () {
        doms.push($(this));
      });

    doms.sort(function (d1, d2) {
      var
        d1i = parseInt(d1.attr('data-' + _o.prefix + '-index') || _o.defaultIndex),
        d2i = parseInt(d2.attr('data-' + _o.prefix + '-index') || _o.defaultIndex);

      return d1i - d2i;
    });
  }

  function flowTargets() {

    var sqSize = dims[ 'elHeight' ] > dims[ 'elWidth' ]
      ? dims[ 'elHeight' ]
      : dims[ 'elWidth' ];

    // The sqSize smallest target must be bigger than the element.
    sqSize *= (1.5 * 1.5);

    // If the size of the box is tiny, give it a minimum height/width.
    if (sqSize < 100) sqSize = 100;

    // Find the X/Y to place the target box
    var
      myX = dims[ 'elCenterX' ] - (sqSize / 2),
      myY = dims[ 'elCenterY' ] - (sqSize / 2);

    // Animate the targets to the correct size and coordinates.
    $('#' + _o.prefix + '_targets').css({
      width : sqSize,
      height : sqSize,
      left : myX - (_o.horizontalPadding / 2) + _o.generalPadding,
      top : myY - _o.verticalPadding / 2
    });

  }

  function flowTour(dom) {
    if (! dom)
      dom = doms[ elId ]

    elements.title.css({
      'left' : dims[ 'title_x' ],
      'top' : dims[ 'title_y' ]
    });

    elements.description.css({
      'left' : dims[ 'desc_x' ],
      'top' : dims[ 'desc_y' ]
    });

    elements.controls.css({
      'left' : dims[ 'desc_x' ],
      'top' : dims[ 'desc_y' ] + dims[ 'descHeight' ] - _o.verticalPadding
    });

    var
      offset = dom.offset().top - 120,
      title = dims[ 'title_y' ] - 10;

    $('html, body').animate({
      scrollTop : offset > title ? offset : title
    }, 200);
  }

  function updateTourTitle(title) {
    var div = elements.title; // Get the title object.

    if (title === '')
      div.hide();
    else
      div.show();

    // Update the title of the tour.
    div.html(title); // Set the title.
    div.width(textWidth.apply(div) * 2.5); // Set the width of the title for reflow calculation.
  }

  function updateTourDesc(text) {
    var div = elements.description; // Get the parent description object.

    if (text === '')
      div.hide();
    else
      div.show();

    // Update the description of the tour element.
    var desc = div.children('span').first(); // Get the description span object.

    desc.html(text); // Set the description.
  }

  /**
   * Calculates out all the X/Y locations for where to put the title and the description/controls
   * base on the coordinates and dimensions of the show element and the tour elements.
   */
  function doTourCalculations(element) {
    if (! element) {
      element = doms[ elId ];
    }

    // Get all the height/width and X/Y coordinates of all the elements involved with the tour
    // including the window viewport dimensions.
    var
      titleIs,
      titleHeight = parseInt(elements.title.outerHeight()),
      titleWidth = parseInt(elements.title.outerWidth()),
      descHeight = parseInt(elements.description.outerHeight()),
      descWidth = parseInt(elements.description.outerWidth());

    dims[ 'descHeight' ] = descHeight;
    dims[ 'winWidth' ] = parseInt($(window).outerWidth());
    dims[ 'winHeight' ] = parseInt($(window).outerHeight());
    dims[ 'elWidth' ] = parseInt(element.outerWidth());
    dims[ 'elHeight' ] = parseInt(element.outerHeight());
    dims[ 'elLeft' ] = element.offset().left;
    dims[ 'elTop' ] = element.offset().top;
    dims[ 'elCenterX' ] = dims[ 'elLeft' ] + (dims[ 'elWidth' ] / 2);
    dims[ 'elCenterY' ] = dims[ 'elTop' ] + (dims[ 'elHeight' ] / 2);
    dims[ 'topSpace' ] = dims[ 'elTop' ];
    dims[ 'rightSpace' ] = dims[ 'winWidth' ] - (dims[ 'elLeft' ] + dims[ 'elWidth' ]);
    dims[ 'botSpace' ] = dims[ 'winHeight' ] - (dims[ 'elTop' ] + dims[ 'elHeight' ]); // How much space below the element
    dims[ 'leftSpace' ] = dims[ 'elLeft' ] - (_o.horizontalPadding * 2);

    // Get the X/Y coordinates for the title
    if (dims[ 'leftSpace' ] > (titleWidth + (_o.horizontalPadding * 2))) { // Check the left side space
      dims[ 'title_x' ] = dims[ 'elLeft' ] - titleWidth - (_o.horizontalPadding * 2);
      dims[ 'title_y' ] = dims[ 'elTop' ];
      if (dims[ 'topSpace' ] > ((titleHeight + descHeight + (_o.verticalPadding * 4)) / 3)) {
        dims[ 'title_y' ] = dims[ 'elTop' ] - ((titleHeight + descHeight + (_o.verticalPadding * 4)) / 3);
      }
      titleIs = 'left';
    } else if (dims[ 'rightSpace' ] > (titleWidth + (_o.horizontalPadding * 2))) { // Check the right side space
      dims[ 'title_x' ] = dims[ 'elLeft' ] + dims[ 'elWidth' ] + _o.horizontalPadding;
      dims[ 'title_y' ] = dims[ 'elTop' ];
      if (dims[ 'topSpace' ] > ((titleHeight + descHeight + (_o.verticalPadding * 4)) / 3)) {
        dims[ 'title_y' ] = dims[ 'elTop' ] - ((titleHeight + descHeight + (_o.verticalPadding * 4)) / 3);
      }
      titleIs = 'right';
    } else if (dims[ 'topSpace' ] > (titleHeight + (_o.verticalPadding * 2))) { // check for space above the element
      dims[ 'title_y' ] = dims[ 'elTop' ] - titleHeight - (_o.verticalPadding * 4);
      dims[ 'title_x' ] = (dims[ 'winWidth' ] / 2) - titleWidth;
      titleIs = 'top';
    } else { // Must go on the bottom.
      dims[ 'title_x' ] = (dims[ 'winWidth' ] / 2) - titleWidth;
      dims[ 'title_y' ] = dims[ 'elTop' ] + dims[ 'elHeight' ] + _o.verticalPadding;
      titleIs = 'bottom';
    }

    // Sets the page scrollTo Y coordinate based on the location of the title.
    if (titleIs !== 'bottom') {
      if ($(window).height() < (dims[ 'elTop' ] + dims[ 'elHeight' ])) {
        dims[ 'scrollTo' ] = dims[ 'title_y' ] - _o.verticalPadding;
      } else {
        dims[ 'scrollTo' ] = 0;
      }
    } else {
      dims[ 'scrollTo' ] = dims[ 'elTop' ] - (_o.verticalPadding * 2);
    }

    // Get the X/Y coordinates for the description/controls
    if (dims[ 'leftSpace' ] >= (descWidth + (_o.horizontalPadding * 2))) { // Check the left side space
      dims[ 'desc_x' ] = dims[ 'elLeft' ] - descWidth - (_o.horizontalPadding * 2);
      dims[ 'desc_y' ] = dims[ 'title_y' ] + (_o.verticalPadding * 2) + ((titleIs === 'left')
          ? titleHeight + _o.verticalPadding
          : 0
      );
    } else if (dims[ 'rightSpace' ] >= (descWidth + (_o.horizontalPadding * 2))) { // Check the right side space
      dims[ 'desc_x' ] = dims[ 'elLeft' ] + dims[ 'elWidth' ] + _o.horizontalPadding;
      dims[ 'desc_y' ] = dims[ 'title_y' ] + (_o.verticalPadding * 2) + ((titleIs === 'right')
          ? titleHeight + _o.verticalPadding
          : 0
      );
    } else if (dims[ 'topSpace' ] >= (descHeight + (_o.verticalPadding * 4) + ((titleIs === 'top')
          ? titleHeight
          : 0)
      ) && titleIs === 'top') { // check for space above the element
      dims[ 'desc_y' ] = dims[ 'elTop' ] - _o.verticalPadding - descHeight - ((titleIs === 'top')
          ? titleHeight + _o.verticalPadding
          : 0
      );
      dims[ 'desc_x' ] = (dims[ 'winWidth' ] / 2) - titleWidth;
      if (titleIs === 'top') {
        dims[ 'title_y' ] -= descHeight;
      }
    } else { // Must go on the bottom.
      dims[ 'desc_x' ] = (dims[ 'winWidth' ] / 2) - descWidth;
      dims[ 'desc_y' ] = dims[ 'elTop' ] + dims[ 'elHeight' ] + (_o.verticalPadding * 2) + ((titleIs === 'bottom')
          ? titleHeight + _o.verticalPadding
          : 0
      );
      if (titleIs === 'right') {
        dims[ 'desc_x' ] = dims[ 'title_x' ] - (descWidth * 0.25);
        dims[ 'desc_y' ] = dims[ 'desc_y' ] + _o.verticalPadding;
      }
    }
  }

  function setupStyle() {
    var styleSheet = '';
    var styles = {
      'overlay' : {
        selector : '#' + _o.prefix + '_tour, #' + _o.prefix + '_overlay',
        style : 'height: 100vh; width: 100%;'
      },
      'tour' : {
        selector : '#' + _o.prefix + '_tour',
        style : 'position: absolute;'
      },
      'title' : {
        selector : '.' + _o.prefix + '_title',
        style : 'top: 0; left: 0; text-shadow: 0 0 10px #aaa; color: white; font-size: 2em; position: absolute; font-weight: bold !important; width: 20rem;'
      },
      'description' : {
        selector : '.' + _o.prefix + '_description',
        style : 'top: 0; left: 0; box-shadow: 0 0 7px #666; border-radius: 7px; padding: 11px; color: white; font-size: 20px; position: absolute; width: 35rem; font-weight: normal !important;'
      },
      'controls' : {
        selector : '.' + _o.prefix + '_controls',
        style : 'top: 0; left: 0; margin: 8px 0; text-align: right; padding: 11px; color: white; font-size: 20px; position: absolute; z-index: 10000; transition: all 0.75s; transition-timing-function: ease-in-out;'
      },
      'control_buttons' : {
        selector : '.' + _o.prefix + '_controls .btn',
        style : 'margin-right: 10px; box-shadow: 0 0 3px white;'
      },
      'targets' : {
        selector : '#' + _o.prefix + '_targets',
        style : 'top: 0; left: 0; border-radius: 50%; border: 1px solid #333; position: absolute; opacity: 0.3;'
      },
      'target_large' : {
        selector : '.' + _o.prefix + '_target',
        style : 'border-radius: 50%; position: relative; height: 80%; width: 80%; top: 9%; padding: 0; margin: 0 auto;'
      },
      'target_small' : {
        selector : '.' + _o.prefix + '_target_small',
        style : 'border: 2px solid #aaa;'
      },
      'target_medium' : {
        selector : '.' + _o.prefix + '_target_medium',
        style : 'border: 2px solid #666;'
      },
      'transitions_main' : {
        selector : '.' + _o.prefix + '_element_transition',
        style : 'transition: all 0.75s; transition-timing-function: ease-in-out;'
      },
      'transition_box' : {
        selector : '.' + _o.prefix + '_box_transition',
        style : 'transition-property: top, left; transition-duration: 0.75s; transition-timing-function: ease-in-out;'
      },
      'transition_key_frame' : {
        selector : '@keyframes targetGlow',
        style : 'from { box-shadow: 0 0 1px rgba(64, 64, 64, 0.78); } to { box-shadow: 0 0 8px white; }'
      },
      'target_glow' : {
        selector : '.' + _o.prefix + '_glow',
        style : 'animation-duration: 1s; animation-name: targetGlow; animation-iteration-count: infinite; animation-direction: alternate;'
      },
      'target_delay_1' : {
        selector : '.' + _o.prefix + '_animation_delay1',
        style : 'animation-delay: 0.3s;'
      },
      'target_delay_2' : {
        selector : '.' + _o.prefix + '_animation_delay2',
        style : 'animation-delay: 0.6s;'
      },
      'spotlight' : {
        selector : '.' + _o.prefix + '_shade',
        style : 'overflow: hidden; transition: all 0.75s; transition-timing-function: ease-in-out; position: absolute; border-radius: 5px;'
      }
    };

    for (var style in styles) {
      if (! styles.hasOwnProperty(style)) return;

      styleSheet += styles[ style ].selector + ' { ';

      if (_o.styleOverwrites.hasOwnProperty(style)) {
        styleSheet += _o.styleOverwrites[ style ];
      } else {
        styleSheet += styles[ style ].style;
      }

      styleSheet += ' }\n';
    }

    elements.style.html(styleSheet);
  }

  function textWidth() {
    var org = $(this);
    var html = $('<span>' + org.html() + '</span>');
    html.css({
      'font-family' : org.css('font-family'),
      'font-size' : org.css('font-size'),
      'postion' : 'absolute',
      'width' : 'auto',
      'left' : '-9999px'
    });
    $('body').append(html);
    var width = html.outerWidth();
    html.remove();
    return width;
  }

  return __init();
};