# jquery-page-tour
JQuery-powered tour library that displays information about the page the user is on.

This is a quick little helper to spotlight DOMs on the page. Inspiration comes from Google's Android and Web-app help screens.

## What does it do?
This library lets you highlight DOMs on the page, and explain what their purpose is to the user.

## Features:
 - Spotlights DOM objects
 - Displays a title and description of each DOM object.
 - Places animated targets around the DOM object to add emphasis on where to look.
 - Programmatically can move to next/previous items in the tour.
 - Items can be ordered.
 - Recalculates positions after window resizes.
 
## Things To Do Still
 - Update the location calculations to work better on Mobile/Small Screens
 - Add more configuration options for styling
 - Allow overriding the tour's functions (next/prev/exit)
 
## How To Use

#### Prerequisites

 - jQuery 3.x
 - A modern browser that has CSS transitions and animations.
 - (optional) Bootstrap 3.x/4.x

**Note:** By default, there are Bootstrap 3.x/4.x classes used for the control links in the tour.
If you want to use them, you'll need to include the Bootstrap style sheet in your HTML.
Otherwise, you'll probably want to add some style classes for the links and set them 
in the instantiation options.

#### Instantiation and Options

I'd recommend minifying the JS before using in production. The file isn't large, but 
everything adds up.

Obviously, include the JavaScript file in your HTML page. It's best practice to
 put the JS script tag as one of the last items in the HTML Body.


###### Basic Instantiation

The Page Tour JS file should be included _after_ the jQuery library.

**Note:** When the tour initializes, it appends a style tag and a number of CSS rules to the document body.
 If the names of these rules conflict with your application's CSS, you can change the prefix used for the library.
 
After the JS file has been included on the page, the library can be instantiated by calling the page tour function:
 ```JavaScript 
// Instantiate the actual page tour object.
var PageTour;
try {
    PageTour = $.fn.PageTour();
} catch (e) {
    console.error('Cannot start page tour: ', e);
}
 ```

###### Options

You can instantiate the Page Tour with your own options:

```JavaScript
var PageTour = $.fn.PageTour({ /* options */ });
```

The following options are exposed:
 - `prefix` - [string default: 'tour'] Use this to change the full prefix of the CSS and HTML data attributes
 - `horizontalPadding` - [integer default: 20] - Used to add left/right padding to tour elements
 - `verticalPadding` - [integer default: 5] - Used to add top/bottom padding to tour elements
 - `generalPadding` - [integer default: 5] - Used to add padding to target and shadow elements
 - `nextText` - [string default: 'Next'] - The text shown on the "next" link.
 - `prevText` - [string default: 'Previous'] - The text shown on the "previous" link.
 - `exitText` - [string default: 'Exit'] - The text shown on the "exit" link.
 - `nextClass` - [string default: 'btn btn-primary'] - The class for the "next" link.
 - `prevClass` - [string default: 'btn btn-default'] - The class for the "previous" link.
 - `exitClass` - [string default: 'btn btn-danger'] - The class for the "exit" link.
 - `defaultIndex` - [integer default: '9999'] - The default index of items without a manually set index.


#### HTML Attributes

In the HTML, for each DOM you want to add to the tour, you must add at least one attribute to the
DOM: 
 - `data-<prefix>-title`: This attribute should be assigned the title of the DOM object tour stop.
   - example: `<div data-tour-title="DIV DOM Object"></div>`
 - `data-<prefix>-description`: This attribute should be assigned the description of what the tour item is.
   - example: `<div data-tour-description="This is a DIV HTML object. It's used to be a container for other DOMs"></div>`

**Note:** In our examples, the prefix is the default "tour" prefix.
   
Both of these attributes can  (and really should) be used together. However, only one is necessary.

#### Ordering Tour Stops

To enforce an order of which tour items are stopped at, you can add the `data-<prefix>-index` attribute:
 - example: `<div data-tour-index="1"></div>`
 
The tour items are ordered by the index in a general integer sort. So you can skip numbers if that makes
things easy. You can also use negative numbers.

Items without an index are actually defaulted to an index of `9999`, though that can be changed via the 
`defaultIndex` option.

#### Programmatically Controlling the Tour

The tour assigns a window-scoped dict object as `PageTour` at initialization. The `PageTour` object has 4 publicly 
accessible methods:
 - `.open()` - Opens the tour. If the tour has previously been opened, it will open from where it was left off.
 - `.next()` - Moves the tour on to the next tour item.
 - `.prev()` - Moves the tour back to the previous tour item.
 - `.exit()` - Closes the tour.
 - `.rediscover()` - [deprecated] Rediscover any new DOMs on the page. This is not really necessary at all. Each time the tour is 
 opened, the DOMs are rediscovered.
 
The only method completely necessary for tour operation is the `.open()` method. This starts the tour.
However, controls to proceed through the tour and exit the tour are displayed in the tour.

Example:
```JavaScript
// Instantiate the tour:
var PageTour = $.fn.PageTour();

// Open the tour:
PageTour.open();
```