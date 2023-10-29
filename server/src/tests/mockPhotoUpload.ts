import { v1 as uuidv1 } from 'uuid';
import * as request from "request-promise-native";
import { FileOperations } from '../platform/file.operations';
import { ImageOperations } from "../platform/image.operations";

let fileOperations: FileOperations = new FileOperations();
let imgops: ImageOperations = new ImageOperations();

//case photos upload to s3
let photos: string[] = [
    "http://commoncollection.com/UploadedFiles/Medium/36d11ef8-1c54-4bc5-872b-80f3924807ca.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/03e93602-abd9-4228-81f0-db917d0b0af5.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/20663ba0-2415-4458-8d9d-063fcd060492.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/c258fbe3-db71-4475-a038-66809015264f.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/210a6441-03e2-4d09-8377-40cc3956827f.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/8e00164d-f89a-4fdd-8262-c6f48230424d.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/6c0dcdcd-a9b7-4b1b-ba27-f561540fdea0.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/bae5db95-1e00-4f6a-b6fd-3ddcad05658c.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/2060d6af-6561-4680-b170-81b492693a81.png",
    "http://commoncollection.com/UploadedFiles/Medium/011a3aaf-98f9-4222-9494-a60a555f8969.png",
    "http://commoncollection.com/UploadedFiles/Medium/8ee29092-ef40-40dd-8f4c-0ac8319af2ff.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/43211a9d-a4f0-4d73-b931-aac0a8b3d616.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/bcdd9cf6-de35-4c4e-9add-065dc1443549.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/da67b133-3d0c-47a3-95b9-597a1ce1b359.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/3030064f-5b2d-46c4-943e-ded001df6141.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/185954ca-8b29-4698-a2fc-8bf9f70d43b8.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/dd6dc256-194c-4411-b044-95272c705ee5.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/cdde037d-801c-40db-afd5-99c5c2c20a2a.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/22feee05-000e-4877-8829-3bc2d639556f.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/46fdb6fb-7a78-4289-abe6-145afa40e0e1.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/357e2a40-c4c1-4ad9-a393-666c8338abc0.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/9e698dd3-5f3c-4f50-b243-fb1f2c12a952.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/36d11ef8-1c54-4bc5-872b-80f3924807ca.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/c623cfff-cc9c-4412-913e-27ebf4029cf6.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/2eca8587-89f5-4ff2-b5c4-25e3f96b3fc8.png",
    "http://commoncollection.com/UploadedFiles/Medium/60d2e421-4f9f-4281-aa95-c3d1a2af30fc.png",
    "http://commoncollection.com/UploadedFiles/Medium/c258fbe3-db71-4475-a038-66809015264f.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/2ce6435d-595c-4786-9148-48b4acfe426e.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/624e5b16-105f-47a2-b605-e648de2c9fc6.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/cd38cd55-12ac-4d2d-b5a0-a08aff454ec6.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/ba77e609-7a55-4206-a7cf-6d5e6081b855.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/ac489601-42a5-44c5-b34f-424c9f9e323e.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/fd4e1f54-670e-4c7c-8ab5-012342bf8176.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/4b19aecd-5aa3-4186-80c3-858c10914bc2.jpg",
    "http://commoncollection.com/UploadedFiles/Medium/a1848589-aa54-4347-b221-967cd80f353e.jpg"
];

photos.map(async (item) => {
    let url = item
    let options = {
        method: 'GET',
        url: url,
        encoding: null // keeps the body as buffer
    };

    let magic = {
        jpg: 'ffd8ffe0',
        png: '89504e47',
        gif: '47494638'
    };

    const result = request(options, async function (error, response, body) {
        let thumbnailBuffer = await imgops.resize(body, 200);
        let magigNumberInBody = body.toString('hex', 0, 4);
        let mimetype = (magigNumberInBody == magic.jpg) ? 'image/jpg' : (magigNumberInBody == magic.png) ? 'image/png' : ((magigNumberInBody == magic.gif) ? 'image/gif' : undefined);
        let key = 'cc_casephoto_' + uuidv1();
        console.log(key);
        fileOperations.uploadFile(key, mimetype, body, 'test-user');  //original photo upload to s3
        fileOperations.uploadFile(key + '_thumb', mimetype, thumbnailBuffer, 'test-user'); //thumbnail photo upload to s3
    });

});
//profile photos uplaod to s3
let profPhotos: string[] = [
    "http://commoncollection.com/UploadedFiles/Thumb/a2ef2db7-6e2e-4837-b4cd-b9df735b2690.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/2a6beed7-0a3f-4641-98ae-c4de8a0c5f31.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/6c12c1a7-eeba-480d-961c-72556457fe23.jpeg",
    "http://commoncollection.com/UploadedFiles/Thumb/a25f3f6e-5ba2-4177-afae-2b58d3f7c69d.png",
    "http://commoncollection.com/UploadedFiles/Thumb/d5a90984-b6fc-4405-ac8e-7f8c84a1ed77.jpeg",
    "http://commoncollection.com/UploadedFiles/Thumb/97d87357-25ee-42ac-aeff-5bbb6bc602f2.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/fdcd2207-2909-4c6b-8b07-d43bba338080.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/551d3efe-eef3-42be-b9f8-cd10ec3bda34.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/3744e154-552b-4063-abf9-6aaafe07a2bd.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/7493a449-5793-4201-87bd-047fa6b77676.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/b0eae8a7-b6ac-436c-a338-e157b57549bd.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/8476f8e5-55fb-4ac3-8a5a-d975f4a02252.jpg",
    "http://commoncollection.com/img/ph_Thorkild.jpg",
    "http://commoncollection.com/UploadedFiles/Thumb/fd1fc4c8-7b5e-4c3e-af95-8e9980bb0e25.jpg"
];

profPhotos.map(async (item) => {
    let url = item
    let options = {
        method: 'GET',
        url: url,
        encoding: null // keeps the body as buffer
    };

    let magic = {
        jpg: 'ffd8ffe0',
        png: '89504e47',
        gif: '47494638'
    };

    const result = request(options, async function (error, response, body) {
        let thumbnailBuffer = await imgops.resize(body, 200);
        let magigNumberInBody = body.toString('hex', 0, 4);
        let mimetype = (magigNumberInBody == magic.jpg) ? 'image/jpg' : (magigNumberInBody == magic.png) ? 'image/png' : ((magigNumberInBody == magic.gif) ? 'image/gif' : undefined);
        let key = 'cc_profilephoto_' + uuidv1();
        console.log(key);
        fileOperations.uploadFile(key + '_thumb', mimetype, thumbnailBuffer, 'test-user'); //thumbnail photo upload to s3
    });

});