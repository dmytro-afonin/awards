import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgStyle} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgStyle,
    RouterLink
  ],
  standalone: true
})
export class NewsComponent {
}
