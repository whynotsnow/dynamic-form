# Project Notes for Future Agents

Last reviewed: 2026-06-01

## Project Overview

This repository is a React + TypeScript dynamic form library named `@whynotsnow/dynamic-form`.
It renders Ant Design forms from configuration and delegates dependency/effect execution to
`form-chain-effect-engine`.

The library is intended to support:

- flat and grouped form configuration
- field dependency chains through `dependents` + `effect`
- custom field components through `componentRegistry`
- custom effect result handlers through `useInitHandlers`
- render extension hooks such as `renderFormInner`, `renderGroups`, `renderGroupItem`,
  `renderFields`, and `renderFieldItem`
- bidirectional synchronization between Ant Design Form state and internal reducer state
- a Runtime Layer that resolves render/submit/edit/validate capabilities from reducer state

## Tech Stack

- React, TypeScript, ES modules
- Ant Design as the UI peer dependency
- `form-chain-effect-engine` for effect chain execution
- `immer` for reducer updates
- Vite for local demo development
- tsup for library builds
- ESLint + Prettier + Husky/lint-staged
- npm lockfile is present; use npm unless the user asks otherwise

## Important Commands

- `npm run start`: run the Vite demo server on port 3000
- `npm run build`: build the package with tsup into `dist`
- `npm run type-check`: run TypeScript checks
- `npm run lint:check`: run ESLint without fixes
- `npm run lint`: run ESLint with fixes
- `npm run format`: format `src` and `demos`

Do not run dependency installation or global tool installation without explaining why first.

## Directory Map

- `src/`: library source, organized by Config / State / Runtime / Consumer / Shared layers
- `src/exports.ts`: package public export surface; tsup entry point
- `src/index.tsx`: `DynamicForm` component that composes engine layer and UI layer
- `src/shared/types.ts`: core public and internal types
- `src/consumer/provider/DynamicFormProvider.tsx`: provider layer; initializes store, effect engine,
  context, initialization warning, and effect result handling
- `src/consumer/render/FormContent.tsx`: rendering layer; owns Ant Design `Form`, value change handling,
  submit handling, default rendering, and render extension hooks
- `src/runtime/`: Runtime Layer. It resolves `FormState` into `RuntimeState` via
  `resolveRuntimeState()` and exposes selectors/resolvers for field and group capabilities.
- `src/state/reducer.ts`: Immer reducer for field values, field/group meta, batched updates, and dynamic UI config
- `src/state/useStoreInit.ts`: initializes reducer state and synchronizes initial values into AntD Form
- `src/config/processor/`: converts user config into `effectMap`, `fieldRegistry`, initial values,
  initialized fields, and initialized groups
- `src/config/defaultConfig.ts`: exported default config helper
- `src/consumer/effects/`: applies effect/initialValue return objects through registered handlers
- `src/consumer/hooks/`: consumer hooks for submit/change events, field participation, and handler initialization
- `src/consumer/render/componentRegistry.tsx`: built-in Ant Design field components and component registry manager
- `src/consumer/render/FieldComponentRenderer.tsx`: renders a configured field via the registry
- `src/shared/context/`: form chain React context access
- `src/shared/utils/`: path/deep utilities and initialization checks
- `demos/`: Vite demos for usage, custom handlers, custom components, UI config, sync tests, and render extensions
- `tests/`: script-style test/demo data, not a conventional test runner setup
- `docs/`: architecture, data flow, field types, config, effects, batch updates, and quick reference docs
- `dist/`: generated build output; reproducible artifact

## Public API Shape

Public exports are defined in `src/exports.ts`:

- `DynamicForm`
- `DynamicFormProvider`
- `FormChainEffectEngineWrapper` (backward-compatible export alias)
- key types: `DynamicFormProps`, `FormConfig`, `BaseFieldConfig`,
  `FieldComponentProps`, `ComponentRegistry`, `ComponentRegistryConfig`
- `ComponentRegistryManager`, `DefaultRegistryFieldComponents`
- hooks: `useFormChainContext`, `useStoreInit`, `useInitHandlers`
- `getDefaultConfig`

`DynamicFormProps` combines:

- engine props: `formConfig`, `form`, optional `values`, `uiConfig`,
  `enableInitializationCheck`, `checkDelay`
- UI props: optional `onSubmit`, `submitButtonText`, `componentRegistry`,
  and render extension callbacks

## Core Data Flow

1. `DynamicForm` splits props into engine props and UI props.
2. `DynamicFormProvider` calls `useStoreInit`.
3. `useStoreInit` processes `formConfig` with `processFormConfig`, merges initial values with `values`,
   creates reducer state, and dispatches `INIT` once.
