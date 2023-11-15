#!/bin/bash

scriptDir=$(cd $(dirname $0) && pwd)

docker run -it --rm \
    -v $scriptDir:/home/node/app \
    -w /home/node/app \
    node:18.18-alpine \
    npm run lint

exit $?