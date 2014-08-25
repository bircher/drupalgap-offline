

/**
 * refresh a given node
 */
function offline_refresh_node(nid) {
  // remove the node from local storage
  _entity_local_storage_delete('node', nid);
  // remove node from DOM
  drupalgap_remove_page_from_dom('node_' + nid);
  // load node into local storage (it will be loaded into DOM when viewed)
  node_load(nid, {
    success:function(node){
      // do nothing
    }
  });
}


/**
 * Implements hook_deviceready().
 */
function offline_deviceready() {
  
  var offline_connect = variable_get('offline_connect', false);
  if (offline_connect) {
    offline_connect = JSON.parse(offline_connect);
    // set the drupalgap variables
    drupalgap = offline_assign_offline_variables(offline_connect, drupalgap);
    // no need to connect
    return false;
  }
  else {
    return true;
  }
}

/**
 * Implements hook_device_connected().
 */
function offline_device_connected() {
  // save the variables which were fetched while connecting.
  var offline_connect = {};
  offline_connect = offline_assign_offline_variables(drupalgap, offline_connect);
  variable_set('offline_connect', offline_connect);
}

/**
 * Implements hook_device_offline().
 */
function offline_device_offline() {
  var offline_connect = variable_get('offline_connect', false);
  if (offline_connect) {
    offline_connect = JSON.parse(offline_connect);
    // set the drupalgap variables
    drupalgap = offline_assign_offline_variables(offline_connect, drupalgap);
  }
}

/**
 * transfer offline connection related variables.
 */
function offline_assign_offline_variables(from_variable, to_variable) {
  to_variable.content_types_list = from_variable.content_types_list;
  to_variable.date_formats = from_variable.date_formats;
  to_variable.date_types = from_variable.date_types;
  to_variable.entity_info = from_variable.entity_info;
  to_variable.field_info_extra_fields = from_variable.field_info_extra_fields;
  to_variable.field_info_fields = from_variable.field_info_fields;
  to_variable.field_info_instances = from_variable.field_info_instances;
  to_variable.site_settings = from_variable.site_settings;
  to_variable.taxonomy_vocabularies = from_variable.taxonomy_vocabularies;
  
  return to_variable;
}

/**
 * Implements hook_menu().
 */
function offline_menu() {
  var items = {};

  items['offline_content'] = {
    title: 'Offline mode',
    page_callback: 'offline_content_page'
  }
  return items;
}

/**
 * Call back for the content offline page.
 * @return {Object}
 */
function offline_content_page() {
  try {  
    var content = {
      'message': {
        'markup': '<h2>Failed Connection</h2>' +
          "<p>The requested content is not available offline.</p>"
      },
      'back': {
        'theme': 'button',
        'text': 'Back',
        'attributes': {
          'onclick': 'javascript:drupalgap_back();'
        }
      },
      'footer': {
        'markup': "<p>Check your device's network settings and try again.</p>"
      }
    };
    return content;
  }
  catch (error) { console.log('offline_content_page - ' + error); }
}

/**
 * Implements hook_drupalgap_goto_preprocess().
 */
function offline_drupalgap_goto_preprocess(path) {
  try {
    if (navigator.connection.type == Connection.NONE) {
    // !drupalgap.online
      var router_path = drupalgap_get_menu_link_router_path(path);
      
      // here we rely on the fact that the node path matches with the local storage key
      // this may not work so well in other cases...
      var page_id = drupalgap_get_page_id(path);
      entity = window.localStorage.getItem(page_id);
      if (entity || router_path.indexOf('%') === -1) {
        // the page is available
        return;
      }
      else {
        // make a backup and remove the router path, forcing a 404
        drupalgap.menu_links_backup = drupalgap.menu_links[router_path];
        delete drupalgap.menu_links[router_path];
        return;
      }
    }
  }
  catch (error) {
    console.log('offline_drupalgap_goto_preprocess - ' + error);
  }
}

/**
 * Implements hook_404().
 */
function offline_404(router_path) {
  // reset the menu_links, we already triggered the 
  drupalgap.menu_links[router_path] = drupalgap.menu_links_backup;
  dpm(drupalgap.menu_links);
  if(drupalgap.menu_links[router_path]) {
    return 'offline_content';
  }
  else {
    return false;
  }
}


/**
 * Drupal Services XMLHttpRequest Object.
 * hack the jdrupal version.
 */
originalDrupalServiceCall = Drupal.services.call;
Drupal.services.call = function(options) {
  if (navigator.connection.type == Connection.NONE) {
  // !drupalgap.online
    var error = 'There is currently no connection!';
    options.error(null, null, error);
    
    alert('There is currently no connection!');
    return;
  }
  return originalDrupalServiceCall(options);
};
