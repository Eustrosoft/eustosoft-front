import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toNumber',
})
export class ToNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): number {
    if (typeof value === null || typeof value === undefined) {
      throw new Error(`Can not convert ${typeof value} to number`);
    }
    return value as number;
  }
}
