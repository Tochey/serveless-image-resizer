import * as aws from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
const s3 = new aws.S3()
const URL_EXPIRATION_SECONDS = 60

exports.handler = async function (event) {
    const randomID = uuidv4()
    const Key = `${randomID}.jpg`

    const s3Params = {
        Bucket: process.env.s3_UPLOAD_BUCKET,
        Key,
        Expires: URL_EXPIRATION_SECONDS,
        ContentType: 'image/jpeg'
    }

    const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

    return JSON.stringify({
        uploadURL: uploadURL,
        Key
      })
}