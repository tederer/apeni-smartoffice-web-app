#!/bin/bash

scriptDir=$(cd $(dirname $0) && pwd)

if [ $# -lt 1 ]; then
    echo
    echo "Please provide some arguments for npm (e.g. \"install uuid\")."
    echo
    exit 1
fi

docker run -it --rm \
    -v $scriptDir:/home/node/app \
    -w /home/node/app \
    node:18.18-alpine \
    npm $@

