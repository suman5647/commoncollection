import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { CaseService } from 'src/app/services/case.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import { Case, CaseStatus, CaseDocument, CasePhotoStatus } from 'src/app/models/case';
import { ToastrService } from 'ngx-toastr';
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";
import { NgForm } from '@angular/forms';
import { FileService } from 'src/app/core/services/file.service';
import { DirtyCheckComponent } from '../../../core/components/dirtycheck.component'

@Component({
  selector: 'app-case-edit',
  templateUrl: './case-edit.component.html',
  styleUrls: ['./case-edit.component.css']
})
export class CaseEditComponent implements OnInit, DirtyCheckComponent {
  maxSize: number = 1;
  caseId: string;
  case: Case;
  caseStatus: CaseStatus;
  editCase: boolean = false;
  load: boolean;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = new Array<NgxGalleryImage>();
  errors: Array<string> = [];
  newFile: CaseDocument[];
  rearranged: boolean = false;
  uploadFiles: File[] = [];
  reqFiles: File[] = [];
  FileExtn = [".jpg", ".jpeg", ".png"];

  @ViewChild('form', { static: true }) form: NgForm;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.isDirty() || this.isFormDirty()) {
      $event.returnValue = true;
    }
  }


  constructor(private caseService: CaseService,
    private router: ActivatedRoute,
    private route: Router,
    private toastr: ToastrService,
    private fileService: FileService) {
  }


  ngOnInit() {
    this.caseId = this.router.snapshot.params['caseId'];
    this.caseDetail();
    this.galleryOptions = [
      {
        width: '100%',
        height: '700px',
        thumbnailsColumns: 8,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '700px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: true
      }
    ];
  }

  casePublish() {
    this.caseStatus = {
      caseStatus: 'Open'
    };
    this.caseService.updateCaseStatus(this.caseId, this.caseStatus).subscribe(res => {
      this.toastr.success(res.data.toString());
      this.route.navigate(['/profile']);
    })
  }

  caseEdit() {
    if (this.editCase) {
      this.case.attachments = this.newFile;
      this.caseService.updateCase(this.case.caseId, this.case)
        .subscribe(res => {
          this.toastr.success(res.data.toString());
          this.resetForm();
          this.galleryImages = [];
          this.caseDetail();
        });
    }

    this.editCase = !this.editCase;
  }

  cancelCaseEdit() {
    if (!this.isFormDirty()) {
      this.cancelEdit();
    } else {
      let res = confirm("Do you want to discard changes?");
      if (res) {
        this.cancelEdit();

      }
    }
  }

  cancelEdit() {
    this.editCase = false;
    this.galleryImages = [];
    this.caseDetail();

  }

  caseDetail() {
    this.caseService.getCaseDeatil(this.caseId).subscribe(res => {
      this.case = res.data;
      this.newFile = this.case.attachments;
      if (this.case.attachments.length > 0) {
        for (let i = 0; i < this.case.attachments.length; i++)
          if (this.case.attachments[i].status !== CasePhotoStatus.Obsolete) {
            if (this.case.attachments[i]?.status === undefined) {
              this.galleryImages.push(
                {
                  small: this.case.attachments[i].thumb,
                  medium: this.case.attachments[i].original,
                  big: this.case.attachments[i].original
                });
            }

          }
      } else {
        this.galleryImages = [{
          small: 'assets/no-image.jpg',
          medium: 'assets/no-image.jpg',
          big: 'assets/no-image.jpg'
        }]

      }
    })
  }

  onFileChange(event) {
    if (event) {
      this.uploadFiles = Array.from(event.target.files);
      this.errors = [];
      this.reqFiles = [];
    }

    this.fileService.validationAndFileSize(this.uploadFiles, this.FileExtn)
    this.errors = this.fileService.errors;
    this.reqFiles = this.fileService.reqFiles;
    if (this.reqFiles.length > 0) {
      this.saveFiles(this.reqFiles);
    }
  }

  saveFiles(files) {
    this.load = true;
    if (files.length > 0) {
      this.caseService.upload(files, this.caseId).subscribe(res => {
        if (res.status == 200) {
          this.toastr.success(res.data.toString());
          this.galleryImages = [];
          this.caseDetail();
          this.load = false;

        }
      });
    }
  }

  drop1(event: CdkDragDrop<CaseDocument[]>) { //cdkdrop event handle
    if (event.container.data) {
      this.rearranged = true;
      moveItemInArray(this.newFile, event.previousIndex, event.currentIndex);
    }

  }

  deleteImage(index: number, image: CaseDocument) {
    let res = confirm("Do you want to delete the photo");
    if (res) {
      this.newFile.splice(index, 1);
      this.caseService.removeCasePhoto(this.caseId, image.uniqueName).subscribe(res => {
        if (res.status == 200) {
          this.toastr.success(res.data.toString());
          this.galleryImages = [];
          this.caseDetail();
        }
      })
    }
  }
  public isDirty(): boolean {
    return this.isFormDirty();
  }

  resetForm() {
    this.form.resetForm();
    this.rearranged = false;
  }

  isFormDirty() {
    return this.form.dirty || this.rearranged;
  }


}
