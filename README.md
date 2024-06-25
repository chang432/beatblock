###### PREREQUISITES ######
- Python 3.9
- AWS CLI
- AWS Account

###### FLASK REACT ZAPPA TEMPLATE ######

1. Create and activate the venv: 'python -m venv venv' + 'source venv/bin/activate' 
2. Pip install the python libraries: 'python -m pip install -r requirements.txt'
3. Prepare AWS credentials locally: 
- Run 'aws configure --profile {PROFILE_NAME}' and input your public and secret access key (Retreive from aws console)
- Make sure that profile is set as default: 'export AWS_PROFILE={PROFILE_NAME}'
7. In zappa_settings.json, replace {PROJECT_NAME} and {AWS_PROFILE_NAME} with the correct values
5. Cd into frontend/ and then run 'npm ci'
6. Run 'npm run dev' and make sure the website is reachable
7. Go back to the root of the project and run 'bash local_deploy.sh' to test if the flask application is working
8. Initialize the zappa dev application with 'zappa deploy dev'
9. On the aws console, edit the newly created s3 bucket in the following ways:
- In the Permissions tab, set block all public access to OFF
- In the Permissions tab, set object ownership to ACLs enabled and bucket owner preferred
- In the Permissions tab in the ACL view, edit and check List to the right of 'Everyone (public access)'
- Finally add the following to the CORS section:
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
10. Then in deploy_dev.sh and scripts/upload_static.py, replace {BUCKET_NAME} and {ENDPOINT} with the dev bucket and endpoint name (without https://). Then run 'bash deploy_dev.sh'
11. When you're ready, do steps 9+10 again but replace dev with prod.