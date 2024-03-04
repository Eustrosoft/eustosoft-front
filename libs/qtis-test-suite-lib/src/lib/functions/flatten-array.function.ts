/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export function flattenArray<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(flattenArray(val));
    }
    return acc.concat(val);
  }, []);
}
