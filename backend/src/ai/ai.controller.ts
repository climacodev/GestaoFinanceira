import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('insights')
  @ApiOperation({ summary: 'Retrieve dynamic AI-generated financial insights' })
  async getInsights(@Request() req: any) {
    return this.aiService.generateInsights(req.user.id);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Ask financial advice to the AI chatbot' })
  async askQuestion(@Request() req: any, @Body() body: { question: string }) {
    return this.aiService.answerQuestion(req.user.id, body.question);
  }
}
