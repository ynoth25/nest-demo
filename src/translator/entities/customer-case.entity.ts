import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';

@Entity({ name: 'CUSTOMER_CASE'})
export class CustomerCaseEntity {
  @PrimaryGeneratedColumn()
  CUSTOMER_CASE_ID: string;

  @Column()
  CUSTOMER_CASE_STATUS_CODE: string;

  @Field()
  @Column()
  @Transform(({ value }) => (value ? value.toString('hex').toUpperCase() : value), {
    toPlainOnly: true,
  })
  CUSTOMER_ID: string;

  @Field()
  @Column()
  @Transform(({ value }) => (value ? value.toString('hex').toUpperCase() : value), {
    toPlainOnly: true,
  })
  ASSET_ID: string;

  @Field()
  @Column()
  @Transform(({ value }) => (value ? value.toString('hex').toUpperCase() : value), {
    toPlainOnly: true,
  })
  AGREEMENT_ID: string;

  @Field()
  @Column()
  @Transform(({ value }) => (value ? value.toString('hex').toUpperCase() : value), {
    toPlainOnly: true,
  })
  CLIENT_ACCOUNT_ID: string;

  @Field()
  @Column()
  CUSTOMER_CASE_NBR: string;

  @Field()
  @Column()
  CUSTOMER_CASE_START_DATE: Date;

  @Field()
  @Column()
  CUSTOMER_CASE_END_DATE: Date;

  @Field()
  @Column()
  CREATED_SYSTEM_ID: number;

  @Field()
  @Column()
  CANCELLATION_REASON_CODE: string;

  @Field()
  @Column()
  INCIDENT_TYPE_CODE: string;

  @Field()
  @Column()
  WARRANTY_TYPE_CODE: string;

  @Field()
  @Column()
  ACTIVE_IND: string;

  @Field()
  @Column()
  ORIGINAL_INCIDENT_DATE: Date;

  @Field()
  @Column()
  ORIGINAL_COVERED_EVENT_CODE: string;

  @Field()
  @Column()
  @Transform(({ value }) => (value ? value.toString('hex').toUpperCase() : value), {
    toPlainOnly: true,
  })
  UNDERWRITER_ID: string;

  @Field()
  @Column()
  INVOICE_ACCOUNT_NBR: string;

  @Field()
  @Column()
  COVERED_CLAIM_OVERRIDE_IND: string;

  @Field()
  @Column()
  EXTERNAL_REFERENCE_ID: string;

  @Field()
  @Column()
  BULK_UPDATED_BY: string;

  @Field()
  @Column({ type: 'date' })
  BULK_UPDATED_DATE: Date;
}
