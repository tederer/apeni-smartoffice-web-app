/* global smartoffice, common, assertNamespace */

assertNamespace('smartoffice');

smartoffice.StatusDiv = function StatusDiv(bus, cssSelector) {
    var initialized     = false;
    var configAvailable = false;

    var initializeTab = function initializeTab(config) {
        if (initialized) {
            return;
        }

        initialized = true;
        $(cssSelector).html('<p id="message"></p>');
    };

    var showStatusMessage = function showStatusMessage(message) {
        initializeTab();
        $(cssSelector + ' #message').text(message);
        $(cssSelector).removeClass('d-none');
    };

    var hideStatusMessage = function hideStatusMessage() {
        initializeTab();
        $(cssSelector + ' #message').text('');
        $(cssSelector).addClass('d-none');
    };

    var updateStatus = function updateStatus() {
        if (configAvailable) {
            hideStatusMessage();
        } else {
            showStatusMessage('Loading configuration ...');
        }
    };

    var onConfigReceived = function onConfigReceived(newConfig) {
        configAvailable = newConfig !== undefined;
        updateStatus();
    };

    bus.subscribeToPublication(smartoffice.client.topics.configuration, onConfigReceived);    
};