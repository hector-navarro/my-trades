import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { UpdateRiskPolicyDto } from './dto/update-risk-policy.dto';

@Controller('risk-policy')
@UseGuards(JwtAuthGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.riskService.getPolicy(user.userId);
  }

  @Put()
  update(@CurrentUser() user: any, @Body() dto: UpdateRiskPolicyDto) {
    return this.riskService.updatePolicy(user.userId, dto);
  }
}
