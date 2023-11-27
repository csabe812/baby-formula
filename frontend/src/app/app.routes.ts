import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { HistoryComponent } from './history/history.component';
import { AddComponent } from './add/add.component';
import { AddCommentComponent } from './add-comment/add-comment.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'add', component: AddComponent },
  { path: 'add/:id', component: AddComponent },
  { path: 'add-comment', component: AddCommentComponent },
];
