

/**
 * refresh a given node
 */
function offline_refresh_node(nid) {
  // remove the node from local storage
  _entity_local_storage_delete('node', nid);
  // remove node from DOM
  drupalgap_remove_page_from_dom('node_' + nid);
  // load node into local storage (it will be loaded into DOM when viewed)
  node_load(nid, {});
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
