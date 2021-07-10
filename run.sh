#!/bin/bash
apt-get update
apt-get install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
nvm install 12
nvm alias default 12
npm install --loglevel verbose
npm run build
npm start --loglevel verbose