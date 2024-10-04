import { Injectable, BadRequestException } from "@nestjs/common";
import * as sqlFormatter from 'sql-formatter';

// Entity metadata object
export const EntityMetadata: Record<string, { schema: string, tableName: string, primaryIdColumn: string }> = {
    CustomerCaseEntity: {
        schema: 'CUSTOMER',
        tableName: 'CUSTOMER_CASE',
        primaryIdColumn: 'CUSTOMER_CASE_ID',
    },
    ServiceRequestEntity: {
        schema: 'CUSTOMER',
        tableName: 'SERVICE_REQUEST',
        primaryIdColumn: 'SERVICE_REQUEST_ID',
    },
    ServiceOrderEntity: {
        schema: 'CUSTOMER',
        tableName: 'SERVICE_ORDER',
        primaryIdColumn: 'SERVICE_ORDER_ID',
    },
    ServiceOrderLineEntity: {
        schema: 'CUSTOMER',
        tableName: 'SERVICE_ORDER_LINE',
        primaryIdColumn: 'SERVICE_ORDER_LINE_ID',
    },
    ChargeOrderEntity: {
        schema: 'CUSTOMER',
        tableName: 'CHARGE_ORDER',
        primaryIdColumn: 'CHARGE_ORDER_ID',
    },
    ChargeOrderLinesEntity: {
        schema: 'CUSTOMER',
        tableName: 'CHARGE_ORDER_LINE',
        primaryIdColumn: 'CHARGE_ORDER_LINE_ID',
    },
    ShippingOrderEntity: {
        schema: 'CUSTOMER',
        tableName: 'SHIPPING_ORDER',
        primaryIdColumn: 'SHIPPING_ORDER_ID',
    },
    // Add more entities as needed
};

@Injectable()
export class TranslateUtil {
    constructor() {}

    generateScript(entity: string, updateValues: object, originalValues: object, parameters: string[]) {
        const rolloutScript: string = this.translate(entity, updateValues, parameters);
        const rollbackScript: string = this.translate(entity, originalValues, parameters);

        return {
            rolloutScript,
            rollbackScript,
        };
    }

    translate(entity: string, updateValues: Record<string, any>, parameters: string[]): string {
        const entityMetadata = EntityMetadata[entity];

        if (!entityMetadata) {
            throw new BadRequestException(`Entity ${entity} is not defined.`);
        }
        if (!updateValues || Object.keys(updateValues).length === 0) {
            throw new BadRequestException('Update values are missing or invalid.');
        }
        if (!parameters || parameters.length === 0) {
            throw new BadRequestException('No parameters provided for the WHERE clause.');
        }

        const updateClause = this.buildUpdateClause(updateValues);

        const query = `
            UPDATE ${entityMetadata.schema}.${entityMetadata.tableName}
            SET ${updateClause}, BULK_UPDATED_DATE = SYSDATE
            WHERE ${entityMetadata.primaryIdColumn} IN (${parameters.map(id => `'${id}'`).join(', ')});
        `;

        return query.replace(/\s\s+/g, ' ').trim();
    }

    // Helper function to build the SET clause
    buildUpdateClause(updateValues: Record<string, any>): string {
        return Object.entries(updateValues)
            .map(([key, value]) => `${key} = ${this.formatValue(value)}`)
            .join(', ');
    }

    // Helper function for formatting the SQL
    formatSql(query: string): string {
        return sqlFormatter.format(query, {
            keywordCase: 'upper',
            language: 'sql',
            linesBetweenQueries: 2,
            logicalOperatorNewline: 'before',
            tabWidth: 4,
        });
    }

    // Format values for SQL insertion
    formatValue(value: any): string {
        if (typeof value === 'string' && value !== 'SYSDATE') {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            return `${value}`;
        } else if (value instanceof Date) {
            return `'${value.toISOString()}'`; // Format date to ISO string
        } else if (value === null || value === undefined) {
            return 'NULL';
        }

        return `'${String(value).replace(/'/g, "''")}'`; // Default string escape
    }

    combineUpdateQueries(queries) {
        // Initialize an object to store grouped table_IDs by schema, table, set clause, and where clause column
        const schemaTableSetWhereGroups = {};

        // Loop through each query to extract the schema, table, set clause, where clause column, and table_IDs
        queries.forEach((query) => {
            const schemaTableMatch = query.match(/UPDATE\s+(\w+\.\w+)/);
            const setClauseMatch = query.match(/SET\s+([\s\S]+?)\s*WHERE/);
            const whereClauseMatch = query.match(/WHERE\s+(\w+)\s+IN\s*\((.*?)\)/);

            if (
                schemaTableMatch &&
                schemaTableMatch[1] &&
                setClauseMatch &&
                setClauseMatch[1] &&
                whereClauseMatch &&
                whereClauseMatch[1] &&
                whereClauseMatch[2]
            ) {
                const schemaTable = schemaTableMatch[1];
                const setClause = setClauseMatch[1];
                const whereColumn = whereClauseMatch[1];
                const extractedIds = whereClauseMatch[2].match(/'(.*?)'/g).map((id) => id.replace(/'/g, ''));

                if (!schemaTableSetWhereGroups[schemaTable]) {
                    schemaTableSetWhereGroups[schemaTable] = {};
                }

                const setWhereKey = `${setClause}|${whereColumn}`;

                if (!schemaTableSetWhereGroups[schemaTable][setWhereKey]) {
                    schemaTableSetWhereGroups[schemaTable][setWhereKey] = new Set();
                }

                extractedIds.forEach((id) => schemaTableSetWhereGroups[schemaTable][setWhereKey].add(id));
            }
        });

        // Create the combined SQL queries
        const combinedQueries = [];

        for (const [schemaTable, setWhereGroups] of Object.entries(schemaTableSetWhereGroups)) {
            for (const [setWhereKey, idsSet] of Object.entries(setWhereGroups)) {
                const [setClause, whereColumn] = setWhereKey.split('|');
                const uniqueIds = Array.from(idsSet)
                    .map((id) => `'${id}'`)
                    .join(',');
                combinedQueries.push(`
                UPDATE ${schemaTable}
                SET
                    ${setClause}
                WHERE
                    ${whereColumn} IN (${uniqueIds});
            `);
            }
        }

        return combinedQueries.join('\n').trim();
    }
}
