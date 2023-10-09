import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DicService } from './services/dic.service';

@NgModule({
  imports: [CommonModule],
  providers: [DicService],
})
export class DicModule {}
