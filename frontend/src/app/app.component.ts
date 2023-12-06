import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import PullToRefresh from 'pulltorefreshjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'baby-formula-frontend';

  constructor() {
    PullToRefresh.init({
      mainElement: 'body',
      onRefresh() {
        window.location.reload();
      },
    });
  }
}
