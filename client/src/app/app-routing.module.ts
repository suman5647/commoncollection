import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService as AuthGuard } from './core/guards/auth-guard.service';
import { BeneficiaryComponent, BenefactorComponent } from './components/common';
import { TransactionsComponent } from './components/common/transactions/transactions.component';
import { ReviewsUserComponent } from './components/common/reviews-user/reviews-user.component';
import { ReviewsCaseComponent } from './components/common/reviews-case/reviews-case.component';
import { DirtyCheckGuard } from './core/guards/dirty-check.guard';
import { HomeComponent } from './components/common/home/home.component';
import { SearchComponent } from './components/common/search/search.component';
import { AboutComponent } from './components/common/about/about.component';
import { HelpComponent } from './components/common/help/help.component';
import { CreateCaseComponent } from './components/common/create-case/create-case.component';
import { AboutCcComponent } from './components/common/about-cc/about-cc.component';
import { DonateCcComponent } from './components/common/donate-cc/donate-cc.component';
import { FaqComponent } from './components/common/faq/faq.component';
import { TermsComponent } from './components/common/terms/terms.component';
import { ContactUsComponent } from './components/common/contact-us/contact-us.component';
import { ForgotPasswordComponent, ChangepasswordComponent, SetpasswordComponent, LoginComponent, LoginSuccessComponent, SignupComponent } from './components/auth';
import { ProfileComponent, CaseviewComponent, CaseAddComponent, CaseEditComponent, DonatePageComponent, DonateConfirmComponent, DonateThankYouComponent } from './components/user';
// import { DonationComponent } from './components/user/donation/donation.component';
import { ProfileUpdateComponent } from './components/user/profile-update/profile-update.component';
import { DonateInfoComponent } from './components/user/donate-info/donate-info.component';
import { TransactionBenefactorComponent } from './components/common/transaction-benefactor/transaction-benefactor.component';
import { TransactionBeneficiaryComponent } from './components/common/transaction-beneficiary/transaction-beneficiary.component';
import { DonateFailureComponent } from './components/user/donate-failure/donate-failure.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'loginsucess', component: LoginSuccessComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'resetpassword', component: SetpasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'search/:text', component: SearchComponent },
  { path: 'about-us', component: AboutComponent },
  { path: 'help', component: HelpComponent },
  { path: 'create-case', component: CreateCaseComponent },
  { path: 'about-cc', component: AboutCcComponent },
  { path: 'donate-cc', component: DonateCcComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'donate-page', component: DonatePageComponent },
  { path: 'donate-confirm', component: DonateConfirmComponent },
  { path: 'donate-thank-you', component: DonateThankYouComponent },
  { path: 'donate-info/:orderId/:orderAmount/:currency/:status', component: DonateInfoComponent },
  { path: 'donate-info', component: DonateInfoComponent },
  { path: 'donate-failure/:orderId/:orderAmount/:currency/:status', component: DonateFailureComponent },
  { path: 'changepassword', component: ChangepasswordComponent },
  { path: 'case-view/:caseId', component: CaseviewComponent },
  { path: 'beneficiary/:userId', component: BeneficiaryComponent },
  { path: 'benefactor/:userId', component: BenefactorComponent },
  { path: 'updateprofile', component: ProfileUpdateComponent },
  { path: 'case-add', component: CaseAddComponent, canActivate: [AuthGuard] },
  { path: 'case-edit/:caseId', component: CaseEditComponent, canDeactivate: [DirtyCheckGuard] },
  // { path: 'donate/:caseId', component: DonationComponent, canActivate: [AuthGuard]},
  { path: 'donate-page/:caseId', component: DonatePageComponent, canActivate: [AuthGuard] },
  { path: 'donate-confirm/:caseId', component: DonateConfirmComponent, canActivate: [AuthGuard] },
  { path: 'donate-thank-you/:caseId', component: DonateThankYouComponent, canActivate: [AuthGuard] },
  { path: 'reviews-user/:userId', component: ReviewsUserComponent },
  { path: 'reviews-case/:caseId', component: ReviewsCaseComponent },
  { path: 'transactions/:userId', component: TransactionsComponent },
  { path: 'transactions-benefactor/:userId', component: TransactionBenefactorComponent },
  { path: 'transactions-beneficiary/:userId', component: TransactionBeneficiaryComponent },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
