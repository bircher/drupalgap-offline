offline
=======

Make the drupalgap app save the content offline

Setup
=====

Clone this repository as "offline" in your apps modules directory and enable it like another contrib module.

The module is currently only tested for anonymous users.

The module caches the connection so that it can be started in offline mode.
The intended purpose is to work with indefinite cache enabled and then reloading the cached nodes when the user clicks on refresh.
call the provided offline_refresh_node(nid) to make this smoother.


To be able to start the app in offline mode you will have to implement the menu callback for `offline`
for example:

```js
/**
 * Implements hook_menu().
 */
function mymodule_menu() {
  var items = {};

  // the core offline page is herewith overridden and we serve the normal content.
  items['offline'] = {
    title: 'Offline mode',
    page_callback: 'mymodule_offline_page'
  }
  return items;
}


/**
 * Call back for the offline page.
 * @return {Object}
 */
function mymodule_offline_page() {
  try {
    if (variable_get('offline_connect', false)) {
      drupalgap_goto('start'); // the normal start you use...
    }
  
    var content = {
      'message': {
        'markup': '<h2>Failed Connection</h2>' +
          "<p>The first time the app is used it needs to connect to the internet in order to fetch the content.</p>"
      },
      'try_again': {
        'theme': 'button',
        'text': 'Try Again',
        'attributes': {
          'onclick': 'javascript:offline_try_again();'
        }
      },
      'footer': {
        'markup': "<p>Check your device's network settings and try again.</p>"
      }
    };
    return content;
  }
  catch (error) { console.log('mymodule_offline_page - ' + error); }
}
```