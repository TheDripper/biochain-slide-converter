#!/bin/bash
apt-get update
apt-get install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
PROFILE=~/.bash_profile
echo '# NVM Setting' >> ${PROFILE}
echo 'export NVM_DIR="$HOME/.nvm"' >> ${PROFILE}
echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" ' >> ${PROFILE}
source ${PROFILE}
nvm install node
nvm install 12
nvm alias default 12
npm install --loglevel verbose
npm run build
npm start --loglevel verbose