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
 - Update the library to instantiate programmatically to allow load-time configuration
 - Update the location calculations to work better on Mobile/Small Screens
 - Add more configuration options for styling
 - Put the CSS in the JS to control/change the class prefixes
 - Allow overriding the tour's functions (next/prev/exit)
 
## How To Use
There are currently 3 parts to this:
 - CSS
 - HTML
 - JS
 
I'd recommend minifying the CSS and JS before using in production. The files aren't large, but 
everything adds up.

Obviously, include the CSS and JavaScript files in your HTML page. I put the CSS in the head 
and put the JS script tag as one of the last items in the HTML Body.

#### HTML Attributes

In the HTML, for each DOM you want to add to the tour, you must add at least one attribute to the
DOM:
 - "data-tour-title" : This attribute should be assigned the title of the DOM object tour stop.
   - example: `<div data-tour-title="DIV DOM Object"></div>`
 - "data-tour-description" : This attribute should be assigned the description of what the tour item is.
   - example: `<div data-tour-description="This is a DIV HTML object. It's used to be a container for other DOMs"></div>`
   
Both of these attributes can  (and really should) be used together. However, only one is necessary.

#### Ordering Tour Stops

To enforce an order of which tour items are stopped at, you can add an index attribute:
 - example: `<div data-tour-index="1"></div>`
 
The tour items are ordered by the index in a general integer sort. So you can skip numbers if that makes
things easy. The order will start at 0. I haven't tested it, but it's possible you can go into
negative numbers.

Items without an index are actually defaulted to an index of `9999`.

#### Programmatically Controlling the Tour

The tour assigns a window-scoped dict object as `PageTour` at initialization. The `PageTour` object has 4 publicly accessible methods:
 - .open() - Opens the tour. If the tour has previously been opened, it will open from where it was left off.
 - .next() - Moves the tour on to the next tour item.
 - .prev() - Moves the tour back to the previous tour item.
 - .exit() - Closes the tour.
 
The only method completely necessary for tour operation is the `.open()` method. This starts the tour.
However, controls to proceed through the tour and exit the tour are displayed in the tour.