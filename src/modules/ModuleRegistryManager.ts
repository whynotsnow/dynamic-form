import type { FieldModule, ModuleRegistryRegisterOptions } from './types';

export class ModuleRegistryManager {
  private registry = new Map<string, FieldModule>();

  constructor(modules?: FieldModule[]) {
    modules?.forEach((module) => this.register(module));
  }

  register(module: FieldModule, options: ModuleRegistryRegisterOptions = {}): void {
    if (!module.type) {
      throw new Error('ModuleRegistryManager.register: module.type is required.');
    }

    if (this.registry.has(module.type) && !options.override) {
      throw new Error(
        `ModuleRegistryManager.register: module type "${module.type}" is already registered.`
      );
    }

    this.registry.set(module.type, module);
  }

  unregister(type: string): boolean {
    return this.registry.delete(type);
  }

  get(type: string): FieldModule | undefined {
    return this.registry.get(type);
  }

  has(type: string): boolean {
    return this.registry.has(type);
  }

  list(): FieldModule[] {
    return Array.from(this.registry.values());
  }
}

export const defaultModuleRegistry = new ModuleRegistryManager();
