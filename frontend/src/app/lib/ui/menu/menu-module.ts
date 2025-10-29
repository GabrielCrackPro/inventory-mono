import { NgModule } from '@angular/core';

import { ZardMenuContentDirective } from './menu-content';
import { ZardMenuItemDirective } from './menu-item';
import { ZardMenuDirective } from './menu';

const MENU_COMPONENTS = [ZardMenuContentDirective, ZardMenuItemDirective, ZardMenuDirective];

@NgModule({
  imports: [MENU_COMPONENTS],
  exports: [MENU_COMPONENTS],
})
export class ZardMenuModule {}
