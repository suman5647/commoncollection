import * as fs from 'fs';
import { ImageOperations } from "../platform/image.operations";

const imgops: ImageOperations = new ImageOperations();
const filePath = './man-anonymous.png'
imgops.testpngcreate().then((rs: ReadableStream) => {
    // save rs
    fs.writeFileSync(filePath, rs);
    imgops.resize(rs, 200).then((ws) => {
        // save ws
        fs.writeFileSync(filePath, ws);
    });
});

