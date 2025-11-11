import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TradesModule } from './trades/trades.module';
import { ReportsModule } from './reports/reports.module';
import { RiskModule } from './risk/risk.module';
import { SetupsModule } from './setups/setups.module';
import { TagsModule } from './tags/tags.module';
import { ExportsModule } from './exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.name'),
        maxPoolSize: 10
      })
    }),
    AuthModule,
    UsersModule,
    TradesModule,
    ReportsModule,
    RiskModule,
    SetupsModule,
    TagsModule,
    ExportsModule
  ]
})
export class AppModule {}
