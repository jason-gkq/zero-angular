import {
  NgModule,
  ModuleWithProviders,
  InjectionToken,
  Optional,
  SkipSelf,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WINDOW } from './win_tokens';

// region: import
import { MenuService } from './services/menu/menu.service';
import { ScrollService } from './services/scroll/scroll.service';
import { SettingsService } from './services/settings/settings.service';
import { TitleService } from './services/title/title.service';
import { ALAIN_I18N_TOKEN, AlainI18NServiceFake } from './services/i18n/i18n';
import { _HttpClient } from './services/http/http.client';
const SERVICES = [
  MenuService,
  ScrollService,
  SettingsService,
  TitleService,
  _HttpClient,
];

import { ModalHelper } from './services/modal/modal.helper';
const HELPERS = [ModalHelper];

// components
const COMPONENTS = [];

// pipes
const PIPES = [];

// endregion

// region: zorro modules

// import { NzToolTipModule } from 'ng-zorro-antd';

const ZORROMODULES = [];

// endregion

@NgModule({
  imports: [CommonModule, RouterModule, ...ZORROMODULES],
  declarations: [...COMPONENTS, ...PIPES],
  exports: [...COMPONENTS, ...PIPES],
})
export class AlainThemeModule {
  static forRoot(): ModuleWithProviders<AlainThemeModule> {
    return {
      ngModule: AlainThemeModule,
      providers: [
        { provide: WINDOW, useValue: window },
        { provide: ALAIN_I18N_TOKEN, useClass: AlainI18NServiceFake },
        ...SERVICES,
        ...HELPERS,
      ],
    };
  }

  static forChild(): ModuleWithProviders<AlainThemeModule> {
    return {
      ngModule: AlainThemeModule,
      providers: [...HELPERS],
    };
  }
}
