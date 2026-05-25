import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ==================== DASHBOARD ====================
  @Get('dashboard')
  @ApiOperation({ summary: 'Get aggregated financial dashboard statistics' })
  async getDashboard(@Request() req: any) {
    return this.financeService.getDashboardData(req.user.id);
  }

  // ==================== ACCOUNTS ====================
  @Get('accounts')
  @ApiOperation({ summary: 'List all user bank accounts' })
  async getAccounts(@Request() req: any) {
    return this.financeService.getAccounts(req.user.id);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create a bank account' })
  async createAccount(@Request() req: any, @Body() body: any) {
    return this.financeService.createAccount(req.user.id, body);
  }

  @Put('accounts/:id')
  @ApiOperation({ summary: 'Update a bank account' })
  async updateAccount(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.financeService.updateAccount(req.user.id, id, body);
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: 'Delete a bank account' })
  async deleteAccount(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.financeService.deleteAccount(req.user.id, id);
  }

  // ==================== CREDIT CARDS ====================
  @Get('cards')
  @ApiOperation({ summary: 'List all user credit cards' })
  async getCreditCards(@Request() req: any) {
    return this.financeService.getCreditCards(req.user.id);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Create a credit card' })
  async createCreditCard(@Request() req: any, @Body() body: any) {
    return this.financeService.createCreditCard(req.user.id, body);
  }

  @Put('cards/:id')
  @ApiOperation({ summary: 'Update credit card settings' })
  async updateCreditCard(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.financeService.updateCreditCard(req.user.id, id, body);
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Delete a credit card' })
  async deleteCreditCard(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.financeService.deleteCreditCard(req.user.id, id);
  }

  // ==================== TRANSACTIONS ====================
  @Get('transactions')
  @ApiOperation({ summary: 'List and filter transactions' })
  async getTransactions(
    @Request() req: any,
    @Query() query: any,
  ) {
    return this.financeService.getTransactions(req.user.id, query);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create a transaction (income/expense/installments)' })
  async createTransaction(@Request() req: any, @Body() body: any) {
    return this.financeService.createTransaction(req.user.id, body);
  }

  @Put('transactions/:id')
  @ApiOperation({ summary: 'Update transaction details' })
  async updateTransaction(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.financeService.updateTransaction(req.user.id, id, body);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete a transaction' })
  async deleteTransaction(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.financeService.deleteTransaction(req.user.id, id);
  }

  // ==================== GOALS ====================
  @Get('goals')
  @ApiOperation({ summary: 'List user financial goals' })
  async getGoals(@Request() req: any) {
    return this.financeService.getGoals(req.user.id);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create a financial goal' })
  async createGoal(@Request() req: any, @Body() body: any) {
    return this.financeService.createGoal(req.user.id, body);
  }

  @Put('goals/:id')
  @ApiOperation({ summary: 'Update a financial goal progress' })
  async updateGoal(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.financeService.updateGoal(req.user.id, id, body);
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete a financial goal' })
  async deleteGoal(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.financeService.deleteGoal(req.user.id, id);
  }
}
