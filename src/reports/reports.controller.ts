import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { OverviewQueryDto } from './dto/overview-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  overview(@CurrentUser() user: any, @Query() query: OverviewQueryDto) {
    return this.reportsService.overview(user.userId, query);
  }

  @Get('errors')
  errors(@CurrentUser() user: any) {
    return this.reportsService.errors(user.userId);
  }
}
