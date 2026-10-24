import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReportSeverity } from '../entities/report.entity';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty({ message: 'La direccion es obligatoria' })
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  @MaxLength(500)
  description: string;

  @IsIn(['low', 'medium', 'high'], {
    message: 'severity debe ser uno de los siguientes valores: low, medium, high',
  })
  severity: ReportSeverity;

  @IsString()
  @IsNotEmpty({ message: 'El telefono de contacto es obligatorio' })
  @MaxLength(20)
  reporterPhone: string;
}
