# Module Architecture

This document describes the modular architecture of VoiceExecAI, enabling clean separation between core features and the SEO automation module.

## Folder Structure

```
src/
├── modules/
│   ├── voiceexec/          # Core sales CRM & voice features
│   │   ├── components/     # VoiceExec-specific UI
│   │   ├── pages/          # VoiceExec pages
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # VoiceExec utilities
│   ├── seo/                # SEO automation (extractable module)
│   │   ├── components/     # SEO UI components
│   │   ├── pages/          # SEO pages
│   │   ├── hooks/          # SEO hooks
│   │   ├── utils/          # SEO utilities
│   │   └── api/            # SEO API wrappers
│   └── shared/             # Shared across modules
│       ├── components/     # Common UI (NavBar, layouts)
│       ├── hooks/          # Shared hooks (auth, etc.)
│       └── utils/          # Common utilities
├── pages/                  # Legacy pages (to be migrated)
└── components/             # Legacy components (to be migrated)

base44/
├── entities/
│   ├── voiceexec/          # VoiceExec entities (Deal, Prospect, etc.)
│   └── seo/                # SEO entities (Website, KeywordTracker, etc.)
└── functions/
    ├── voiceexec/          # VoiceExec functions
    └── seo/                # SEO functions
```

## Module Boundaries

### SEO Module Dependencies
- ✅ Can use: shared components, hooks, utils
- ✅ Can use: Base44 SDK directly
- ❌ Cannot use: voiceexec module code
- ✅ External APIs: SEO-specific functions only

### VoiceExec Module Dependencies
- ✅ Can use: shared components, hooks, utils
- ✅ Can use: Base44 SDK directly
- ❌ Cannot use: seo module code
- ✅ External APIs: VoiceExec-specific functions only

## Extraction Path (SEO → Standalone App)

When ready to extract SEO module:

1. **Copy to new Base44 app:**
   - `src/modules/seo/` → `src/`
   - `base44/entities/seo/*` → `base44/entities/`
   - `base44/functions/seo/*` → `base44/functions/`

2. **Update imports:**
   - Change `@/modules/shared/` → `@/`
   - Remove any voiceexec references

3. **Update router:**
   - Copy SEO routes to new app's `src/App.jsx`

4. **Update branding:**
   - Change logo, colors, app name in `index.html`

## Current Status

- [x] Architecture defined
- [ ] SEO module structure created
- [ ] VoiceExec module structure created
- [ ] Shared components identified
- [ ] Migration in progress