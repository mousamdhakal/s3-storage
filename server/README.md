Needs an .env file with:
- JWT_SECRET=
- DATABASE_URL= 

## Setup Guide

### S3 settings
- Block all public access: `off`
- Bucket policy: 
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForGetBucketObjects",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::s3-file-manager-project/*",
            "Condition": {
                "StringEquals": {
                    "s3:ExistingObjectTag/public": "true"
                }
            }
        }
    ]
}
```
This is to allow public access to objects tagged with public tag.

- Enable acl so we can change objects acl for public , private views

- CORS:
```
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```
Allow access from BE and FE origins
