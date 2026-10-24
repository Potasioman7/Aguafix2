import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/report.entity';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createReportDto: CreateReportDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^(image\/jpeg|image\/png|image\/webp)$/ })
        .addMaxSizeValidator({ maxSize: MAX_PHOTO_SIZE_BYTES })
        .build({
          // Si el campo "photo" no viene en el multipart, lanza BadRequestException.
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    photo: Express.Multer.File,
  ): Promise<Report> {
    return this.reportsService.create(createReportDto, photo);
  }

  @Get()
  async findAll(): Promise<Report[]> {
    return this.reportsService.findAll();
  }
}
