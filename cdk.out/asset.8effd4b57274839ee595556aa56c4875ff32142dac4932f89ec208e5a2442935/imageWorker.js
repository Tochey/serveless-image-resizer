const aws = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');

const s3 = new aws.S3()
const URL_EXPIRATION_SECONDS = 60

exports.handler = async function (event) {
    const event = JSON.parse(event)
const path = event.resourcePath
console.log(path)
    const randomID = uuidv4()
    const Key = `${randomID}.jpg`

    const s3Params = {
        Bucket: process.env.s3_UPLOAD_BUCKET,
        Key,
        Expires: URL_EXPIRATION_SECONDS,
        ContentType: 'image/jpeg'
    }

    const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

    return {
        statusCode: 200,
        body : JSON.stringify({
            url : uploadURL,
            Key,
            event : JSON.stringify(event.resourcePath)
        })
    }





}
