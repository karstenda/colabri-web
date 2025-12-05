# i18n Setup

This folder contains the internationalization (i18n) configuration for the application using react-i18next.

## Supported Languages

- **English (en)** - Default/Fallback language
- **Dutch (nl)**
- **French (fr)**
- **German (de)**

All languages fall back to English if a translation is missing.

## Usage

### 1. Initialize i18n in your app

Import the i18n config in your main entry point (e.g., `main.tsx`):

```tsx
import './i18n';
```

### 2. Use translations in components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.save')}</h1>
      <p>{t('validation.minLength', { count: 5 })}</p>
    </div>
  );
}
```

### 3. Change language

```tsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="nl">Nederlands</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
    </select>
  );
}
```

## File Structure

```
i18n/
├── config.ts              # Main i18n configuration
├── index.ts              # Export barrel file
├── i18next.d.ts          # TypeScript type definitions
├── README.md             # This file
└── locales/
    ├── en/
    │   └── translation.json
    ├── nl/
    │   └── translation.json
    ├── fr/
    │   └── translation.json
    └── de/
        └── translation.json
```

## Features

- ✅ Type-safe translations with TypeScript
- ✅ Automatic language detection from browser/localStorage
- ✅ English fallback for missing translations
- ✅ React Suspense support
- ✅ Interpolation support (e.g., `{{count}}`)

## Adding New Translations

1. Add the key to `locales/en/translation.json` first
2. Add the same key to all other language files
3. TypeScript will ensure type safety across all translations
