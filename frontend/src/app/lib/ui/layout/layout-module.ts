import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout';
import { ContentComponent } from './content';
import { FooterComponent } from './footer';
import { ZHeaderComponent } from './header';
import { SidebarComponent, SidebarGroupComponent, SidebarGroupLabelComponent } from './sidebar';

const LAYOUT_COMPONENTS = [
  LayoutComponent,
  ZHeaderComponent,
  FooterComponent,
  ContentComponent,
  SidebarComponent,
  SidebarGroupComponent,
  SidebarGroupLabelComponent,
];

@NgModule({
  imports: [LAYOUT_COMPONENTS],
  exports: [LAYOUT_COMPONENTS],
})
export class LayoutModule {}
