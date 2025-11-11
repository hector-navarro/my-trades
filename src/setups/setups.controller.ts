import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SetupsService } from './setups.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateSetupDto, UpdateSetupDto } from './dto/setup.dto';

@Controller('setups')
@UseGuards(JwtAuthGuard)
export class SetupsController {
  constructor(private readonly setupsService: SetupsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.setupsService.findAll(user.userId);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateSetupDto) {
    return this.setupsService.create(user.userId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateSetupDto) {
    return this.setupsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.setupsService.remove(user.userId, id);
  }
}
