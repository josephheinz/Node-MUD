# Programming Guidelines

## Naming Conventions:
- `variables`: camelCase
- `types`: PascalCase
- `classes`: PascalCase
- `interfaces`: PascalCase - prefixed with an 'I', e.g., IPascalCase
- `functions`: camelCase

## Functions
- Each function must do **one** thing
- Functions can return `void`
- Functions must generally never return `nullish` values
- Functions must have a unique name across the project

## Folder Guidelines:
- ### `src/lib/types`:
    - Only `class`, `type`, and `interface` declarations can appear in this folder, all helper functions must be declared in `src/lib/utils`
- ### `src/lib/utils`:
    - Only helper functions, no `class`, `type`, or `interface` declarations can appear in this folder