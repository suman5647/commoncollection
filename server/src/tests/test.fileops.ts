import * as fs from 'fs';
import { ImageOperations } from "../platform/image.operations";
import { FileOperations } from "../platform/file.operations";
import { v1 as uuidv1 } from 'uuid';

const imgops: ImageOperations = new ImageOperations();
const fileops: FileOperations = new FileOperations();

imgops.testpngcreate().then(async (rs) => {
    // save rs
    // fs.writeFileSync('org_image.png', rs);
    fileops.uploadFile('cc_casephoto_' + uuidv1(), 'image/png', rs, 'test-user').then((res) => {
        console.log('file uploaded');
        console.log(res);
        fileops.getFile(res.Key, 'test-user').then((fr)=>{
            console.log(fr);
        })
        fileops.removeFile(res.Key, 'test-user').then((fr) => {
            console.log('file removed from s3');
            console.log(fr);
        })
    });

    //imgops.testpngcreate().then((rs: ReadableStream) => {
    //    // save rs
    //    fs.writeFileSync('org_image.png', rs);
    //    imgops.resize(rs, 200).then((ws) => {
    //        // save ws
    //        fs.writeFileSync('new_image.png', ws);
    //    });
    //});
    //imgops.resize(rs, 200).then(async (ws) => {
    //    // save ws
    //    fs.writeFileSync('new_image.png', ws);
    //});
});

