FROM node:18.18-alpine

USER node:node

WORKDIR /home/node/app

COPY --chown=node:node package.json .
RUN npm install

COPY --chown=node:node ./Gruntfile.js ./.jshintrc .
COPY --chown=node:node ./Gruntfile.js             .
COPY --chown=node:node ./simulationData/          ./simulationData/
COPY --chown=node:node ./webroot/favicon.ico      ./webroot/
COPY --chown=node:node ./webroot/index.html       ./webroot/
COPY --chown=node:node ./src/                     ./src/

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
