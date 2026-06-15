import type { NamePath } from 'antd/es/form/interface';
import type {
  BaseFieldConfig,
  FieldAddress,
  FieldRegistry,
  FieldValue,
  FormValues
} from '../types';

type NamePathSegment = string | number;

export function normalizeFieldName(name: NamePath): NamePathSegment[] {
  return Array.isArray(name) ? [...name] : [name];
}

export function resolveFieldAddress(field: Pick<BaseFieldConfig, 'id' | 'name'>): FieldAddress {
  return {
    id: field.id,
    name: field.name ?? field.id
  };
}

export function getFieldName(field: Pick<BaseFieldConfig, 'id' | 'name'>): NamePath {
  return resolveFieldAddress(field).name;
}

export function serializeFieldName(name: NamePath): string {
  return JSON.stringify(normalizeFieldName(name));
}

export function getValueAtNamePath(values: unknown, name: NamePath): FieldValue {
  return normalizeFieldName(name).reduce<unknown>((current, segment) => {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<NamePathSegment, unknown>)[segment];
  }, values);
}

export function hasValueAtNamePath(values: unknown, name: NamePath): boolean {
  let current = values;

  for (const segment of normalizeFieldName(name)) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return false;
    }

    if (!Object.prototype.hasOwnProperty.call(current, segment)) {
      return false;
    }

    current = (current as Record<NamePathSegment, unknown>)[segment];
  }

  return true;
}

export function setValueAtNamePath(values: FormValues, name: NamePath, value: FieldValue): void {
  const segments = normalizeFieldName(name);
  let current: Record<NamePathSegment, unknown> = values;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
      return;
    }

    const nextSegment = segments[index + 1];
    const existing = current[segment];

    if (existing === null || typeof existing !== 'object') {
      current[segment] = typeof nextSegment === 'number' ? [] : {};
    }

    current = current[segment] as Record<NamePathSegment, unknown>;
  });
}

export function getChangedFieldIds(
  changedValues: FormValues,
  fieldAddressRegistry: Record<string, FieldAddress>
): string[] {
  return Object.values(fieldAddressRegistry)
    .filter((address) => hasValueAtNamePath(changedValues, address.name))
    .map((address) => address.id);
}

export function createFieldValueView(
  values: FormValues,
  fieldAddressRegistry: Record<string, FieldAddress>
): FormValues {
  const result: FormValues = { ...values };

  Object.values(fieldAddressRegistry).forEach((address) => {
    result[address.id] = getValueAtNamePath(values, address.name);
  });

  return result;
}

export function createFieldAddressRegistry(
  fieldRegistry: Record<string, FieldRegistry>
): Record<string, FieldAddress> {
  const result: Record<string, FieldAddress> = {};
  const idsByName = new Map<string, string>();

  Object.values(fieldRegistry).forEach((entry) => {
    const config = entry.config;

    if ('fields' in config) {
      return;
    }

    const address = resolveFieldAddress(config);
    if (normalizeFieldName(address.name).length === 0) {
      throw new Error(`createFieldAddressRegistry: field "${address.id}" has an empty name path.`);
    }
    const serializedName = serializeFieldName(address.name);
    const existingId = idsByName.get(serializedName);

    if (existingId) {
      throw new Error(
        `createFieldAddressRegistry: fields "${existingId}" and "${address.id}" use the same name path ${serializedName}.`
      );
    }

    idsByName.set(serializedName, address.id);
    result[address.id] = address;
  });

  return result;
}

export function mergeFormValues(base: FormValues, override: FormValues): FormValues {
  const result: FormValues = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    const baseValue = result[key];
    const canMerge =
      baseValue !== null &&
      value !== null &&
      typeof baseValue === 'object' &&
      typeof value === 'object' &&
      !Array.isArray(baseValue) &&
      !Array.isArray(value);

    result[key] = canMerge ? mergeFormValues(baseValue as FormValues, value as FormValues) : value;
  });

  return result;
}
