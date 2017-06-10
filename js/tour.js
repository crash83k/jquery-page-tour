(function (opts) {

  var _o = $.extend({
    prefix : 'tour',
    horizontalPadding : 20,
    verticalPadding : 5,
    generalPadding : 5,
    nextText : 'Next',
    prevText : 'Previous',
    exitText : 'Exit',
    thisControl : 'PageTour'
  }, opts);

  var dims = {};
  var doms = [];
  var elId = 0;
  var resizeTimer;
  var elements = {
    body : $('body'),
    overlay : $('<div></div>', { id : _o.prefix + '_overlay' }),
    tour : $('<div></div>', { id : _o.prefix + '_tour' }),
    title : $('<div></div>', {
      class : _o.prefix + '_title ' + _o.prefix + '_box_transition',
    }),
    description : $('<div></div>', {
      class : _o.prefix + '_description ' + _o.prefix + '_box_transition',
    }),
    descriptionText : $('<span></span>'),
    controls : $('<div></div>', {
      class : _o.prefix + '_controls'
    }),
    exit : $('<a></a>', {
      class : 'btn btn-danger',
      html : _o.exitText,

    }),
    targets : $('<div></div>', {
      id : _o.prefix + '_targets',
      class : _o.prefix + '_element_transition ' + _o.prefix + '_glow ' + _o.prefix + '_animation_delay2'
    }),
    nextBtn : $('<a></a>', {
      html : _o.nextText,
      class : 'btn btn-primary'
    }),
    prevBtn : $('<a></a>', {
      html : _o.prevText,
      class : 'btn btn-default'
    }),
    shadow : $('<div></div>', { class : _o.prefix + '_shade' })
  };

  function __init() {
    var medTarg = $('<div></div>', {
      class : _o.prefix + '_target ' +
      _o.prefix + '_target_medium ' +
      _o.prefix + '_element_transition ' +
      _o.prefix + '_glow ' +
      _o.prefix + '_animation_delay1'
    });
    var smTarg = $('<div></div>', {
      class : _o.prefix + '_target ' +
      _o.prefix + '_target_small ' +
      _o.prefix + '_element_transition ' +
      _o.prefix + '_glow'
    });

    medTarg.append(smTarg);
    elements.targets.append(medTarg);

    elements.prevBtn.on('click', next);
    elements.nextBtn.on('click', prev);
    elements.exit.on('click', exit);
    elements.description.append(elements.descriptionText);
    elements.controls.append(elements.prevBtn, elements.nextBtn, elements.exit);
    elements.tour
      .append(
        elements.overlay,
        elements.title,
        elements.description,
        elements.controls,
        elements.targets
      ).css({ 'display' : 'none', 'top' : 0, 'left' : 0 });
    elements.overlay.css({ 'position' : 'absolute', 'top' : 0, 'left' : 0 })
      .append(elements.shadow);
    elements.body.prepend(elements.tour);

    discoverDoms();

    if (doms.length === 0) {
      console.log("No tour elements.");
    }

    window[ _o.thisControl ] = {
      rediscover : discoverDoms,
      next : next,
      prev : prev,
      open : open,
      exit : exit
    };

    $(window).resize(function () {
      clearTimeout(resizeTimer);
      if (elements.tour.is(':visible')) {
        resizeTimer = setTimeout(function () {
          run();
        }, 100);
      }
    });
  }

  function open() {
    elements.tour.show();
    run()
  }

  function run() {
    updateTourTitle(doms[ elId ].attr('data-' + _o.prefix + '-title') || '');
    updateTourDesc(doms[ elId ].attr('data-' + _o.prefix + '-description') || '');
    doTourCalculations();
    shadowElement();
    flowTargets();
    flowTour()
  }

  function next() {
    elId = elId + 1 === doms.length ? 0 : elId + 1;
    run();
  }

  function prev() {
    elId = elId === 0 ? doms.length - 1 : elId - 1;
    run();
  }

  function exit() {
    elements.tour.hide();
  }

  function shadowElement() {
    elements.shadow.css({
      height : dims[ 'elHeight' ] + _o.generalPadding,
      width : dims[ 'elWidth' ] - _o.generalPadding,
      left : dims[ 'elLeft' ] - (_o.generalPadding * 2),
      top : dims[ 'elTop' ] - (_o.generalPadding * 2),
      'box-shadow' : '0px 0px 4px 5px rgba(0,0,0,0.8) inset, 0px 0px 0px 2000px rgba(0,0,0,0.8)'
    });
  }

  function discoverDoms() {
    doms = [];
    $('[data-' + _o.prefix + '-title], [data-' + _o.prefix + '-description]')
      .each(function () {
        doms.push($(this));
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
    var myX = dims[ 'elCenterX' ] - (sqSize / 2);
    var myY = dims[ 'elCenterY' ] - (sqSize / 2);

    // Animate the targets to the correct size and coordinates.
    $('#tour_targets').css({
      width : sqSize,
      height : sqSize,
      left : myX - (_o.horizontalPadding / 2) + _o.generalPadding,
      top : myY - _o.verticalPadding / 2
    });

  }

  function flowTour() {
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

    var offset = doms[ elId ].offset().top - 120;
    var title = dims[ 'title_y' ] - 10;

    $('html, body').animate({
      scrollTop : offset > title ? offset : title
    }, 600);
  }

  function updateTourTitle(title) {
    var div = elements.title; // Get the title object.

    if (title === '') div.hide();
    else div.show();

    // Update the title of the tour.
    div.html(title); // Set the title.
    var newWidth = div.textWidth(); // Figure out the width of the title based on CSS font size and the text hit box size.
    div.width(newWidth * 2.5); // Set the width of the title for reflow calculation.
  }

  function updateTourDesc(text) {
    var div = elements.description; // Get the parent description object.

    if (text === '') div.hide();
    else div.show();

    // Update the description of the tour element.
    var desc = div.children('span').first(); // Get the description span object.
    //var controls = div.children('.tour_controls'); // in the future there may be a reason to update the controls.

    desc.html(text); // Set the description.
  }

  function doTourCalculations() {
    /*
     * Calculates out all the X/Y locations for where to put the title and the description/controls
     * base on the coordinates and dimensions of the show element and the tour elements.
     */

    // Get all the height/width and X/Y coordinates of all the elements involved with the tour
    // including the window viewport dimensions.
    var titleIs;
    var titleHeight = parseInt(elements.title.outerHeight());
    var titleWidth = parseInt(elements.title.outerWidth());
    var descHeight = parseInt(elements.description.outerHeight());
    var descWidth = parseInt(elements.description.outerWidth());
    dims[ 'descHeight' ] = descHeight;
    dims[ 'winWidth' ] = parseInt($(window).outerWidth());
    dims[ 'winHeight' ] = parseInt($(window).outerHeight());
    dims[ 'elWidth' ] = parseInt(doms[ elId ].outerWidth());
    dims[ 'elHeight' ] = parseInt(doms[ elId ].outerHeight());
    dims[ 'elLeft' ] = doms[ elId ].offset().left;
    dims[ 'elTop' ] = doms[ elId ].offset().top;
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
      dims[ 'desc_y' ] = dims[ 'title_y' ] + (_o.verticalPadding * 2) + ((titleIs === 'left') ? titleHeight + _o.verticalPadding : 0);
    } else if (dims[ 'rightSpace' ] >= (descWidth + (_o.horizontalPadding * 2))) { // Check the right side space
      dims[ 'desc_x' ] = dims[ 'elLeft' ] + dims[ 'elWidth' ] + _o.horizontalPadding;
      dims[ 'desc_y' ] = dims[ 'title_y' ] + (_o.verticalPadding * 2) + ((titleIs === 'right') ? titleHeight + _o.verticalPadding : 0);
    } else if (dims[ 'topSpace' ] >= (descHeight + (_o.verticalPadding * 4) + ((titleIs === 'top') ? titleHeight : 0)) && titleIs === 'top') { // check for space above the element
      dims[ 'desc_y' ] = dims[ 'elTop' ] - _o.verticalPadding - descHeight - ((titleIs === 'top') ? titleHeight + _o.verticalPadding : 0);
      dims[ 'desc_x' ] = (dims[ 'winWidth' ] / 2) - titleWidth;
      if (titleIs === 'top') {
        dims[ 'title_y' ] -= descHeight;
      }
    } else { // Must go on the bottom.
      dims[ 'desc_x' ] = (dims[ 'winWidth' ] / 2) - descWidth;
      dims[ 'desc_y' ] = dims[ 'elTop' ] + dims[ 'elHeight' ] + (_o.verticalPadding * 2) + ((titleIs === 'bottom') ? titleHeight + _o.verticalPadding : 0);
      if (titleIs === 'right') {
        dims[ 'desc_x' ] = dims[ 'title_x' ] - (descWidth * 0.25);
        dims[ 'desc_y' ] = dims[ 'desc_y' ] + _o.verticalPadding;
      }
    }
  }

  $.fn.textWidth = function () {
    var org = $(this);
    var html = $('<span>' + org.html() + '</span>');
    console.log(org.css('font-size'));
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
  };

  __init();
})({});