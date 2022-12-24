import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyClientSettingsComponent } from './copy-client-settings.component';

describe('CopyClientSettingsComponent', () => {
  let component: CopyClientSettingsComponent;
  let fixture: ComponentFixture<CopyClientSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyClientSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyClientSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
