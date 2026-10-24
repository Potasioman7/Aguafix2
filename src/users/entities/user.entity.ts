import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('SYSTEM_USER')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'is_notification_enabled', type: 'boolean', default: true })
  isNotificationEnabled: boolean;
}
