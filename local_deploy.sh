#!/bin/bash
# run from root dir

cd frontend

source .env

sed -i '' "s|{{ACCESS_KEY}}|${ACCESS_KEY}|" src/api/arweaveAPI.js
sed -i '' "s|{{SECRET_ACCESS_KEY}}|${SECRET_ACCESS_KEY}|" src/api/arweaveAPI.js
sed -i '' "s/const LOCAL = false;/const LOCAL = true;/" src/components/Upload.jsx

npm run build

sed -i '' "s|${ACCESS_KEY}|{{ACCESS_KEY}}|" src/api/arweaveAPI.js
sed -i '' "s|${SECRET_ACCESS_KEY}|{{SECRET_ACCESS_KEY}}|" src/api/arweaveAPI.js
sed -i '' "s/const LOCAL = true;/const LOCAL = false;/" src/components/Upload.jsx

cd ..
 
flask run

