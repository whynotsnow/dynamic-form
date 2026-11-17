import shared from './shared.json';
import customComponents from './demos/customComponents.json';
import customHandlers from './demos/customHandlers.json';
import compilerFoundation from './demos/compilerFoundation.json';
import formValidation from './demos/formValidation.json';
import headlessRenderer from './demos/headlessRenderer.json';
import nodeModel4 from './demos/nodeModel4.json';
import renderExtension from './demos/renderExtension.json';
import storeBoundary from './demos/storeBoundary.json';
import uiConfig from './demos/uiConfig.json';
import sampleValues from './data/shared.json';
import customHandlersSpecial from './special/customHandlers.json';
import uiConfigSpecial from './special/uiConfig.json';

export const demoMessages = {
  ...shared,
  ...customComponents,
  ...customHandlers,
  ...compilerFoundation,
  ...formValidation,
  ...headlessRenderer,
  ...nodeModel4,
  ...renderExtension,
  ...storeBoundary,
  ...uiConfig,
  ...customHandlersSpecial.messages,
  ...uiConfigSpecial.messages,
  ...uiConfigSpecial.priorityMessages
} as Record<string, string>;

export const demoSampleValues = sampleValues as Record<string, string>;
