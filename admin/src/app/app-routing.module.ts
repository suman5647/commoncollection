import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminhomeComponent } from './components/adminhome/adminhome.component';
import { LoginComponent } from './components/auth/login/login.component';
import { LoginSuccessComponent } from './components/auth/login/success.component';
import { BeneficiaryComponent } from './components/common/beneficiary/beneficiary.component';
import { CaseviewComponent } from './components/common/case-view/case-view.component';
import { CaseComponent } from './components/common/case/case.component';
import { OrderpageComponent } from './components/common/orderpage/orderpage.component';
import { NagivationComponent } from './components/nagivation/nagivation.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'adminhome', component: AdminhomeComponent },
  { path: 'loginsucess', component: LoginSuccessComponent },
  { path: 'cases/:status', component: CaseComponent },
  { path: 'caseview/:caseId', component: CaseviewComponent },
  { path: 'orderpage/:orderId', component: OrderpageComponent },
  { path: 'beneficiary/:userId', component: BeneficiaryComponent },
  { path: 'adminhome/nav', component: NagivationComponent },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
