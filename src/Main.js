/* global common, process, smartoffice, fetch */
require('./common/logging/LoggingSystem.js');
require('./common/Version.js');
require('./SimulatedSmartOfficeRestApi.js');

const express                       = require('express');
const stringReplace                 = require('string-replace-middleware');
const Keycloak                      = require('keycloak-connect');

const DEFAULT_PORT                  = 8080;
const DEFAULT_KEYCLOAK_URL          = 'http://smartoffice:8180';
const DEFAULT_KEYCLOAK_REALM        = 'smartoffice';
const DEFAULT_KEYCLOAK_CLIENT       = 'smartoffice';
const DEFAULT_API_GATEWAY_BASE_URL  = '';

const LOGGER                        = common.logging.LoggingSystem.createLogger('Main');
const VERSION                       = smartoffice.getVersion();

var port                            = process.env.WEBSERVER_PORT   ?? DEFAULT_PORT;
var keycloakUrl                     = process.env.KEYCLOAK_URL     ?? DEFAULT_KEYCLOAK_URL;
var keycloakRealm                   = process.env.KEYCLOAK_REALM   ?? DEFAULT_KEYCLOAK_REALM;
var keycloakClient                  = process.env.KEYCLOAK_CLIENT  ?? DEFAULT_KEYCLOAK_CLIENT;
var keycloakClientSecret            = process.env.KEYCLOAK_CLIENT_SECRET;
var realmPublicKey                  = process.env.REALM_PUBLIC_KEY;
var apiGatewayBaseUrl               = process.env.API_GATEWAY_BASE_URL ?? DEFAULT_API_GATEWAY_BASE_URL;
var simulateSmartOfficeRestApi      = (keycloakUrl === DEFAULT_KEYCLOAK_URL) || (keycloakUrl.indexOf('192.168.1') >= 0);

LOGGER.logInfo('version:                       ' + VERSION);
LOGGER.logInfo('webserver port:                ' + port);
LOGGER.logInfo('keycloak URL:                  ' + keycloakUrl);
LOGGER.logInfo('keycloak realm:                ' + keycloakRealm);
LOGGER.logInfo('keycloak client:               ' + keycloakClient);
LOGGER.logInfo('keycloak client secret:        ' + ((!keycloakClientSecret) ? 'not ' : '') + 'provided via env var');
LOGGER.logInfo('realm public key:              ' + ((!realmPublicKey) ? 'not ' : '') + 'provided via env var');
LOGGER.logInfo('API gateway base URL:          ' + apiGatewayBaseUrl);
LOGGER.logInfo('simulate smartOffice REST API: ' + simulateSmartOfficeRestApi);

var keyCloakConfig = {
   'realm':             keycloakRealm,
   'auth-server-url':   keycloakUrl,
   'ssl-required':      'external',
   'resource':          keycloakClient,
   'confidential-port': 0
};

if (realmPublicKey) {
   keyCloakConfig['realm-public-key'] = realmPublicKey;
}

if (keycloakClientSecret) {
   /* jshint sub:true */
   keyCloakConfig['credentials']   = {secret: keycloakClientSecret};
} else {
   keyCloakConfig['public-client'] = true;
}

const app      = express();
const keycloak = new Keycloak({}, keyCloakConfig);

app.use((req, res, next) => {
   console.log(req.method + ' ' + req.originalUrl);
   next();
});

app.use(stringReplace({KC_URL: keycloakUrl}));
app.use(express.json());
app.use(keycloak.middleware());

app.get('/info', (req, res) => {
   res.json({version: VERSION});
});

app.get('/keycloak.json', (req, res) => {
   res.json(keyCloakConfig);
});

app.get('/configuration', keycloak.protect(), (req, res) => {
   res.json({version: VERSION, apiGatewayBaseUrl: apiGatewayBaseUrl});
});

if (simulateSmartOfficeRestApi) {
   new smartoffice.SimulatedSmartOfficeRestApi(app, keycloak);
}

app.use('/', express.static('webroot'));

app.listen(port, () => {
   LOGGER.logInfo(`Listening on port ${port}.`);
});
