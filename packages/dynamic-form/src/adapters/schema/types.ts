import type { BaseFieldConfig } from '../../shared/types';
import type { GroupModuleConfig, ModuleConfig, ModuleFormConfig } from '../../compiler';
import type { DeclarativeRule } from '../../rules';

export interface SchemaAdapterOptions {
  schemaName?: string;
}

export interface SchemaAdapterFieldMetadata {
  module?: string;
  groupId?: string;
  options?: Record<string, unknown>;
  rules?: DeclarativeRule[];
  overrides?: Partial<BaseFieldConfig>;
}

export interface SchemaGroupConfig extends Omit<GroupModuleConfig, 'effect'> {
  effect?: never;
}

export interface SchemaFormMetadata {
  groups?: SchemaGroupConfig[];
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
  'x-dynamic-form'?: SchemaFormMetadata;
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
  groupId?: string;
  options?: Record<string, unknown>;
  rules?: DeclarativeRule[];
  overrides?: Partial<BaseFieldConfig>;
}

export interface MetadataAdapterInput {
  id?: string | number;
  fields: MetadataAdapterField[];
  groups?: GroupModuleConfig[];
}

export type SchemaModuleConfigFactory = (
  id: string,
  moduleType: string,
  options?: Record<string, unknown>,
  metadata?: SchemaAdapterFieldMetadata
) => ModuleConfig;

export type SchemaModuleFormConfig = ModuleFormConfig;
