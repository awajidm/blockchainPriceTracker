import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceHistory } from './entities/price-history.entity';
import { PriceAlerts } from './entities/price-alerts.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceHistoryService } from './services/price-history.service';
import { PriceAlertsService } from './services/price-alerts.service';
import { EmailService } from './services/email.service';
import { ScheduledTasksService } from './services/scheduled-tasks.service';
import { PriceTrackerController } from './controllers/price-tracker.controller';
import { MoralisService } from './moralis/moralis.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Only for development, disable in production
      }),
    }),
    TypeOrmModule.forFeature([PriceHistory, PriceAlerts]),
  ],
  controllers: [PriceTrackerController],
  providers: [
    MoralisService,
    ScheduledTasksService,
    PriceHistoryService,
    PriceAlertsService,
    EmailService,
  ],
})
export class AppModule {}
