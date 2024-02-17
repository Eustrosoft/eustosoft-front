/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export function isArrayWithFieldValue<T, V>(
  data: T[],
  fieldName: keyof T,
  value: V,
): boolean {
  if (!Array.isArray(data)) {
    return false; // Not an array
  }

  return data.some((obj) => Boolean(obj) && obj[fieldName] === value);
}
