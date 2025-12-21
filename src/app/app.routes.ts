import { Routes } from '@angular/router';
import {NomineesComponent} from '../nominies/nominees.component';
import {NewsComponent} from '../news/news.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => NewsComponent
  },
  {
    path: 'nominees',
    loadComponent: () => NomineesComponent
  }
];
