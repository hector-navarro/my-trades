import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { CreateTradeDto, QueryTradesDto, UpdateTradeDto } from './dto/create-trade.dto';
import { AddTradeEventDto } from './dto/add-event.dto';
import { AddAttachmentDto } from './dto/add-attachment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

interface CurrentUserPayload {
  userId: string;
  role: string;
}

@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTradeDto) {
    return this.tradesService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: QueryTradesDto) {
    return this.tradesService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.tradesService.findOne(user.userId, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTradeDto
  ) {
    return this.tradesService.update(user.userId, id, dto);
  }

  @Post(':id/events')
  addEvent(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: AddTradeEventDto
  ) {
    return this.tradesService.addEvent(user.userId, id, dto);
  }

  @Post(':id/attachments')
  addAttachment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: AddAttachmentDto
  ) {
    return this.tradesService.addAttachment(user.userId, id, dto);
  }
}
