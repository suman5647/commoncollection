import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  uploadFiles: File[] = [];
  errors: Array<string> = [];
  maxSize: number = 1;
  reqFiles: File[] = [];
  validFiles: File[] = [];

  constructor() { }


  validationAndFileSize(files, FileExtn) {
    this.uploadFiles = files
    this.errors = [];
    this.reqFiles = [];
    this.validFiles = [];
    this.isValidFileExtension(files, FileExtn);
  }
  isValidFileExtension(files, FileExtn) {
    for (var i = 0; i < files.length; i++) {
      var oInput = files[i];
      if (oInput) {
        var sFileName = oInput.name;
        if (sFileName.length > 0) {
          var blnValid = false;
          for (var j = 0; j < FileExtn.length; j++) {
            var sCurExtension = FileExtn[j];
            if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
              blnValid = true;
            }
          } if (blnValid) {
            this.validFiles.push(oInput);
          } else if (!blnValid) {

            if (this.uploadFiles.length > 1) {
              this.errors.push(`Error (File Type):  ${sFileName} : is invalid, allowed extensions are:` + FileExtn.join(", "));
            } else {
              this.uploadFiles = null;
              this.reqFiles = [];
              this.errors.push(`Error (File Type):  ${sFileName} : is invalid, allowed extensions are:` + FileExtn.join(", "));

            }
          }

        }
      }
      this.isValidFileSize(this.validFiles[i]);
    }

    return true;

  }

  isValidFileSize(files) {
    if (files) {
      var fileSizeinMB = files.size / (1024 * 1000);
      var size = Math.round(fileSizeinMB * 100) / 100; // convert upto 2 decimal place
      if (size <= this.maxSize) {
        this.reqFiles.push(files);
      } else if (size > this.maxSize) {
        let fname = files.name;
        this.errors.push(`Error (File Size):  ${fname} : exceed file size limit of ${this.maxSize} MB ${size}MB )`);

      }

    }

  }

}
