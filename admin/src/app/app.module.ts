import { AgmCoreModule } from '@agm/core';
import { CdkTableModule } from '@angular/cdk/table';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { JwtModule } from '@auth0/angular-jwt';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule } from 'ngx-toastr';

import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminhomeComponent } from './components/adminhome/adminhome.component';
import { LoginComponent } from './components/auth/login/login.component';
import { LoginSuccessComponent } from './components/auth/login/success.component';
import { CaseListComponent } from './components/case-list/case-list.component';
import { BeneficiaryComponent, DialogKYCData, KycDialogBoxComponent } from './components/common/beneficiary/beneficiary.component';
import { CaseviewComponent } from './components/common/case-view/case-view.component';
import { CaseComponent, DialogDonationData } from './components/common/case/case.component';
import { CdkDetailRowDirective } from './components/common/case/cdk-detail-row.directive';
import { DialogBoxComponent } from './components/common/dialog-box/dialog-box.component';
import {PayoutDialogBoxComponent} from './components/common/payout-dialog-box/payout-dialog-box.component';
import { DonationsTableComponent } from './components/common/donations-table/donations-table.component';
import { HeaderComponent } from './components/common/header/header.component';
import { OrderpageComponent } from './components/common/orderpage/orderpage.component';
import { SupportFormComponent } from './components/common/support-form/support-form.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LoginDialogComponent, NagivationComponent } from './components/nagivation/nagivation.component';
import { LoaderInterceptor } from './core/services/loader.interceptor';
import { TokenInterceptor } from './core/services/token.interceptor';
import { LocalDatePipe } from './pipes/local-date.pipe';
import { LocalNumberPipe } from './pipes/local-number.pipe';
import { TransactionDatePipe } from './pipes/transaction-date.pipe';
import { TransactionDateTimePipe } from './pipes/transaction-datetime.pipe';
import { LoaderService } from './services/loader.service';
import { RouterModule, Routes } from '@angular/router';
//import { ContactFormComponent } from './components/common/contact-form/contact-form.component';
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminhomeComponent,
    LoginSuccessComponent,
    HeaderComponent,
    CaseComponent,
    DialogBoxComponent,
    PayoutDialogBoxComponent,
    BeneficiaryComponent,
    CaseviewComponent,
    NagivationComponent,
    TransactionDatePipe,
    TransactionDateTimePipe,
    OrderpageComponent,
    CaseListComponent,
    DonationsTableComponent,
    CdkDetailRowDirective,
    BeneficiaryComponent,
    SupportFormComponent,
    DialogKYCData,
    LocalDatePipe,
    LocalNumberPipe,
    DialogDonationData,
    LoginDialogComponent,
    SupportFormComponent,
    LoaderComponent,
    KycDialogBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    HttpClientModule,
    MatDialogModule,
    MatTableModule,
    CdkTableModule,
    MatProgressBarModule,
    ToastrModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: function tokenGetter() {
          return localStorage.getItem('access_token');
        }
      }
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCraKDIoq-veb3wSRBc0fjsqaHWhqYbYMA',
      libraries: ["places"]
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (httpLoaderFactory),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
