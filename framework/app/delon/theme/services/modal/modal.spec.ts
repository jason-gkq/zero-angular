import { Injector, Component, NgModule } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NgZorroAntdModule } from './../../../../ng-zorro-antd.module';
import { ModalHelper } from './modal.helper';
import { AlainThemeModule } from '../../index';

describe('theme: ModalHelper', () => {
  let injector: Injector;
  let modal: ModalHelper;
  let srv: NzModalService;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    @NgModule({
      imports: [
        CommonModule,
        NgZorroAntdModule,
        AlainThemeModule.forChild(),
      ],
      declarations: [TestModalComponent, TestComponent],
      entryComponents: [TestModalComponent],
    })
    class TestModule {}

    injector = TestBed.configureTestingModule({ imports: [TestModule] });
    fixture = TestBed.createComponent(TestComponent);
    modal = injector.get(ModalHelper);
    srv = injector.get(NzModalService);
  });

  afterEach(() => {
    const a = document.querySelector('nz-modal');
    if (a) a.remove();
  });

  function getParentByClassName(el: Element, cls: string): Element {
    while (el.parentElement) {
      el = el.parentElement;
      if (el.classList.contains(cls)) return el;
    }
    return null;
  }

  it('#open', (done: () => void) => {
    modal
      .open(TestModalComponent, {
        ret: 'true',
      })
      .subscribe(res => {
        expect(true).toBeTruthy();
        done();
      });
    fixture.detectChanges();
  });

  it('#open of 100px modal', (done: () => void) => {
    modal
      .open(
        TestModalComponent,
        {
          ret: 'true',
        },
        100,
      )
      .subscribe(res => {
        expect(true).toBeTruthy();
        done();
      });
    fixture.detectChanges();
  });

  describe('#static', () => {
    it('should be open', (done: () => void) => {
      const id = '' + +new Date();
      modal
        .static(TestModalComponent, {
          id,
          ret: true,
        })
        .subscribe(res => {
          fixture.detectChanges();
          expect(res).toBe(true);
          done();
        });
      fixture.detectChanges();
    });
    it('should be open sm size', (done: () => void) => {
      const id = '' + +new Date();
      modal
        .static(
          TestModalComponent,
          {
            id,
            ret: 'true',
          },
          'sm',
        )
        .subscribe(res => {
          fixture.detectChanges();
          expect(res).toBe('true');
          done();
        });
      fixture.detectChanges();
    });
    it('should be open default size', (done: () => void) => {
      const id = '' + +new Date();
      modal
        .static(
          TestModalComponent,
          {
            id,
            ret: 'true',
          },
          '',
        )
        .subscribe(res => {
          fixture.detectChanges();
          expect(res).toBe('true');
          done();
        });
      fixture.detectChanges();
    });
    it('should be custom modal options', (done: () => void) => {
      const id = '' + +new Date();
      const zIndex = 980;
      modal
        .static(
          TestModalComponent,
          {
            id,
            ret: 1,
          },
          'sm',
          {
            zIndex,
          },
        )
        .subscribe(res => {
          fixture.detectChanges();
          expect(res).toBe(1);
          done();
        });
      fixture.detectChanges();
    });
  });
});

@Component({ template: `<div id="modal{{id}}">modal{{id}}</div>` })
class TestModalComponent {
  id: string = '';
  ret: any = 'true';

  constructor(private modal: NzModalRef) {
    setTimeout(() => {
      if (this.ret === 'destroy') this.modal.destroy();
      else this.modal.close(this.ret);
    }, 100);
  }
}

@Component({ template: `` })
class TestComponent {}
