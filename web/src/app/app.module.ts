import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// tslint:disable-next-line:max-line-length
import {MatCardModule, MatProgressSpinnerModule, MatSliderModule, MatSnackBarModule, MatTableModule, MatTabsModule} from '@angular/material';
import {MatButtonModule} from '@angular/material/button';
import { HttpClientModule} from '@angular/common/http';
import {GDPRContent, LoginComponent} from './Login/Login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import {MenuComponent, NewProjectDialog} from './menu/menu.component';
import {AppComponent} from './app.component';
import {Data} from './data.service';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {kravEditComponent} from './kravEdit/kravEdit.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTreeModule} from '@angular/material/tree';
import {userEditComponent} from './UserEdit/userEdit.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    kravEditComponent,
    NewProjectDialog,
    GDPRContent,
    userEditComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    MatProgressSpinnerModule,
    Data,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
    MatDialogModule,
    FormsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatTreeModule,
    MatTabsModule,
    MatButtonToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [
    NewProjectDialog,
    GDPRContent
  ],
  entryComponents: [
    NewProjectDialog,
    GDPRContent
  ]
})
export class AppModule { }
