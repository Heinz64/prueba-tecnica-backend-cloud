import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * Cliente singleton de DynamoDB (SDK v3, modular).
 * BUENAS_PRACTICAS.md — reemplaza el aws-sdk v2 (EOL) inicial del scaffold.
 */
const baseClient = new DynamoDBClient({});

export const dynamoDocClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE ?? '';
