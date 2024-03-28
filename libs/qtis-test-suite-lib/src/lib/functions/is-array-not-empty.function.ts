/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export function isArrayNotEmpty(data: unknown): boolean {
  return Array.isArray(data) && data.length > 0;
}
