import { IAPIOperations } from "platform/base.operations";
import * as sharp from 'sharp';
import * as fs from 'fs';

export class ImageOperations implements IAPIOperations {

    constructor() { }

    public async resize(readableStream, targetWidth: number = 200) {
        return await sharp(readableStream)
            .resize(targetWidth)
            .toBuffer();
    }

    /**
     * only for testing
     * @param pwidth width of image
     * @param pheight height of image
     */
    public async testpngcreate(pwidth = 800, pheight = 600) {
        const semiTransparentRedPng = await sharp({
            create: {
                width: pwidth,
                height: pheight,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 0.5 }
            }
        }).png().toBuffer();

        return semiTransparentRedPng;
    }
}