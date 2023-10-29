///*******TODO for KYC photos in the upcmoing sprints and need to use  mutter to set response headder  */
/*******************case.routes.ts*******************************
// caseRouter.get(CASE_PHOTO_PATH, caseController.getPhoto);
/*******************case.controllers.ts*******************************
// async getPhoto(req: Request, res: Response) {
//     try {
//         const caseId = req.params.id;
//         const uniqueName = req.params.uniqueName;
//         let size = req.query.size;

//         const caseOps = new CaseOperations(req, res);
//         let getPhoto = await caseOps.getCasePhoto(caseId, uniqueName, size);
//         res.statusCode = getPhoto.status;
//         res.send(getPhoto);
//         return;
//     }
//     catch (err) {
//         res.statusCode = 500;
//         res.send({ status: 500, data: { message: 'Unhandled error: ' + err } });
//         return;
//     }
// }
//*******************case.operations.ts*******************************
// async getCasePhoto(caseId: string, uniqueName: string, size: string) {
//     let getPhotoDetails = await cservice.findAggregate([
//         { $match: { tenantId: this.tenantId, caseId: caseId } },
//         {
//             $project: {
//                 attachments: {
//                     $filter: {
//                         input: '$attachments',
//                         as: 'attach',
//                         cond: { $eq: ['$$attach.uniqueName', uniqueName] }
//                     }
//                 }
//             }
//         }
//     ]);
//     const getObj = new CaseDocument();
//     getObj.fileMode = getPhotoDetails[0].attachments[0].fileMode;
//     getObj.title = getPhotoDetails[0].attachments[0].title;
//     getObj.uniqueName = getPhotoDetails[0].attachments[0].uniqueName;
//     getObj.fileType = getPhotoDetails[0].attachments[0].fileType;
//     if (size == 'original') {
//         console.log(getObj.original);
//         let getPhoto = await fileOperations.getFile(getObj.original);       //1. Using the getFile from fileOps 
//         let TYPED_ARRAY = new Uint8Array(getPhoto);                         //2. Convert the ArrayBuffer to a typed array using the Uint8Array format
//         let STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
//             return data + String.fromCharCode(byte);
//         }, '');                                                             //3. Convert the Unicode values into a string of characters
//         let base64String = btoa(STRING_CHAR);                               //4. Obtaining base64 string 
//         let returnData = `data:${getObj.fileType};base64,` + base64String;  //5. Appending base64 string to data URL
//         return { status: 200, data: returnData };
//     } else {
//         console.log(getObj.thumb);
//         let getPhoto = await fileOperations.getFile(getObj.thumb);
//         let TYPED_ARRAY = new Uint8Array(getPhoto);
//         let STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
//             return data + String.fromCharCode(byte);
//         }, '');
//         let base64String = btoa(STRING_CHAR);
//         let returnData = `data:${getObj.fileType};base64,` + base64String;
//         return { status: 200, data: returnData };
//     }
// }
*/