import { AgmCoreModule } from '@agm/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChangepasswordComponent } from './components/auth/changepassword/changepassword.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { LoginComponent } from './components/auth/login/login.component';
import { LoginSuccessComponent } from './components/auth/login/success.component';
import { SetpasswordComponent } from './components/auth/setpassword/setpassword.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { AboutCcComponent } from './components/common/about-cc/about-cc.component';
import { AboutComponent } from './components/common/about/about.component';
import { BenefactorComponent } from './components/common/benefactor/benefactor.component';
import { BeneficiaryComponent } from './components/common/beneficiary/beneficiary.component';
import { ContactUsComponent } from './components/common/contact-us/contact-us.component';
import { DonateCcComponent } from './components/common/donate-cc/donate-cc.component';
import { FaqComponent } from './components/common/faq/faq.component';
import { FooterComponent } from './components/common/footer/footer.component';
import { HeaderComponent } from './components/common/header/header.component';
import { HelpComponent } from './components/common/help/help.component';
import { HomeComponent } from './components/common/home/home.component';
import { MapComponent } from './components/common/map/map.component';
import { ProfilePanelComponent } from './components/common/profile-panel/profile-panel.component';
import { ReviewsCaseComponent } from './components/common/reviews-case/reviews-case.component';
import { ReviewsUserComponent } from './components/common/reviews-user/reviews-user.component';
import { SearchComponent } from './components/common/search/search.component';
import { TermsComponent } from './components/common/terms/terms.component';
import { TransactionBenefactorComponent } from './components/common/transaction-benefactor/transaction-benefactor.component';
import {
  TransactionBeneficiaryComponent,
} from './components/common/transaction-beneficiary/transaction-beneficiary.component';
import { TransactionsComponent } from './components/common/transactions/transactions.component';
import { CaseAddComponent } from './components/user/case-add/case-add.component';
import { CaseEditComponent } from './components/user/case-edit/case-edit.component';
import { CaseviewComponent } from './components/user/case-view/case-view.component';
import { DonateConfirmComponent } from './components/user/donate-confirm/donate-confirm.component';
import { DonateFailureComponent } from './components/user/donate-failure/donate-failure.component';
import { DonateInfoComponent } from './components/user/donate-info/donate-info.component';
import { DonatePageComponent } from './components/user/donate-page/donate-page.component';
import { DonateThankYouComponent } from './components/user/donate-thank-you/donate-thank-you.component';
import { ProfileUpdateComponent } from './components/user/profile-update/profile-update.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { DirtyCheckGuard } from './core/guards/dirty-check.guard';
import { SessionService } from './core/services/session.service';
import { TokenInterceptor } from './core/services/token.interceptor';
import { MustmatchDirective } from './helpers/mustmatch.directive';
import { SubmitDirective } from './helpers/submit.directive';
import { LocalDatePipe } from './pipes/local-date.pipe';
import { LocalNumberPipe } from './pipes/local-number.pipe';
import { RatingDatePipe } from './pipes/rating-date.pipe';
import { TransactionDatePipe } from './pipes/transaction-date.pipe';
import { PreviousRouteService } from './services/previous-route.service';

// registerLocaleData(localede);
export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './dist/frontend/assets/i18n/', '.json');
}
export function setupTranslateFactory(
  service: SessionService): Function {
  return () => service.locale;
}

@NgModule({
  declarations: [
    AppComponent,
    LocalDatePipe,
    LocalNumberPipe,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    ForgotPasswordComponent,
    SetpasswordComponent,
    LoginComponent,
    LoginSuccessComponent,
    SignupComponent,
    ChangepasswordComponent,
    ProfileComponent,
    DonatePageComponent,
    DonateConfirmComponent,
    DonateThankYouComponent,
    MustmatchDirective,
    SubmitDirective,
    CaseviewComponent,
    BeneficiaryComponent,
    BenefactorComponent,
    CaseAddComponent,
    CaseEditComponent,
    MapComponent,
    AboutComponent,
    ContactUsComponent,
    AboutCcComponent,
    DonateCcComponent,
    FaqComponent,
    TermsComponent,
    SearchComponent,
    HelpComponent,
    ProfileUpdateComponent,
    DonateInfoComponent,
    DonateFailureComponent,
    TransactionsComponent,
    ReviewsUserComponent,
    ReviewsCaseComponent,
    TransactionDatePipe,
    RatingDatePipe,
    TransactionBenefactorComponent,
    TransactionBeneficiaryComponent,
    ProfilePanelComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxGalleryModule,
    Ng2SearchPipeModule,
    NgbModule,
    DragDropModule,
    InfiniteScrollModule,
    Ng2TelInputModule,
    ScrollToModule.forRoot(),
    ToastrModule.forRoot(),
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
  providers: [{
    provide: LOCALE_ID,
    deps: [SessionService],
    useFactory: setupTranslateFactory
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  },
    DirtyCheckGuard,
    CurrencyPipe,
    DecimalPipe,
    PreviousRouteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
