import type { ModuleConfig } from '../compiler';
import type {
  AdapterContext,
  AdapterRegistryRegisterOptions,
  AdapterResolveOptions,
  ModuleConfigAdapter
} from './types';
import { ModuleConfigPassthroughAdapter } from './ModuleConfigPassthroughAdapter';
import { JsonSchemaAdapter, MetadataAdapter, OpenApiAdapter } from './schema';

function describeInput(input: unknown) {
  if (Array.isArray(input)) {
    return `array(${input.length})`;
  }

  if (input === null) {
    return 'null';
  }

  return typeof input;
}

export class AdapterRegistryManager {
  private registry = new Map<string, ModuleConfigAdapter>();

  constructor(adapters?: ModuleConfigAdapter[]) {
    adapters?.forEach((adapter) => this.register(adapter));
  }

  register(adapter: ModuleConfigAdapter, options: AdapterRegistryRegisterOptions = {}): void {
    if (!adapter.type) {
      throw new Error('AdapterRegistryManager.register: adapter.type is required.');
    }

    if (this.registry.has(adapter.type) && !options.override) {
      throw new Error(
        `AdapterRegistryManager.register: adapter type "${adapter.type}" is already registered.`
      );
    }

    this.registry.set(adapter.type, adapter);
  }

  unregister(type: string): boolean {
    return this.registry.delete(type);
  }

  get(type: string): ModuleConfigAdapter | undefined {
    return this.registry.get(type);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  list(): ModuleConfigAdapter[] {
    return Array.from(this.registry.values());
  }

  resolve(input: unknown, options: AdapterResolveOptions = {}): ModuleConfigAdapter {
    const context: AdapterContext = options.context || {};

    if (options.adapterType) {
      const adapter = this.get(options.adapterType);

      if (!adapter) {
        throw new Error(
          `AdapterRegistryManager.resolve: adapter type "${options.adapterType}" is not registered.`
        );
      }

      if (!adapter.supports(input, context)) {
        throw new Error(
          `AdapterRegistryManager.resolve: adapter type "${options.adapterType}" does not support input ${describeInput(
            input
          )}.`
        );
      }

      return adapter;
    }

    const adapter = this.list().find((candidate) => candidate.supports(input, context));

    if (!adapter) {
      throw new Error(
        `AdapterRegistryManager.resolve: no adapter supports input ${describeInput(input)}.`
      );
    }

    return adapter;
  }
}

export const defaultAdapterRegistry = new AdapterRegistryManager([
  ModuleConfigPassthroughAdapter,
  // Schema adapters 放在 passthrough 之后，保持现有 ModuleConfig[] 优先兼容。
  JsonSchemaAdapter,
  OpenApiAdapter,
  MetadataAdapter
]);

export function adaptWithRegistry(
  input: unknown,
  registry: AdapterRegistryManager,
  options: AdapterResolveOptions = {}
): ModuleConfig[] {
  const context = options.context || {};
  const adapter = registry.resolve(input, { ...options, context });

  return adapter.adapt(input as never, context);
}
