import {Injectable} from "@nestjs/common";
import {DatasourceService} from "../translator/datasource.service";

@Injectable()
export class TranslateUtil {
    constructor(
        private datasourceService: DatasourceService,
    ) {
    }
    translate(word: string, language: string, entity: any, updateValues: object, parameters: string[]): string {
        console.log(updateValues);
        // const data = this.datasourceService.getDataSource(language).getRepository(entity).createQueryBuilder().getMany();
        const entityPrimaryColumn = this.datasourceService.getDataSource(language).getRepository(entity).metadata.primaryColumns;
        const query = this.datasourceService
            .getDataSource(language)
            .getRepository(entity)
            .createQueryBuilder()
            .update()
            .set({
                ...updateValues,
                // BULK_UPDATED_DATE: () => 'SYSDATE',
            })
            .where(`${entityPrimaryColumn[0].propertyName} IN (${parameters.map((id) => `'${id}'`)})`)
            .getQueryAndParameters();

        console.log(query);
        return this.substituteParameters(query[0], query[1]);

        // const data = this.datasourceService.getDataSource(language).getRepository(entity).createQueryBuilder().getMany();
        // return this.convert(language, word);
    }

    substituteParameters(sql: string, parameters: any[]): string {
        if(/\$\d+/.test(sql)) {
            parameters.forEach((value, index) => {
                // Replace `$1`, `$2`, etc.
                const dollarPlaceholderRegex = new RegExp(`\\$${index + 1}`, 'g');
                sql = sql.replace(dollarPlaceholderRegex,TranslateUtil.formatValue(value));
            });
        } else {
            // Replace all ? placeholders
            let paramIndex = 0;
            sql = sql.replace(/\?/g, () => {
                if (paramIndex < parameters.length) {
                    return TranslateUtil.formatValue(parameters[paramIndex++]);
                }
                return '?'; // in case there are more placeholders than parameters
            });
        }

        return sql;
    }

    static formatValue(value: any): string {
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        } else if (typeof value === 'number') {
            return `${value}`;
        } else if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        } else if (value === null || value === undefined) {
            return 'NULL';
        }

        return `'${String(value).replace(/'/g, "''")}'`; // Escape single quotes for other types
    }

    getLanguage() {

    }

    convert(language, word) {
        switch (language) {
            case 'us':
                return 'This is US';
                break;
            case 'rus':
                return 'This is Russian';
                break;
        }
    }
}