#!/bin/bash

basePath=/data/yunmi/meetnovel_package
projPath=$basePath/meetnovel

logBasePath=/data/logs/meetnovel
outlogPath=$logBasePath/meetnovel_out.log
errorlogPath=$logBasePath/meetnovel_error.log


cd $projPath
git pull
cnpm i

is_running=`ps aux | grep /data/yunmi/meetnovel_package/meetnovel | grep node | grep -v grep | wc -l`

if [[ "$is_running" -gt 0 ]]
then
  pm2 reload server/startup.js -i 1  --name meetnovel  --output $outlogPath --error $errorlogPath --merge-logs --log-date-format "YYYY-MM-DD HH:mm:ss Z" --  -p 2138 -h 0.0.0.0
else
  pm2 start server/startup.js  -i 1 --name meetnovel --output $outlogPath --error $errorlogPath --merge-logs --log-date-format "YYYY-MM-DD HH:mm:ss Z" -- -p 2138 -h 0.0.0.0
fi
