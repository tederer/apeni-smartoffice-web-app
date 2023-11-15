/* global smartoffice, common, assertNamespace */

assertNamespace('smartoffice');

smartoffice.AccountTab = function AccountTab(bus, cssSelector, keycloak) {
   var thisInstance = this;
   var initialized  = false;

   var initializeTab = function initializeTab(config) {
      if (initialized) {
         return;
      }

      initialized = true;
      var htmlContent = '';

      htmlContent += '<div class="container bg-body-secondary rounded-3 mt-3">';
      htmlContent += '   <p id="name"></p>';
      htmlContent += '   <p id="email"></p>';
      htmlContent += '</div>';
      htmlContent += '<div class="container">';
      htmlContent += '   <button id="logout"          class="btn btn-outline-success m-1" type="button">Logout</button>';
      htmlContent += '   <button id="showIdToken"     class="btn btn-outline-success m-1" type="button">Show ID Token</button>';
      htmlContent += '   <button id="showAccessToken" class="btn btn-outline-success m-1" type="button">Show Access Token</button>';
      htmlContent += '</div>';
      htmlContent += '<hr>';
      htmlContent += '<pre id="output"></pre>';

      $(cssSelector).html(htmlContent);

      thisInstance.pollJsonData(config.apiGatewayBaseUrl + '/account', jsonData => {
         if (jsonData &&
            (typeof(jsonData.firstName) === 'string') &&
            (typeof(jsonData.lastName)  === 'string') &&
            (typeof(jsonData.userName)  === 'string')) {
            var nameText = jsonData.firstName + ' ' + jsonData.lastName + ' (' + jsonData.userName + ')';
            $(cssSelector + ' #name').text(nameText);
            $(cssSelector + ' #email').text(jsonData.email);
            bus.publish(smartoffice.client.topics.account.username, jsonData.userName);
         }
      });

      var output = function output(content) {
         if (typeof content === 'object') {
            content = JSON.stringify(content, null, 2);
         }
         $('#output').text(content);
      };

      document.getElementById('showIdToken').addEventListener(    'click', () => output(keycloak.idTokenParsed));
      document.getElementById('showAccessToken').addEventListener('click', () => output(keycloak.tokenParsed));
      document.getElementById('logout').addEventListener(         'click', () => keycloak.logout());
   };

   var onConfigReceived = function onConfigReceived(config) {
      if (config) {
         initializeTab(config);
      }
   };

   bus.subscribeToPublication(smartoffice.client.topics.configuration, onConfigReceived);    
};

smartoffice.AccountTab.prototype = new smartoffice.Tab();