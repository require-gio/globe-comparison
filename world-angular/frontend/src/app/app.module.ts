import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

import { AppComponent } from './app.component';
import { GlobeComponent } from './components/globe/globe.component';
import { CountryInfoComponent } from './components/country-info/country-info.component';

@NgModule({
  declarations: [AppComponent, GlobeComponent, CountryInfoComponent],
  imports: [BrowserModule, CommonModule, BrowserAnimationsModule, HttpClientModule, OverlayModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
