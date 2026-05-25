import { Controller, Get, Query, UseGuards, Request, Header, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary metrics of reports' })
  async getSummary(@Request() req: any) {
    return this.reportsService.getReportsSummary(req.user.id);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export financial reports as downloadable CSV' })
  async export(@Request() req: any, @Query('type') type: string, @Res() res: Response) {
    const csv = await this.reportsService.exportCsv(req.user.id, type || 'transactions');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_${type || 'transactions'}.csv`);
    return res.send(csv);
  }
}
