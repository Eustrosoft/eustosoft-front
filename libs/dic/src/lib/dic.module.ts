import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DicService } from './services/dic.service';
import { DicMapperService } from './services/dic-mapper.service';

@NgModule({
  imports: [CommonModule],
  providers: [DicService, DicMapperService],
})
export class DicModule {}
