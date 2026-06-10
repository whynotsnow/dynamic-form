import type { BaseFieldConfig } from '../../shared/types';
import type { ModuleConfig } from '../../compiler';
import type { DeclarativeRule } from '../../rules';

export interface SchemaAdapterOptions {
  schemaName?: string;
}

export interface SchemaAdapterFieldMetadata {
  module?: string;
  options?: Record<string, unknown>;
  rules?: DeclarativeRule[];
  overrides?: Partial<BaseFieldConfig>;
}

export interface JsonSchemaProperty {
  type?: string;
  title?: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
  format?: string;
  properties?: Record<string, JsonSchemaProperty>;
  items?: JsonSchemaProperty;
  metadata?: SchemaAdapterFieldMetadata;
  'x-dynamic-form'?: SchemaAdapterFieldMetadata;
}

export interface JsonSchemaAdapterInput {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface OpenApiAdapterInput {
  openapi?: string;
  components?: {
    schemas?: Record<string, JsonSchemaAdapterInput>;
  };
}

export interface MetadataAdapterField {
  id: string;
  type: string;
  options?: Record<string, unknown>;
  rules?: DeclarativeRule[];
  overrides?: Partial<BaseFieldConfig>;
}

export interface MetadataAdapterInput {
  fields: MetadataAdapterField[];
}

export type SchemaModuleConfigFactory = (
  id: string,
  moduleType: string,
  options?: Record<string, unknown>,
  metadata?: SchemaAdapterFieldMetadata
) => ModuleConfig;
