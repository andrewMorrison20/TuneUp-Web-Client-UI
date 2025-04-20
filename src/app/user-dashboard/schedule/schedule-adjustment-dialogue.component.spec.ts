import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleAdjustmentDialogComponent } from './schedule-adjustment-dialogue.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {UserDashboardModule} from "../user-dashboard.module";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ScheduleAdjustmentDialogComponent', () => {
  let component: ScheduleAdjustmentDialogComponent;
  let fixture: ComponentFixture<ScheduleAdjustmentDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ScheduleAdjustmentDialogComponent>>;
  const baseData = {
    startTime: '2025-05-01T12:00:00Z',
    endTime:   '2025-05-01T13:30:00Z',
    isEditMode: false
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(0);
    await TestBed.configureTestingModule({
      imports:[UserDashboardModule, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: baseData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleAdjustmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize selectedStartTime, selectedEndTime and isEditMode', () => {
    // compute expected via same logic
    const expectedStart = new Date(baseData.startTime);
    expectedStart.setMinutes(expectedStart.getMinutes() - expectedStart.getTimezoneOffset());
    const expStr = expectedStart.toISOString().slice(0, 16);

    expect(component.selectedStartTime).toBe(expStr);
    expect(component.selectedEndTime).toBe(new Date(baseData.endTime)
      .toISOString().slice(0, 16));
    expect(component.isEditMode).toBeFalse();
  });

  describe('formatDateForInput()', () => {
    it('returns ISO string trimmed to minutes, adjusted for timezone', () => {
      const input = '2025-12-31T23:45:00Z';
      const out = component.formatDateForInput(input);
      expect(out).toBe('2025-12-31T23:45');
    });
  });

  describe('isValidTimeSelection()', () => {
    it('returns true when start < end', () => {
      component.selectedStartTime = '2025-05-01T08:00';
      component.selectedEndTime   = '2025-05-01T09:00';
      expect(component.isValidTimeSelection()).toBeTrue();
    });

    it('returns false when times are equal', () => {
      component.selectedStartTime = '2025-05-01T10:00';
      component.selectedEndTime   = '2025-05-01T10:00';
      expect(component.isValidTimeSelection()).toBeFalse();
    });

    it('returns false when start > end', () => {
      component.selectedStartTime = '2025-05-01T11:00';
      component.selectedEndTime   = '2025-05-01T10:00';
      expect(component.isValidTimeSelection()).toBeFalse();
    });
  });

  describe('onCancel()', () => {
    it('closes dialog with no data', () => {
      component.onCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('onSave()', () => {
    beforeEach(() => {
      // set valid times
      component.selectedStartTime = '2025-05-02T08:00';
      component.selectedEndTime   = '2025-05-02T09:00';
    });

    it('alerts and does not close when invalid selection', () => {
      spyOn(window, 'alert');
      component.selectedStartTime = '2025-05-02T10:00';
      component.selectedEndTime   = '2025-05-02T09:00';
      component.onSave();
      expect(window.alert)
        .toHaveBeenCalledWith(' Start time must be before End time.');
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('closes with create action when not edit mode', () => {
      component.isEditMode = false;
      component.onSave();
      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        startTime: component.selectedStartTime,
        endTime:   component.selectedEndTime,
        action:    'create'
      });
    });

    it('closes with update action when in edit mode', () => {
      component.isEditMode = true;
      component.onSave();
      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        startTime: component.selectedStartTime,
        endTime:   component.selectedEndTime,
        action:    'update'
      });
    });
  });

  describe('onDelete()', () => {
    it('closes dialog with delete action', () => {
      component.onDelete();
      expect(dialogRefSpy.close).toHaveBeenCalledWith({ action: 'delete' });
    });
  });
});
