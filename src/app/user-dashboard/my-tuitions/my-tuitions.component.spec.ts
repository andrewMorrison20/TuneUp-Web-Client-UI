import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MyTuitionsComponent } from './my-tuitions.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import {MyTuitionsModule} from "./my-tuitions.module";

describe('MyTuitionsComponent', () => {
  let component: MyTuitionsComponent;
  let fixture: ComponentFixture<MyTuitionsComponent>;
  let qp$: Subject<any>;

  beforeEach(async () => {
    qp$ = new Subject();

    await TestBed.configureTestingModule({
     imports:[MyTuitionsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: qp$.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyTuitionsComponent);
    component = fixture.componentInstance;
  });

  it('should default to tab 0 when no "tab" param', fakeAsync(() => {
    component.ngOnInit();
    qp$.next({});
    tick();
    expect(component.selectedTab).toBe(0);
  }));

  it('should use numeric "tab" param when valid', fakeAsync(() => {
    component.ngOnInit();
    qp$.next({ tab: '2' });
    tick();
    expect(component.selectedTab).toBe(2);
  }));

  it('should reset tab 0 when "tab" param is not a number', fakeAsync(() => {
    component.ngOnInit();
    qp$.next({ tab: 'foo' });
    tick();
    expect(component.selectedTab).toBe(0);
  }));
});