4. `FormContent` renders Ant Design `Form` from reducer state.
5. User input triggers Ant Design `onValuesChange`.
6. `FormContent` computes a single `runtimeState` from reducer state with `useRuntimeState(state)`.
7. `useFormRuntimeEvents` handles submit/change events using that same Runtime snapshot:
   - changed-field validation is filtered by `runtimeState.fields[id].validatable`
   - submit validation is filtered to currently validatable fields
   - effect engine `onValuesChange(changedValues)` is still called after local runtime validation scheduling
8. `useFieldParticipation` consumes the same `runtimeState` and clears/restores values based on
   `submitable`, so hidden/group-hidden fields do not need to recalculate capability independently.
9. `form-chain-effect-engine` executes dependent field effects from `effectMap`.
10. `applyEffectResult` applies value/meta/UI updates through built-in or custom handlers.

## Runtime Layer

The Runtime Layer is the current migration direction:

```text
FormState
  -> resolveRuntimeState()
  -> RuntimeState
       -> FormContent
       -> useFieldParticipation
       -> validation
       -> future plugins
```

Runtime capabilities are the intended source of truth for UI participation decisions:

- `rendered`: field/group should be rendered. Field rendering also respects group visibility.
- `submitable`: field participates in submitted form data. Current policy follows `rendered`.
- `disabled`: derived from field behavior meta.
- `readonly`: derived from field behavior meta.
- `editable`: `rendered && !disabled && !readonly`.
- `validatable`: current policy is `rendered && !disabled`; readonly fields still validate.

Important implementation constraints:

- Compute Runtime once per state snapshot in `FormContent` with `useRuntimeState(state)`.
- Pass the same `runtimeState` into consumers instead of calling `resolveFieldCapability()` repeatedly.
- `useFieldParticipation` must not independently resolve capabilities; it should consume Runtime.
- Runtime resolvers should read field/group behavior through helpers such as `getFieldBehaviorMeta`
  and `getGroupBehaviorMeta`, not by directly reading legacy flat meta keys.
- Validation must not call `form.validateFields(Object.keys(changedValues))` directly, because that
  ignores hidden fields, disabled fields, readonly policy, and group-hidden fields.
- Default field rendering passes `runtimeCapability` into `FieldComponentRenderer`, which suppresses
  Form.Item rules when `validatable` is false and maps runtime `disabled`/`readonly` to component props.

## Meta Boundaries

`FieldMeta` is split by responsibility:

- `meta.behavior`: behavior state consumed by Runtime, currently `visible`, `disabled`, and `readonly`.
- `meta.formItemProps`: render-layer dynamic props for Ant Design `Form.Item`.
- `meta.componentProps`: render-layer dynamic props for the inner field component.

Legacy flat keys are still accepted for compatibility:

```ts
{ visible: false, disabled: true, readonly: true }
```

Reducers and initialization helpers normalize those flat keys into:

```ts
{ behavior: { visible: false, disabled: true, readonly: true } }
```

Default effect handlers should write behavior updates as `meta.behavior`. Do not put render-only
configuration into Runtime; `formItemProps` and `componentProps` remain render-layer metadata.

## Configuration Model

Two config shapes are supported:

- flat: `{ fields: BaseFieldConfig[] }`
- grouped: `{ groups: GroupField[] }`

Field essentials:

- `id`: field key, also used by form values and registry lookup
- `component`: built-in or custom component name
- `label`, `required`, `rules`, `span`, `style`
- `initialValue`: static value or function based on computed initial values
- `initialVisible`, `initialDisabled`
- `dependents`: dependencies watched by the effect engine
- `effect`: effect function from `form-chain-effect-engine`
- `formItemProps`, `componentProps`

Grouped config supports group-level `id`, `title`, `initialVisible`, `dependents`, `effect`, and `fields`.

## Effect Result Handling

Effects and function-style `initialValue` can return objects. `applyEffectResult` routes each returned key
to registered handlers from `src/consumer/effects/handlerRegistry.ts`.

Known update categories include:

- field values
- field behavior meta such as visibility/disabled/readonly
- field render meta such as component/form item props
- group behavior/meta
- dynamic UI config
- custom handler-specific result keys

For effect-related changes, inspect `src/consumer/effects/types.ts`, `handlerRegistry.ts`,
`applyEffectResult.ts`, and `effectResultContext.ts` together. Avoid adding one-off handling in components
if it belongs in effect result handling.

## Rendering Model

`FormContent` provides default rendering but exposes layered render extension hooks:

