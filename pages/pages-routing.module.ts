import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';
import { Exception404Component } from '@shared/exception/404.component';
import { HomeComponent } from '@shared/home/home.component';


const routes: Routes = [
    {path: '', redirectTo: environment.defaultHome, pathMatch: 'full'},
    {path: 'home', component: HomeComponent, data: {title: '首页'}},
    {path: '**', component: Exception404Component, data: {title: '404'}}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {
}
