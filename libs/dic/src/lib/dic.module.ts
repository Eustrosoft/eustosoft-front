/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DicService } from './services/dic.service';
import { DicMapperService } from './services/dic-mapper.service';

@NgModule({
  imports: [CommonModule],
  providers: [DicService, DicMapperService],
})
export class DicModule {}
