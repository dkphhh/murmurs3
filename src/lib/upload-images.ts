import { generateUid } from './uuid.ts';
import sharp from "sharp";
import { S3Client, type S3File } from "bun";
import heicConvert from 'heic-convert';




const CF_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CF_KEY = process.env.CLOUDFLARE_ACCESS_KEY_ID
const CF_SECRET = process.env.CLOUDFLARE_SECRET_ACCESS_KEY

if (!CF_ID) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID is not set");
}


if (!CF_KEY) {
    throw new Error("CLOUDFLARE_ACCESS_KEY_ID is not set");
}


if (!CF_SECRET) {
    throw new Error("CLOUDFLARE_SECRET_ACCESS_KEY is not set");
}



// Initialize R2
const client = new S3Client({
    accessKeyId: CF_KEY,
    secretAccessKey: CF_SECRET,
    region: "auto",
    bucket: "murmurs",
    endpoint: `https://${CF_ID}.r2.cloudflarestorage.com`,
});




/**
 * 将图片文件转化为 webp 格式的图片，如果宽度大于 2048 就重新将宽度调整为 2048
 *
 * @param {Blob} fileBlob 表单上传的 blob
 * @param {number} [width=2048] 宽度默认2048
 * @param {number} [height] 高度，默认不设置
 * @return {*} 
 */
async function resizeImage(fileBlob: Blob, width: number = 2048, height?: number): Promise<{
    blob: Blob;
    fileName: string;
}> {

    // 上传到r2的文件名，需要根据不同的格式命名
    let destFileName: string

    // 表单传来的图片数据
    const arrayBuffer = await fileBlob.arrayBuffer();

    // 图片处理对象
    let img: sharp.Sharp;

    // 不知道为什么，iPhone 拍的 heic 格式图片的 type 属性是空值，所以这里要判断是否为 ""
    if (fileBlob.type == "image/heic" || fileBlob.type == "image/heif" || fileBlob.type == "") {
        // 处理 heic 格式的图片
        const arrayBuffer = await fileBlob.arrayBuffer();


        // 不知道是 heicConvert 的bug 还是iPhone拍的 heic 格式图片有问题，反正这里不能直接把图片的 arrayBuffer 传给 heicConvert，需要先转成 Uint8Array。
        const unit8Array = new Uint8Array(arrayBuffer);

        const pngBuffer = await heicConvert({
            buffer: unit8Array as unknown as ArrayBuffer,
            format: 'PNG',
            quality: 1
        });

        // 处理 png 图片
        img = sharp(pngBuffer);
        const metadata = await img.metadata();

        if (metadata.width! >= 2048) {
            img.resize(width, height);
        }


    } else if (fileBlob.type == "image/gif") {
        // 如果是 gif 格式的图片，直接返回
        destFileName = generateUid() + "." + "gif";
        return {
            blob: fileBlob,
            fileName: destFileName,
        }
    } else {
        // 处理普通的非 heic 格式图片
        img = sharp(arrayBuffer);
        const metadata = await img.metadata();

        if (metadata.width! >= 2048) {
            img.resize(width, height);
        }


    }
    const buffer = await img.webp().toBuffer()
    const blob = new Blob([buffer], { type: "image/webp" })
    destFileName = generateUid() + "." + "webp";

    return {
        blob,
        fileName: destFileName
    }

}


/**
 * 向 Cloudflare R2 上传一张图片，返回图片的 url
 *
 * @param {Blob} fileBlob 表单上传的 blob
 * @return {*} 
 */
async function uploadImage(fileBlob: Blob): Promise<string> {


    // 压缩文件
    const pressedFile = await resizeImage(fileBlob)

    // 上传文件
    const s3file: S3File = client.file(pressedFile.fileName);

    await s3file.write(pressedFile.blob);

    return `https://img.dkphhh.me/${pressedFile.fileName}`;

}


/**
 * 批量向 Cloudflare R2 上传图片，返回图片的 url 列表
 *
 * @export
 * @param {string[]} fileBlobs,表单上传的文件 blob 列表
 * @return {Promise<string[]>} 
 */
export async function uploadImages(fileBlobs: Blob[]): Promise<string[]> {
    const tasks = fileBlobs.map((fileBlob: Blob) => {
        return uploadImage(fileBlob);
    })
    const urls = await Promise.all(tasks)
    return urls;
}