- `renderFieldItem`: customize one field item while receiving `defaultRender`
- `renderFields`: customize a field list
- `renderGroupItem`: customize one group
- `renderGroups`: customize group collection
- `renderFormInner`: customize the full form body and submit area

Default layout uses Ant Design:

- `Form`
- `Row`
- `Col`
- `Card` for groups
- `Button` for submit

Default UI config comes from `useStoreInit`:

- `rowProps: { gutter: [16, 0] }`
- `colProps: { span: 8 }`
- empty form/button/card/submit/formItem props

## Built-In Field Components

Defined in `src/consumer/render/componentRegistry.tsx`:

- `Password`
- `ConfirmPassword`
- `TextInput`
- `NumberInput`
- `SelectField`
- `DatePicker`
- `Switch`
- `Rate`
- `TextDisplay`
- `CheckboxGroup`
- `Select`
- `TextArea`

Custom components are passed via:

```tsx
componentRegistry={{
  customComponents: {
    CustomField: CustomFieldComponent
  },
  allowOverride: false
}}
```

By default, custom components do not override built-ins unless `allowOverride` is true.

## Documentation System

The documentation was rebuilt on 2026-06-01. The current docs are intentionally smaller and topic-based:

- `README.md`: public project overview, feature summary, install/basic usage, design principles, and doc index.
- `docs/README.md`: documentation entry point and reading order.
- `docs/ARCHITECTURE.md`: Config / State / Runtime / Consumer / Shared architecture and data flow.
- `docs/configuration.md`: flat/grouped config, field/group options, UI config, built-in components.
- `docs/effects-and-handlers.md`: dependency effects, default result keys, initialization contract, custom handlers.
- `docs/rendering-and-ui.md`: default rendering, component registry, render hooks, UI extension guidance.
- `docs/runtime-layer.md`: runtime capability model and validation/participation policy.
- `docs/development.md`: component usage guide with scenario-based config examples, demo links, custom components, and custom effect handlers.
- `docs/maintenance.md`: commands, demos, verification, build notes, implementation guardrails, and documentation maintenance rules.

Do not recreate the old document set unless the user explicitly asks. When project behavior changes, update the
nearest topic doc and then update the root `README.md` only if public-facing summaries or links change.

Documentation language structure:

- Project docs should be bilingual with the complete Chinese document first and the English translation below it.
- This bilingual rule applies to all project documentation files, including directory-level README files such as `demos/README.md`.
- Do not use a short explanatory note as a substitute for the full Chinese document.
- Keep API names, package names, file paths, and established technical terms in English when clearer.
- A small amount of emoji is acceptable in headings or summary bullets when it improves scanning.

## Current Demo Coverage

The active demo selector in `demos/DemoSelector.tsx` exposes:

- `storeBoundary`
- `customHandlers`
- `customComponents`
- `formValidation`
- `uiConfig`
- `renderExtension`

Do not rely on older demo names from stale docs unless the files actually exist.

## Implementation Notes and Risks

- Keep changes small and aligned with existing architecture.
- Do not rewrite the whole form pipeline for a narrow behavior fix.
- The internal reducer state is split into `fields`, `groupFields`, `configProcessInfo`, `initialized`,
  and `dynamicUIConfig`. Ant Design Form owns runtime values, errors, touched state, warnings, and validating state.
- Field lookup must respect `configProcessInfo.fieldRegistry`, because fields may be flat or inside groups.
- `UPDATE_META` needs to update either `fields` or `groupFields[groupId].fields`
  depending on registry metadata, and should use `mergeFieldMetaPatch` so legacy flat behavior keys
  are normalized.
- `SET_GROUP_META` should use `mergeGroupMetaPatch` for the same compatibility reason.
- Runtime validation currently lives in `useFormRuntimeEvents`; keep it filtered by runtime capability.
- Runtime is taking over validation and participation. Avoid reintroducing direct changed-key validation
  without filtering through `runtimeState.fields[fieldId].validatable`.
- `FieldComponentRenderer` is where default component-level runtime props are applied. Custom render
  hooks can bypass this, so changes to render extension behavior should be deliberate.
- `enableInitializationCheck` warns if `useInitHandlers` was not called; do not remove this unless the
  initialization contract changes.
- Some docs may display garbled text in default PowerShell output; read Chinese markdown with explicit UTF-8.

## Verification Guidance

For source changes, prefer:

1. `npm run type-check`
2. `npm run lint:check`
3. `npm run build`
4. For UI/render behavior, run `npm run start` and inspect demos at `http://localhost:3000`

The `test` script runs Node tests under `tests/**/*.test.mjs`; do not claim automated tests passed unless
the relevant command was actually run.
