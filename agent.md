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

- `src/`: library source
- `src/exports.ts`: package public export surface; tsup entry point
- `src/index.tsx`: `DynamicForm` component that composes engine layer and UI layer
- `src/types.ts`: core public and internal types
- `src/components/FormChainEffectEngineWrapper.tsx`: logic layer; initializes store, effect engine,
  context, initialization warning, and effect result handling
- `src/components/FormContent.tsx`: rendering layer; owns Ant Design `Form`, value change handling,
  submit handling, default rendering, and render extension hooks
- `src/runtime/`: Runtime Layer. It resolves `FormState` into `RuntimeState` via
  `resolveRuntimeState()` and exposes selectors/resolvers for field and group capabilities.
- `src/reducer.ts`: Immer reducer for field values, field/group meta, batched updates, and dynamic UI config
- `src/configProcessor/`: converts user config into `effectMap`, `fieldRegistry`, initial values,
  initialized fields, and initialized groups
- `src/resultProcessor/`: handles effect/initialValue return objects through registered handlers and
  supports batched updates
- `src/hooks/`: context access, store initialization, form/store synchronization, handler initialization
- `src/fieldComponentRegistry.tsx`: built-in Ant Design field components and component registry manager
- `src/fieldComponentRenderer.tsx`: renders a configured field via the registry
- `src/utils/`: logger, path/deep utilities, initialization checks
- `demos/`: Vite demos for usage, custom handlers, custom components, UI config, sync tests, and render extensions
- `tests/`: script-style test/demo data, not a conventional test runner setup
- `docs/`: architecture, data flow, field types, config, effects, batch updates, and quick reference docs
- `config/defaultConfig.ts`: exported default config helper
- `dist/`: generated build output; reproducible artifact

## Public API Shape

Public exports are defined in `src/exports.ts`:

- `DynamicForm`
- `FormChainEffectEngineWrapper`
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
2. `FormChainEffectEngineWrapper` calls `useStoreInit`.
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
10. `handleEffectResult` dispatches value/meta/UI updates through built-in or custom handlers.

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
- `disabled`: derived from `field.meta.disabled === true`.
- `readonly`: derived from `field.meta.readonly === true`.
- `editable`: `rendered && !disabled && !readonly`.
- `validatable`: current policy is `rendered && !disabled`; readonly fields still validate.

Important implementation constraints:

- Compute Runtime once per state snapshot in `FormContent` with `useRuntimeState(state)`.
- Pass the same `runtimeState` into consumers instead of calling `resolveFieldCapability()` repeatedly.
- `useFieldParticipation` must not independently resolve capabilities; it should consume Runtime.
- Validation must not call `form.validateFields(Object.keys(changedValues))` directly, because that
  ignores hidden fields, disabled fields, readonly policy, and group-hidden fields.
- Default field rendering passes `runtimeCapability` into `FieldComponentRenderer`, which suppresses
  Form.Item rules when `validatable` is false and maps runtime `disabled`/`readonly` to component props.

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

Effects and function-style `initialValue` can return objects. `handleEffectResult` routes each returned key
to registered handlers from `src/resultProcessor/handlers.ts`.

Known update categories include:

- field values
- field meta such as visibility and component/form item props
- group visibility/meta
- dynamic UI config
- custom handler-specific result keys

For effect-related changes, inspect `src/resultProcessor/types.ts`, `handlers.ts`, `batchUpdate.ts`, and
`core.ts` together. Avoid adding one-off handling in components if it belongs in result processors.

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

Defined in `src/fieldComponentRegistry.tsx`:

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

## Implementation Notes and Risks

- Keep changes small and aligned with existing architecture.
- Do not rewrite the whole form pipeline for a narrow behavior fix.
- The internal state is split into `fields`, `groupFields`, `fieldValues`, `configProcessInfo`,
  `initialized`, and `dynamicUIConfig`.
- Field lookup must respect `configProcessInfo.fieldRegistry`, because fields may be flat or inside groups.
- `UPDATE_META` and `BATCH_UPDATE` need to update either `fields` or `groupFields[groupId].fields`
  depending on registry metadata.
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

The `test` script currently only prints `No tests specified`; do not claim automated tests passed unless
the relevant command was actually run.
