const aws = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp')


const s3 = new aws.S3()
const URL_EXPIRATION_SECONDS = 60

exports.handler = async function (event) {
    const path = event?.requestContext?.resourcePath

    if (path === '/getUploadSignedUrl') {
        const randomID = uuidv4()
        const Key = `${randomID}.jpeg`

        const metadata = {
            height: `${event.headers["x-amz-meta-height"]}`,
            width: `${event.headers["x-amz-meta-width"]}`
        }

        const s3Params = {
            Bucket: process.env.s3_UPLOAD_BUCKET,
            Key,
            Expires: URL_EXPIRATION_SECONDS,
            ContentType: 'image/jpeg',
            Metadata: metadata
        }

        const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                url: uploadURL,
                Key,
            })
        }

    }

    if (path === '/getDownloadSignedUrl') {
        const Key = event.headers["x-amz-meta-key"]

        const s3Params = {
            Bucket: process.env.s3_OUTPUT_BUCKET,
            Key,
            Expires: URL_EXPIRATION_SECONDS
        }

        const uploadURL = await s3.getSignedUrlPromise('getObject', s3Params)

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({
                url: uploadURL,
                Key,
            })
        }
    }

    const imageToProcess = event.Records[0].s3.object.key

    var params = {
        Bucket: process.env.s3_UPLOAD_BUCKET,
        Key: imageToProcess
    };

    const obj = await s3.getObject(params).promise();

    const buffer = await sharp(obj.Body)
        .resize(
            {
                width: parseInt(obj.Metadata.width),
                height: parseInt(obj.Metadata.height),
                fit: 'outside',
            })
        .toBuffer();


    var uploadParams = {
        Body: buffer,
        Bucket: process.env.s3_OUTPUT_BUCKET,
        Key: imageToProcess,
        ContentType: "image"
    };

    await s3.putObject(uploadParams).promise();
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: "Image Resized"
    }

}
