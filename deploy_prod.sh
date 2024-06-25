#!/bin/bash
# run from root dir

s3_bucket_dev="{DEV_BUCKET_NAME}"
s3_bucket_prod="{PROD_BUCKET_NAME}"
endpoint="{ENDPOINT}"

sed 's/os\.environ\["IS_DEPLOYMENT"] = "FALSE"/os\.environ["IS_DEPLOYMENT"] = "TRUE"/' app.py > prod_app.py

mv app.py local_app.py
mv prod_app.py app.py

# change bucket name
sed -i '' "s/${s3_bucket_dev}/${s3_bucket_prod}/g" scripts/upload_static.py

cd frontend

npm run build

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s/\/assets/https:\/\/${s3_bucket_prod}.s3.amazonaws.com\/assets/g" {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s|http://127.0.0.1:5000|https://${endpoint}|g" {} +

cd ../scripts

python upload_static.py

cd ..

# zappa package prod
zappa update prod

### REVERT STUFF NOW ###

# change back bucket name
sed -i '' "s/${s3_bucket_prod}/${s3_bucket_dev}/g" scripts/upload_static.py

cd frontend

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s/https:\/\/${s3_bucket_prod}.s3.amazonaws.com\/assets/\/assets/g" {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s|https://${endpoint}|http://127.0.0.1:5000|g" {} +

cd ..

mv local_app.py app.py

# zappa tail prod