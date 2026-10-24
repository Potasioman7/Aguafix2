import { Injectable, Logger } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/report.entity';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { generateReportTemplate } from './templates/report.template';
import { envs } from '../config/envs';

const REPORTS_PHOTO_FOLDER = 'reports';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  async create(dto: CreateReportDto, photo: Express.Multer.File): Promise<Report> {
    const photoUrl = await this.storageService.uploadFile(photo, REPORTS_PHOTO_FOLDER);

    const report = this.reportsRepository.create(dto, photoUrl);
    const savedReport = await this.reportsRepository.save(report);

    // Enviar aviso a la cuadrilla de mantenimiento. Si el correo falla,
    // no se revierte el reporte (ya quedo guardado), solo se registra el error.
    try {
      const html = generateReportTemplate(dto, photoUrl);
      await this.emailService.sendEmail(
        envs.maintenanceCrewEmail,
        `Nueva fuga de agua reportada - Severidad: ${dto.severity.toUpperCase()}`,
        html,
      );
    } catch (error) {
      this.logger.error(
        `El reporte #${savedReport.id} se guardo, pero fallo el envio del correo: ${error.message}`,
      );
    }

    return savedReport;
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.findAll();
  }
}
