/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export function numberToHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}
