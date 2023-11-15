/* global smartoffice, common, Keycloak, Headers, fetch */

$( document ).ready(async function() {
    const keycloak = new Keycloak();
    const http     = new smartoffice.common.Http(keycloak);
    const bus      = new common.infrastructure.bus.Bus();
        
    var showTab = function showTab(event) {
        var targetId = event.target.id;
        
        var tabs = $('body > div');

        for(var i = 0; i < tabs.length; i++) {
           var tab = tabs[i];
           if (tab.id.endsWith('Tab')) {
              if(tab.id === targetId + 'Tab') {
                 $(tab).removeClass('d-none');
              } else {
                 $(tab).addClass('d-none');
              }
           }
        }
     
        $('.collapse').collapse('hide');
    };

    var loadConfiguration = async function loadConfiguration() {
        return new Promise((resolve, reject) => {
            http.get('/configuration')
                .then(configAsString => {
                    try {
                        resolve(JSON.parse(configAsString));
                    } catch(err) {
                        reject(new Error('Failed to convert received configuration to JSON: ' + err));
                    }
                })
                .catch(err => reject(new Error('Failed to download configuration: ' + err)));
        });
    };

    keycloak.onTokenExpired = () => {
        keycloak.updateToken()
            .then(successful => {
                if (!successful) {
                    console.log('failed to update token -> redirecting to login page');
                    keycloak.login();
                }
            })
            .catch(err => {
                console.log(err);
                keycloak.login();
            });
    };

    new smartoffice.StatusDiv(bus, '#status');
    bus.publish(smartoffice.client.topics.configuration, undefined);

    keycloak.init({ onLoad: 'login-required', enableLogging: true, checkLoginIframe: false})
        .then(async authenticated => {
            if(authenticated) {
                var config       = await loadConfiguration();
                smartoffice.http = new smartoffice.common.Http(keycloak);
                
                new smartoffice.AccountTab(bus, '#accountTab', keycloak);
                new smartoffice.BookingTab(bus, '#bookingTab', keycloak);
                new smartoffice.ImagesTab(bus, '#imagesTab');
                new smartoffice.InfoTab(bus, '#infoTab');
                
                bus.publish(smartoffice.client.topics.configuration, config);
            } 
        }) 
        .catch(err => {
            console.log('failed to initialize keycloak:' + err);
        });

    $('#navbarToggler a').click(showTab);
});
