import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgStyle} from '@angular/common';

@Component({
  selector: 'app-link',
  imports: [RouterLink, NgStyle],
  templateUrl: './link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LinkComponent {
  title = input.required<string>();
  route = input.required<string>();
}
