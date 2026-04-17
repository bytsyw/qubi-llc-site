import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller('public/apps')
export class PublicAppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  async getPublicApps(@Query('locale') locale?: string) {
    return this.appsService.getPublicApps(locale);
  }

  @Get(':slug')
  async getPublicApp(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.appsService.getPublicAppBySlug(slug, locale);
  }
}
