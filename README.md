# APENI smartOffice Web-App

This repository contains the web application used in the smartOffice project for booking workspaces.
It is available as a Docker image at [docker hub](https://hub.docker.com/r/tederer/apeni-smartoffice-web-app).
For authentication [Keycloak](https://www.keycloak.org) gets used.

## Starting the service

To start the service, all you need is a docker daemon and ...

* the URL of your Keycloak instance
* the name of the realm and client configured in Keycloak
* the base URL of the API-gateway of the smartOffice project

All these settings need to get provided to the docker daemon as environment variables.

| env variable         | mandatory | default                 | range            | description                                                           |
| -------------------- | :-------: | :---------------------: | ---------------- | --------------------------------------------------------------------- |
| KEYCLOAK_URL         | no        | http://smartoffice:8180 | string           | Specifies the URL of Keycloak.                                        |
| KEYCLOAK_REALM       | no        | smartoffice             | string           | Specifies the name of the realm configured in Keycloak.               |
| KEYCLOAK_CLIENT      | no        | smartoffice             | string           | Specifies the name of the client configured in Keycloak.              |
| API_GATEWAY_BASE_URL | no        |                         | string           | Specifies the URL of the API-gateway of the smartOffice project       |
| WEBSERVER_PORT       | no        | 8080                    | positive integer | Specifies the port the webserver will use to accept incoming requests.|

By default the service runs as user "node:node" in the container. This user is the default user provided by the Node.js base image.

## References

* https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter  
* https://github.com/keycloak/keycloak-nodejs-connect
* https://quarkus.io/guides/security-oidc-bearer-token-authentication
* https://www.youtube.com/watch?v=5z6gy4WGnUs
* https://www.keycloak.org/docs/latest/securing_apps/index.html#validating-access-tokens
* https://www.appsdeveloperblog.com/keycloak-client-credentials-grant-example/?utm_content=cmp-true
* https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint
* https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint
* https://www.baeldung.com/spring-boot-keycloak
* https://www.baeldung.com/postman-keycloak-endpoints
* https://www.keycloak.org/docs/latest/securing_apps/index.html#available-endpoints
* https://www.keycloak.org/docs/latest/securing_apps/#using-the-adapter
* https://github.com/thomasdarimont/keycloak-docker-demo/blob/master/keycloak-demos/plain-js-frontend/webapp/index.html  
* https://github.com/keycloak/keycloak-quickstarts/tree/latest/js/spa
* https://github.com/keycloak/keycloak-quickstarts/tree/latest/nodejs/resource-server  
