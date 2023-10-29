import * as fs from 'fs';
const KYCPath = process.env.KYC_PATH;

export class FileService {

    async saveImage(fileBuffer, fileName) {
        const fileContents = Buffer.from(fileBuffer, 'base64');
        let localPath = KYCPath + fileName;
        return new Promise(function (resolve, reject) {
            fs.writeFile(localPath, fileContents, function (err) {
                if (err) reject(err);
                else resolve(fileName);
            });
        });
    }

    async readImage(fileName) {
        let localPath = KYCPath + fileName;
        return new Promise<string>(function (resolve, reject) {
            fs.readFile(localPath, 'base64', function (err, data) {
                if (err) reject(err);
                else resolve(data);
            })
        })
    }
}