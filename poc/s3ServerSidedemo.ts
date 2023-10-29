
import * as AWS from 'aws-sdk';
import { v1 as uuidv1 } from 'uuid';
import * as btoa from 'btoa';
import * as fs from 'fs';
import * as request from 'request';

declare const Buffer;

const s3 = new AWS.S3({
    accessKeyId: 'AKIAJWJU5YY77NDXTGDA',
    secretAccessKey: 'NZB/gE7Ho8VgFGDywwU10Jzyah/KSlyqxTlgJxX/'
});


//upload file for images example public view
const fileName = 'Screenshot.png';
const keyPublic = uuidv1();

const uploadFilePublic = () => {
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        s3.putObject({
            Bucket: 'commoncollection',
            Key: keyPublic,  //uuid
            Body: Buffer.from(data),
            ContentType: 'image/png'  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
            // ACL: 'public-read',  //private | public-read | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control
        }, (err) => {
            if (err) return console.error(err.stack)

            s3.getSignedUrl('getObject', {
                Bucket: 'commoncollection',
                Key: keyPublic,
                // Expires: 60, // expires in 60 seconds
            }, (err, data) => {
                if (err) return console.error(err.stack)
            })
        })
    })
}

uploadFilePublic();

//upload file for images example private view
const keyPrivate = uuidv1();

const ssecKey = Buffer.alloc(32, 'my secret key for aws to store cc files');

const uploadFile = () => {
    fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        s3.putObject({
            Bucket: 'commoncollection',
            Body: Buffer.from(data),
            ACL: 'private',
            Key: keyPrivate,
            ContentType: 'image/png',  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
            SSECustomerAlgorithm: 'AES256',
            SSECustomerKey: ssecKey
        }, (err) => {
            if (err) return console.error(err.stack)

            s3.getSignedUrl('getObject', {
                Bucket: 'commoncollection',
                Key: keyPrivate,
                // Expires: 60, // expires in 60 seconds
                SSECustomerAlgorithm: 'AES256',
                SSECustomerKey: ssecKey
            }, (err, data) => {
                if (err) return console.error(err.stack)

            })
        })
    })
}

uploadFile();

//Public pic download
const publicDownloadFile = () => {
    var params = {
        Bucket: 'commoncollection', // pass your bucket name
        Key: '681c0e46-6b04-42a2-919a-856696b96815', // file name saved in commoncollection/cc
    };
    s3.getObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        let imageTest = "data:image/png;base64," + encode(data.Body);
    });
}

publicDownloadFile();

//Private pic download
const privateDownloadFile = () => {
    var params = {
        Bucket: 'commoncollection', // pass your bucket name
        Key: 'e96f347c-6025-4199-a683-a0be12955009', // file name saved in commoncollection/cc
        // ContentType: 'image/png',  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
    };
    s3.getObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        let imageTest = "data:image/png;base64," + encode(data.Body);
    });
}

function encode(data) {
    var str = data.reduce(function (a, b) { return a + String.fromCharCode(b) }, '');
    return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

privateDownloadFile();


//Upload a url images
const uploadURL = () => {

    var options = {
        uri: 'https://graph.facebook.com/2288996047888371/picture?type=large',
        //'https://www.gstatic.com/webp/gallery3/1.png',
        encoding: null
    };

    request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log("failed to get image");
            console.log(error);
        } else {
            s3.putObject({
                Body: body,
                Key: 'fb_uri_path',
                Bucket: 'commoncollection',
                ContentType: 'image/png',  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
            }, function (error, data) {
                if (error) {
                    console.log("error downloading image to s3");
                } else {
                    console.log("success uploading to s3");
                }
            });
        }
    });

}

uploadURL();

//List all the objects from s3
// var params = {
//     Bucket: 'commoncollection', // pass your bucket name
// };
// s3.listObjects(params, function (err, data) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(data);
//         console.log(data.Contents);
//     }
// });


//Upload images using url
// const fileURL = 'https://www.gstatic.com/webp/gallery3/1.png';
// // 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=2288996047888371&height=200&width=200&ext=1566466044&hash=AeQg6sy5S8CqtRNB'                                                         
//         //'https://graph.facebook.com/2288996047888371/picture?type=large'
// sharp(fileURL).toBuffer(function (err, outputBuffer) {
//     if (err) {
//         console.log('problem');
//         console.log(err);
//     }

