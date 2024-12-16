import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IstilahDetailAdminModalComponent } from './istilah-detail-admin-modal.component';

describe('IstilahDetailAdminModalComponent', () => {
  let component: IstilahDetailAdminModalComponent;
  let fixture: ComponentFixture<IstilahDetailAdminModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IstilahDetailAdminModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IstilahDetailAdminModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
