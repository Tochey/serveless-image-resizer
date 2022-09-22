const image_input = document.querySelector("#image-input");
const upload_file = document.querySelector("#upload_file");
const width = document.querySelector("#width-input");
const height = document.querySelector("#height-input");
let uploaded_image;
let preSignedUploadUrl;

image_input.addEventListener("change", function () {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        uploaded_image = reader.result;
        if (!uploaded_image.includes('data:image/jpeg')) {
            return document.querySelector("#image-name").innerHTML = 'Wrong File Type: JPG only';
        }
        document.querySelector("#display-image").style.backgroundImage = `url(${uploaded_image})`;
        document.querySelector("#image-name").innerHTML = `${image_input.files[0].name}`;
    });
    reader.readAsDataURL(this.files[0]);
});

upload_file.addEventListener("click", async function () {
    console.log(width.value)
    if (typeof (uploaded_image) === "undefined" || !uploaded_image.includes('data:image/jpeg')) {
        return document.querySelector("#image-name").innerHTML = 'Please Upload a file';
    }
    if (!width.value || width.value > 2000) return document.querySelector("#image-name").innerHTML = 'Please Enter a valid width';
    if (!height.value || height.value > 2000) return document.querySelector("#image-name").innerHTML = 'Please Enter a valid height';

    document.querySelector("#image-name").innerHTML = 'Image Succesfully Uploaded, Please wait for re-sized image';

    preSignedUploadUrl = await fetch('https://pogs7utge0.execute-api.us-east-1.amazonaws.com/prod/getUploadSignedUrl', {
        headers: {
            "x-amz-meta-height": `${height.value}`,
            "x-amz-meta-width": `${width.value}`
        },
    })
        .then((e) => e.json())

    let binary = atob(uploaded_image.split(',')[1])
    let array = []
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
    }
    let blobData = new Blob([new Uint8Array(array)], { type: 'image/jpeg' })

    await fetch(preSignedUploadUrl.url, {
        method: 'PUT',
        body: blobData
    })

    const resizedImage = document.querySelector("#view-image")

    const getUploadedObject = async () => {
        const preSignedDownloadUrl = await fetch('https://pogs7utge0.execute-api.us-east-1.amazonaws.com/prod/getDownloadSignedUrl', {
            headers: {
                "x-amz-meta-key": `${preSignedUploadUrl.Key}`
            }
        }).then((e) => e.json())
        resizedImage.innerText = 'view resized image';

        resizedImage.addEventListener('click', async function () {
            //retrieve image from s3
            var img = new Image();
            img.src = preSignedDownloadUrl.url
            document.querySelector("#display-image").style.backgroundImage = '';
            document.querySelector("#display-image").appendChild(img);
        })
    }

    setTimeout(() => {
        getUploadedObject()
    }, "3000")

})