//     var params = {
//         Bucket: 'commoncollection',
//         ACL: 'public-read',
//         Body: outputBuffer,
//         Key: 'url',
//         // ContentType: 'image/png',  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
//     };

//     s3.upload(params, function (err, result) {
//         if (err) {
//             console.log(err);
//         }
//         console.log(result);
//         console.log(result.Location);

//     });

// });



// const uploadFile = () => {
//     fs.readFile(fileName, (err, data) => {
//         if (err) throw err;
//         const params = {
//             Bucket: 'commoncollection', // pass your bucket name
//             Key: 'screenshot.png', // file will be saved as commoncollection/cc
//             Body: Buffer.from(data),
//             ServerSideEncryption: "AES256",  // AES256 | aws:kms
//             ContentType: 'image/png'  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
//         };
//         s3.putObject(params, function (s3Err, data) {
//             if (s3Err) throw s3Err;
//             s3.getSignedUrl('getObject', {
//                 Bucket: 'commoncollection',
//                 Key: 'profile.jpg',
//                 Expires: 60, // expires in 60 seconds
//                 SSECustomerAlgorithm: 'AES256',
//                 SSECustomerKey: ssecKey
//             }, (err, data) => {
//                 if (err) return console.error(err.stack)

//                 console.log(data)
//             })
//         });
//     });
// };

// //Sample example for txt files
// // const txtFile = 'myfiles.txt'
// // const uploadFile = () => {
// //     fs.readFile(txtFile, (err, data) => {
// //         if (err) throw err;
// //         const params = {
// //             Bucket: 'commoncollection', // pass your bucket name
// //             Key: 'textfile.txt', // file will be saved as commoncollection/cc
// //             Body: data,
// //             ServerSideEncryption: "AES256",  // AES256 | aws:kms
// //             ContentType:'text/plain'  // png:image/png, mp4: video/mp4, gif:image/gif, jpe:image/jpeg, jpe:image/jpeg, jpg:image/jpeg, txt:text/plain
// //         };
// //         s3.putObject(params, function (s3Err, data) {
// //             if (s3Err) throw s3Err;
// //             console.log(data);
// // //             // console.log(`File uploaded successfully at ${data.Location}`)
// // //         });
// // //     });
// // // };

// // uploadFile();



// const downloadFile = () => {
//     var params = {
//         Bucket: 'commoncollection', // pass your bucket name
//         Key: 'screenshot.png', // file will be saved as commoncollection/cc
//     };
//     s3.getObject(params, function (err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else console.log(data);           // successful response
//         /*
//         data = {
//          AcceptRanges: "bytes", 
//          ContentLength: 3191, 
//          ContentType: "image/jpeg", 
//          ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
//          LastModified: <Date Representation>, 
//          Metadata: {
//          }, 
//          TagCount: 2, 
//          VersionId: "null"
//         }
//         */
//     });
// }

// // downloadFile();

// //SSE-C(Server side Encryption with Client Provided keys)
// const ssecKey = Buffer.alloc(32, 'my secret key for aws to store cc files');

// console.log('ssecKey:', ssecKey);

// const fileName = 'Screenshot.png';

// const uploadFile = () => {
//     fs.readFile(fileName, (err, data) => {
//         if (err) throw err;
//         s3.putObject({
//             Bucket: 'commoncollection',
//             Body: Buffer.from(data),
//             ACL: 'private',
//             Key: 'profile.jpg',
//             SSECustomerAlgorithm: 'AES256',
//             SSECustomerKey: ssecKey
//         }, (err) => {
//             if (err) return console.error(err.stack)
//             console.log('next');

//             s3.getSignedUrl('getObject', {
//                 Bucket: 'commoncollection',
//                 Key: 'profile.jpg',
//                 Expires: 60, // expires in 60 seconds
//                 SSECustomerAlgorithm: 'AES256',
//                 SSECustomerKey: ssecKey
//             }, (err, data) => {
//                 if (err) return console.error(err.stack)

//                 console.log(data)
//             })
//         })
//     })
// }

// uploadFile();