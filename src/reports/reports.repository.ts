import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(Report)
    private readonly reportOrmRepository: Repository<Report>,
  ) {}

  create(dto: CreateReportDto, photoUrl: string): Report {
    return this.reportOrmRepository.create({
      address: dto.address,
      description: dto.description,
      severity: dto.severity,
      reporterPhone: dto.reporterPhone,
      isResolved: false,
      photoUrl,
      repairPhotoUrl: null,
    });
  }

  async save(report: Report): Promise<Report> {
    return this.reportOrmRepository.save(report);
  }

  async findAll(): Promise<Report[]> {
    return this.reportOrmRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
