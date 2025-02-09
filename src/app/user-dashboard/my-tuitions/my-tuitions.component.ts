import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-my-tuitions',
  templateUrl: './my-tuitions.component.html',
  styleUrls: ['./my-tuitions.component.scss']
})
export class MyTuitionsComponent implements OnInit {
  selectedTab = 0; // Default to first tab (Lesson Requests)

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tabIndex = params['tab'] ? Number(params['tab']) : 0;
      this.selectedTab = isNaN(tabIndex) ? 0 : tabIndex;
    });
  }
}
