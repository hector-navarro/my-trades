import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExportsService } from './exports.service';
import { ExportQueryDto } from './dto/export-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('exports')
@UseGuards(JwtAuthGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('csv')
  @Header('Content-Type', 'text/csv')
  async exportCsv(@CurrentUser() user: any, @Query() query: ExportQueryDto, @Res() res: Response) {
    const csv = await this.exportsService.exportCsv(user.userId, query);
    res.setHeader('Content-Disposition', 'attachment; filename="trades.csv"');
    return res.send(csv);
  }
}
