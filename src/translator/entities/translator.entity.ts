import {Column, PrimaryGeneratedColumn} from "typeorm";

export class TranslatorEntity {
    @PrimaryGeneratedColumn()
    TRANSLATION_IDS: string;

    @Column()
    TRANSLATION_NAME: string;
}
