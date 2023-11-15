#!/bin/bash

scriptDir=$(cd $(dirname $0) && pwd)
cd $scriptDir

imageVersion=$(jq --raw-output .version package.json)

if [ "$imageVersion" == "" ]; then
   echo "ERROR: failed to read version from package.json"
   exit 1
fi

docker build -t tederer/apeni-smartoffice-web-app:$imageVersion .

