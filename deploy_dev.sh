#!/bin/bash
# run from root dir

s3_bucket_name="beatblock-dev"
endpoint="pigz9qlvhl.execute-api.us-east-1.amazonaws.com/dev"

sed 's/os\.environ\["IS_DEPLOYMENT"] = "FALSE"/os\.environ["IS_DEPLOYMENT"] = "TRUE"/' app.py > dev_app.py

mv app.py local_app.py
mv dev_app.py app.py

cd frontend

npm run build

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s/\/assets/https:\/\/${s3_bucket_name}.s3.amazonaws.com\/assets/g" {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s|http://127.0.0.1:5000|https://${endpoint}|g" {} +

cd ../scripts

python upload_static.py

cd ..

# zappa deploy dev
zappa update dev

cd frontend

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s/https:\/\/${s3_bucket_name}.s3.amazonaws.com\/assets/\/assets/g" {} +

find dist -type f \( -name '*.css' -o -name '*.js' -o -name '*.html' \) -exec sed -i '' "s|https://${endpoint}|http://127.0.0.1:5000|g" {} +

cd ..

mv local_app.py app.py

# zappa tail dev