import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type ReportSeverity = 'low' | 'medium' | 'high';

@Entity('WATER_REPORT')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 10 })
  severity: ReportSeverity;

  @Column({ name: 'reporter_phone', type: 'varchar', length: 20 })
  reporterPhone: string;

  @Column({ name: 'is_resolved', type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ name: 'photo_url', type: 'varchar', length: 1000 })
  photoUrl: string;

  // URL de la foto de la reparacion ya finalizada. Ningun endpoint la
  // establece todavia (queda para un flujo futuro); se incluye en la
  // respuesta de GET /reports como null hasta entonces.
  @Column({
    name: 'repair_photo_url',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  repairPhotoUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
