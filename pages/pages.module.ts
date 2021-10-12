import {NgModule} from '@angular/core';

import {SharedModule} from '@shared/shared.module';
import {PagesRoutingModule} from './pages-routing.module';

@NgModule({
    imports: [SharedModule, PagesRoutingModule]
})

export class PagesModule {
}
