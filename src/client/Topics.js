/* global smartoffice, assertNamespace */

require('./common/NamespaceUtils.js');

assertNamespace('smartoffice.client.topics.account');

//                PUBLICATIONS

/**
 * The client publishes on this topic its configuration.
 */
smartoffice.client.topics.configuration = '/client/configuration';

/**
 * The client publishes on this topic the user name of the current user
 */
smartoffice.client.topics.account.username = '/client/account/username';
