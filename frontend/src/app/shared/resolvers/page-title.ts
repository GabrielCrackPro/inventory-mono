import { inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type { ResolveFn } from '@angular/router';

export const pageTitleResolver: ResolveFn<void> = (route, state) => {
  const titleService = inject(Title);

  const title = route.data['title'];
  const defaultTitle = 'Inventory Dashboard';

  const titleString = title ? `${title} | ${defaultTitle}` : defaultTitle;

  if (title) {
    titleService.setTitle(titleString);
  }
};
