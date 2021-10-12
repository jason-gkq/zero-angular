import { LcbSmsPreviewComponent } from './components/lcb-sms-preview/lcb-sms-preview.component';
import { LocalDictionaryPipe } from './pipes/dictionary/localDictionary.pipe';
import { SafeHtmlPipe } from './pipes/safe-html/safe-html.pipe';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DelonABCModule } from '@delon/abc';
// delon
import { AlainThemeModule } from '@delon/theme';
// i18n
import { TranslateModule } from '@ngx-translate/core';
import { LcbFineReportComponent } from '@shared/components/lcb-fine-report/lcb-fine-report.component';
// 公共组件
import { LcbOptionsComponent } from '@shared/components/lcb-options/lcb-options.component'; // 列表操作组件
import { LcbQuillComponent } from '@shared/components/lcb-quill/lcb-quill.component';
import { LcbSecurityCodeComponent } from '@shared/components/lcb-security-code/lcb-security-code.component';
import { LcbDownloadComponent } from '@shared/components/lcb-download/lcb-download.component';
import { AuthDirective } from '@shared/directives/auth/auth.directive';
import { InputErrorDirective } from '@shared/directives/inputErrorMsg/input-error.directive';
import { Exception403Component } from '@shared/exception/403.component';
import { Exception404Component } from '@shared/exception/404.component';
import { Exception500Component } from '@shared/exception/500.component';
import { AuthLoginComponent } from '@shared/auth/login/login.component';
import { AuthForgetPwdComponent } from '@shared/auth/forgetPwd/forgetPwd.component';
import { UserLogoutComponent } from '@shared/passport/logout/logout.component';
import { EqualValidatorDirective } from '@shared/passport/shared/validate-equal-directive';
import { LcbSelectTagsComponent } from './components/lcb-select-tags/lcb-select-tags.component';
import { LcbNzImgCropperComponent } from './components/lcb-nz-img-cropper/lcb-nz-img-cropper.component';
// region: third libs
import { NgZorroAntdModule } from 'app/ng-zorro-antd.module';
import { CountdownModule } from 'ngx-countdown';
import { LcbImgCropperComponent } from './components/lcb-img-cropper/lcb-img-cropper.component';
import { LcbImgUploaderComponent } from './components/lcb-img-uploader/lcb-img-uploader.component';
import { LcbQrcodeComponent } from './components/lcb-qrcode/lcb-qrcode.component';
import { DragSortDirective } from './directives/drag-sort.directive';
import { HoverShowDirective } from './directives/hover-show.directive';
// endregion
// region: your componets & directives
import { HomeComponent } from './home/home.component';
import { DictionaryPipe } from './pipes/dictionary/dictionary.pipe';
import { OptionsPipe } from './pipes/options/options.pipe';

import { LcbCarPickerComponent } from './components/lcb-car-picker/lcb-car-picker.component';
import { ColorSketchModule } from 'ngx-color/sketch';

// import { NzSchemaFormModule } from 'nz-schema-form';
const THIRDMODULES = [
    NgZorroAntdModule,
    CountdownModule,
    ColorSketchModule
    // NzSchemaFormModule
];

const COMPONENTS = [
    HomeComponent,
    Exception403Component,
    Exception404Component,
    Exception500Component,
    AuthLoginComponent,
    AuthForgetPwdComponent,
    UserLogoutComponent,
    LcbOptionsComponent,
    LcbDownloadComponent,
    LcbQrcodeComponent,
    LcbSecurityCodeComponent,
    LcbFineReportComponent,
    LcbImgUploaderComponent,
    LcbQuillComponent,
    LcbImgCropperComponent,
    LcbCarPickerComponent,
    LcbNzImgCropperComponent,
    LcbSelectTagsComponent,
    LcbSmsPreviewComponent
];


const DIRECTIVES = [
    AuthDirective,
    InputErrorDirective,
    EqualValidatorDirective,
    DragSortDirective,
    HoverShowDirective,
];

const PIPES = [
    DictionaryPipe,
    OptionsPipe,
    SafeHtmlPipe,
    LocalDictionaryPipe
];
// endregion

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        AlainThemeModule.forChild(),
        DelonABCModule,
        // third libs
        ...THIRDMODULES,
    ],
    declarations: [
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        ...PIPES
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlainThemeModule,
        DelonABCModule,
        // i18n
        TranslateModule,
        // third libs
        ...THIRDMODULES,
        // your components
        ...COMPONENTS,
        ...DIRECTIVES,
        ...PIPES
    ],
    entryComponents: [LcbCarPickerComponent]
})
export class SharedModule { }
