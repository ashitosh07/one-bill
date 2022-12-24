import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementCreateUpdateComponent } from './announcement-create-update.component';

describe('AnnouncementCreateUpdateComponent', () => {
  let component: AnnouncementCreateUpdateComponent;
  let fixture: ComponentFixture<AnnouncementCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncementCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnouncementCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
