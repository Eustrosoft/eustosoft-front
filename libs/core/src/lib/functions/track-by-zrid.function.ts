/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export const trackByZridFunction = <T extends { zrid: number }>(
  index: number,
  element: T
): number => {
  return element.zrid;
};
