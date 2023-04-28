import { NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, PlatformLocation } from '@angular/common';
import { ConfigService } from './services/config.service';
import { APP_CONFIG } from './di/config.token';

@NgModule({
  imports: [CommonModule],
  providers: [
    ConfigService,
    {
      provide: APP_BASE_HREF,
      useFactory: (pl: PlatformLocation) => pl.getBaseHrefFromDOM(),
      deps: [PlatformLocation],
    },
    {
      provide: APP_CONFIG,
      useFactory: (configService: ConfigService) => configService.getConfig(),
      deps: [ConfigService],
    },
  ],
})
export class ConfigModule {}
