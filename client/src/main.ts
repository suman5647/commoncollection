import { enableProdMode,TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MissingTranslationStrategy } from '@angular/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
//import{Sessionservice} from './app/services/session.service'


if (environment.production) {
  enableProdMode();
}
// if (localStorage.getItem('locale') === null) {
//   localStorage.setItem('locale', 'en');
//   }
// {
//   providers: [
//     {provide: TRANSLATIONS, useValue: translations},
//     {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'}
//   ]
// }
// const locale = localStorage.getItem('locale');
// console.log(locale)
// declare const require;
// const translations = require(`raw-loader!./locale/messages.da.xlf`);

platformBrowserDynamic().bootstrapModule(AppModule);
