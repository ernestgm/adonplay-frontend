# Graph Report - frontend  (2026-11-07)

## Corpus Check
- 237 files · ~76,584 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .ico 2, .example 1)

## Summary
- 969 nodes · 3688 edges · 71 communities (43 shown, 28 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cf973162`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- route.ts
- YoutubeSourceForm.tsx
- SlideMediaForm.tsx
- UserForm.tsx
- MediaForm.tsx
- next
- package.json
- Changelog
- dependencies
- BusinessForm.tsx
- react
- compilerOptions
- SlidesSettingsPageContent.tsx
- SystemStatusPageContent.tsx
- MenuEditorForm.tsx
- UsersEditPageContent.tsx
- GridShape
- eslint.config.mjs
- I18nProvider.tsx
- MonitorDeviceView.tsx
- sw.js
- scripts
- videoTranscode.ts
- app/layout.tsx
- DevicesPageContent.tsx
- SlidesMediaCreatePageContent.tsx
- MarqueesForm.tsx
- .eslintrc.json
- QrCodeForm.tsx
- PageBreadcrumb
- apiGet
- DetailsMediaPageContent.tsx
- SchedulesPageContent.tsx
- UserForm.tsx
- MediaLibraryPageContent.tsx
- useT
- DevicesPermissionsPageContent.tsx
- SlidesMediaManagementPageContent.tsx
- EditMenuPageContent.tsx
- business/edit/[id]/layout.tsx
- generatePageMetadata
- marquees/edit/[id]/layout.tsx
- edit/[mid]/layout.tsx
- YoutubeSourcesCreatePageContent.tsx
- media-library/create/layout.tsx
- details/[mediaId]/layout.tsx
- DeviceForm.tsx
- BusinessEditPageContent.tsx
- business/create/layout.tsx
- QrCodesCreatePageContent.tsx
- [id]/create/layout.tsx
- details/[mid]/layout.tsx
- devices/edit/[id]/layout.tsx
- DevicesEditPageContent.tsx
- qrcodes/create/layout.tsx
- settings/[id]/layout.tsx
- marquees/create/layout.tsx
- qrcodes/edit/[id]/layout.tsx
- slides/create/layout.tsx
- Radio.tsx
- Alert.tsx
- users/edit/[id]/layout.tsx
- ModuleCard.tsx
- @fullcalendar/interaction
- middleware.ts
- @fullcalendar/timegrid

## God Nodes (most connected - your core abstractions)
1. `react` - 193 edges
2. `useT()` - 131 edges
3. `next` - 92 edges
4. `useError()` - 77 edges
5. `PageBreadcrumb()` - 75 edges
6. `generatePageMetadata()` - 70 edges
7. `Button()` - 63 edges
8. `Select()` - 45 edges
9. `apiGet()` - 41 edges
10. `ComponentCard()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `generatePageMetadata()`  [EXTRACTED]
  src/app/(admin)/(others-pages)/activate/page.tsx → src/i18n/metadata.ts
- `generateMetadata()` --calls--> `generatePageMetadata()`  [EXTRACTED]
  src/app/(admin)/(others-pages)/business/create/page.tsx → src/i18n/metadata.ts
- `generateMetadata()` --calls--> `generatePageMetadata()`  [EXTRACTED]
  src/app/(admin)/(others-pages)/business/edit/[id]/page.tsx → src/i18n/metadata.ts
- `generateMetadata()` --calls--> `generatePageMetadata()`  [EXTRACTED]
  src/app/(admin)/(others-pages)/business/page.tsx → src/i18n/metadata.ts
- `generateMetadata()` --calls--> `generatePageMetadata()`  [EXTRACTED]
  src/app/(admin)/(others-pages)/devices-permissions/page.tsx → src/i18n/metadata.ts

## Import Cycles
- None detected.

## Communities (71 total, 28 thin omitted)

### Community 0 - "route.ts"
Cohesion: 0.33
Nodes (8): downloadFileName(), dynamic, EXTRA_ALLOWED_HOSTS, GET(), parseBase(), resolveTarget(), runtime, withTrailingSlash()

### Community 1 - "YoutubeSourceForm.tsx"
Cohesion: 0.20
Nodes (16): YoutubeSourceForm(), YoutubeSourceFormProps, YoutubeSourcesEditPageContent(), createYoutubeSource(), deleteYoutubeSources(), fetchYoutubeSources(), fetchYoutubeSourcesByUser(), getYoutubeSource() (+8 more)

### Community 2 - "SlideMediaForm.tsx"
Cohesion: 0.13
Nodes (79): react-icons, BusinessTable(), DevicePermissionItem, DevicesPermissionsTable(), DevicesTable(), Device, MonitorDevicesTable(), MarqueesTable() (+71 more)

### Community 4 - "UserForm.tsx"
Cohesion: 0.34
Nodes (10): Input(), InputProps, Label(), LabelProps, Modal(), ModalProps, UserAddressCard(), UserInfoCard() (+2 more)

### Community 5 - "MediaForm.tsx"
Cohesion: 0.21
Nodes (17): isIncompatibleVideoFile(), isMp4File(), MediaForm(), MediaFormProps, FileInput(), FileInputProps, createMedia(), updateMedia() (+9 more)

### Community 6 - "next"
Cohesion: 0.15
Nodes (4): nextConfig, next, metadata, metadata

### Community 7 - "package.json"
Cohesion: 0.10
Nodes (28): devDependencies, eslint@^9, eslint-config-next@15.1.3, postcss@^8, @svgr/webpack@^8.1.0, tailwindcss@^4.0.0, @types/js-cookie@^3.0.6, @types/node@^20 (+20 more)

### Community 8 - "Changelog"
Cohesion: 0.07
Nodes (28): Breaking Changes, Breaking Changes, Changelog, Cloning the Repository, Components, Demos, Feature Comparison, Free Version (+20 more)

### Community 9 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, autoprefixer@^10.4.20, @fullcalendar/core@^6.1.15, @fullcalendar/daygrid@^6.1.15, @fullcalendar/react@^6.1.15, html2canvas@^1.4.1, jszip@^3.10.2, next@^15.5.9 (+16 more)

### Community 10 - "BusinessForm.tsx"
Cohesion: 0.38
Nodes (9): BusinessForm(), BusinessFormProps, CURRENCY_OPTIONS, ActivateUserForm(), getDataUserAuth(), getIsOwner(), createBusiness(), updateBusiness() (+1 more)

### Community 11 - "react"
Cohesion: 0.14
Nodes (3): react, metadata, *.svg

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "SlidesSettingsPageContent.tsx"
Cohesion: 0.29
Nodes (7): MenuValuesPage(), metadata, generateMetadata(), SlidesSettingsPage(), MenuValuesPageContent(), SlidesSettingsPageContent(), getSlide()

### Community 14 - "SystemStatusPageContent.tsx"
Cohesion: 0.23
Nodes (12): metadata, SystemStatusPage(), Bar(), formatBytes(), formatDate(), formatUptime(), SystemStatusPageContent(), usageColor() (+4 more)

### Community 15 - "MenuEditorForm.tsx"
Cohesion: 0.07
Nodes (63): react-dom@^19.0.0, react-dom, MenuCanvas(), MenuCanvasProps, useFitScale(), MenuEditorForm(), MenuEditorFormProps, ORIENTATIONS (+55 more)

### Community 16 - "UsersEditPageContent.tsx"
Cohesion: 0.53
Nodes (4): EditUserPage(), generateMetadata(), UsersEditPageContent(), getUser()

### Community 17 - "GridShape"
Cohesion: 0.33
Nodes (6): AuthLayout(), Error404(), metadata, NotFound(), AdonPlayLogo(), GridShape()

### Community 18 - "eslint.config.mjs"
Cohesion: 0.22
Nodes (6): compat, __dirname, eslintConfig, __filename, @eslint/eslintrc@^3, @eslint/eslintrc

### Community 19 - "I18nProvider.tsx"
Cohesion: 0.19
Nodes (9): BusinessCreatePage(), generateMetadata(), BusinessCreatePageContent(), catalogs, formatMsg(), I18nContext, I18nContextValue, Messages (+1 more)

### Community 20 - "MonitorDeviceView.tsx"
Cohesion: 0.09
Nodes (20): recharts@^3.6.0, recharts, MonitorDeviceView(), RamDiskCpuData, UserFormProps, CircularChart(), CircularProgressChartProps, COLORS (+12 more)

### Community 22 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 23 - "videoTranscode.ts"
Cohesion: 0.29
Nodes (7): @ffmpeg/ffmpeg@^0.12.10, @ffmpeg/util@^0.12.1, @ffmpeg/ffmpeg, @ffmpeg/util, getFFmpeg(), TranscodeOptions, transcodeToH264Compatible()

### Community 24 - "app/layout.tsx"
Cohesion: 0.06
Nodes (42): clsx@^2.1.1, clsx, AdminLayout(), outfit, RootLayout(), viewport, LanguageSwitcher(), ServiceWorkerRegister() (+34 more)

### Community 25 - "DevicesPageContent.tsx"
Cohesion: 0.60
Nodes (3): DevicesPage(), generateMetadata(), DevicesPageContent()

### Community 26 - "SlidesMediaCreatePageContent.tsx"
Cohesion: 0.60
Nodes (3): generateMetadata(), SlideMediaCreatePage(), SlidesMediaCreatePageContent()

### Community 27 - "MarqueesForm.tsx"
Cohesion: 0.26
Nodes (10): axios@^1.10.0, axios, MarqueeFormProps, MarqueesForm(), Form(), FormProps, MarqueesEditPageContent(), createMarquees() (+2 more)

### Community 29 - "QrCodeForm.tsx"
Cohesion: 0.19
Nodes (13): generateMetadata(), QrCodeEditPage(), QrCodeForm(), QrCodeFormProps, getPositionStyle(), PositionExample(), TextArea(), TextareaProps (+5 more)

### Community 30 - "PageBreadcrumb"
Cohesion: 0.08
Nodes (34): DevicesPage(), generateMetadata(), BusinessPage(), generateMetadata(), generateMetadata(), MarqueesPage(), FormMenuPage(), metadata (+26 more)

### Community 31 - "apiGet"
Cohesion: 0.24
Nodes (13): UserForm(), UserFormProps, apiGet(), apiPost(), apiPut(), apiRequest(), getAuthHeaders(), fetchAudioMediaExcepted() (+5 more)

### Community 32 - "DetailsMediaPageContent.tsx"
Cohesion: 0.23
Nodes (9): generateMetadata(), MediaCreatePage(), generateMetadata(), MediaEditPage(), MediaDetails(), MediaDetailsProps, DetailsMediaPageContent(), MediaEditPageContent() (+1 more)

### Community 33 - "SchedulesPageContent.tsx"
Cohesion: 0.17
Nodes (17): metadata, SchedulesPage(), addDays(), atTime(), CALENDAR_BUTTON_TEXT, CALENDAR_LOCALES, CALENDAR_PLUGINS, DAYS (+9 more)

### Community 34 - "UserForm.tsx"
Cohesion: 0.27
Nodes (6): js-cookie@^3.0.5, js-cookie, generateMetadata(), SignIn(), SignInForm(), signIn()

### Community 35 - "MediaLibraryPageContent.tsx"
Cohesion: 0.60
Nodes (3): generateMetadata(), MediaLibraryPage(), MediaLibraryPageContent()

### Community 36 - "useT"
Cohesion: 0.20
Nodes (12): generateMetadata(), SlideCreatePage(), SlideMediaDetailsPage(), generateMetadata(), SlideMediaEditPage(), MediaDetailsProps, SlideMediaDetails(), CreateSlidePageContent() (+4 more)

### Community 37 - "DevicesPermissionsPageContent.tsx"
Cohesion: 0.60
Nodes (3): DevicesPage(), generateMetadata(), DevicesPermissionsPageContent()

### Community 38 - "SlidesMediaManagementPageContent.tsx"
Cohesion: 0.60
Nodes (3): generateMetadata(), SlidesMediaManagementPage(), SlidesMediaManagementPageContent()

### Community 39 - "EditMenuPageContent.tsx"
Cohesion: 0.60
Nodes (3): EditMenuPage(), metadata, EditMenuPageContent()

### Community 41 - "generatePageMetadata"
Cohesion: 0.11
Nodes (19): generateMetadata(), MarqueeCreatePage(), generateMetadata(), MarqueesEditPage(), generateMetadata(), MediaCreatePage(), generateMetadata(), CreateUserPage() (+11 more)

### Community 44 - "YoutubeSourcesCreatePageContent.tsx"
Cohesion: 0.60
Nodes (3): generateMetadata(), YoutubeSourcesCreatePage(), YoutubeSourcesCreatePageContent()

### Community 47 - "DeviceForm.tsx"
Cohesion: 0.26
Nodes (10): DeviceForm(), UserFormProps, CheckboxImage(), CheckboxImageProps, RadioImage(), RadioImageProps, updateDevices(), fetchMarqueesByUser() (+2 more)

### Community 48 - "BusinessEditPageContent.tsx"
Cohesion: 0.60
Nodes (3): BusinessEditPage(), generateMetadata(), BusinessEditPageContent()

### Community 50 - "QrCodesCreatePageContent.tsx"
Cohesion: 0.60
Nodes (3): generateMetadata(), QrCreatePage(), QrCodesCreatePageContent()

### Community 54 - "DevicesEditPageContent.tsx"
Cohesion: 0.22
Nodes (9): EditUserPage(), generateMetadata(), EditUserPage(), generateMetadata(), DevicesEditPageContent(), MonitorDevicesViewPageContent(), ErrorContext, ErrorContextProps (+1 more)

## Knowledge Gaps
- **1 isolated node(s):** `next/core-web-vitals`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 294 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `YoutubeSourceForm.tsx`, `SlideMediaForm.tsx`, `UserForm.tsx`, `MediaForm.tsx`, `next`, `package.json`, `dependencies`, `BusinessForm.tsx`, `SlidesSettingsPageContent.tsx`, `SystemStatusPageContent.tsx`, `MenuEditorForm.tsx`, `UsersEditPageContent.tsx`, `GridShape`, `I18nProvider.tsx`, `MonitorDeviceView.tsx`, `app/layout.tsx`, `DevicesPageContent.tsx`, `SlidesMediaCreatePageContent.tsx`, `MarqueesForm.tsx`, `QrCodeForm.tsx`, `PageBreadcrumb`, `apiGet`, `DetailsMediaPageContent.tsx`, `SchedulesPageContent.tsx`, `UserForm.tsx`, `MediaLibraryPageContent.tsx`, `useT`, `DevicesPermissionsPageContent.tsx`, `SlidesMediaManagementPageContent.tsx`, `EditMenuPageContent.tsx`, `business/edit/[id]/layout.tsx`, `generatePageMetadata`, `marquees/edit/[id]/layout.tsx`, `edit/[mid]/layout.tsx`, `YoutubeSourcesCreatePageContent.tsx`, `media-library/create/layout.tsx`, `details/[mediaId]/layout.tsx`, `DeviceForm.tsx`, `BusinessEditPageContent.tsx`, `business/create/layout.tsx`, `QrCodesCreatePageContent.tsx`, `[id]/create/layout.tsx`, `details/[mid]/layout.tsx`, `devices/edit/[id]/layout.tsx`, `DevicesEditPageContent.tsx`, `qrcodes/create/layout.tsx`, `settings/[id]/layout.tsx`, `marquees/create/layout.tsx`, `qrcodes/edit/[id]/layout.tsx`, `slides/create/layout.tsx`, `Radio.tsx`, `Alert.tsx`, `users/edit/[id]/layout.tsx`, `ModuleCard.tsx`?**
  _High betweenness centrality (0.407) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SlideMediaForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1324002574002574 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `route.ts`, `YoutubeSourceForm.tsx`, `SlideMediaForm.tsx`, `UserForm.tsx`, `MediaForm.tsx`, `package.json`, `dependencies`, `BusinessForm.tsx`, `react`, `SlidesSettingsPageContent.tsx`, `MenuEditorForm.tsx`, `UsersEditPageContent.tsx`, `GridShape`, `I18nProvider.tsx`, `MonitorDeviceView.tsx`, `app/layout.tsx`, `SlidesMediaCreatePageContent.tsx`, `MarqueesForm.tsx`, `QrCodeForm.tsx`, `PageBreadcrumb`, `apiGet`, `DetailsMediaPageContent.tsx`, `UserForm.tsx`, `useT`, `SlidesMediaManagementPageContent.tsx`, `EditMenuPageContent.tsx`, `business/edit/[id]/layout.tsx`, `generatePageMetadata`, `marquees/edit/[id]/layout.tsx`, `edit/[mid]/layout.tsx`, `YoutubeSourcesCreatePageContent.tsx`, `media-library/create/layout.tsx`, `details/[mediaId]/layout.tsx`, `DeviceForm.tsx`, `BusinessEditPageContent.tsx`, `business/create/layout.tsx`, `QrCodesCreatePageContent.tsx`, `[id]/create/layout.tsx`, `details/[mid]/layout.tsx`, `devices/edit/[id]/layout.tsx`, `DevicesEditPageContent.tsx`, `qrcodes/create/layout.tsx`, `settings/[id]/layout.tsx`, `marquees/create/layout.tsx`, `qrcodes/edit/[id]/layout.tsx`, `slides/create/layout.tsx`, `Alert.tsx`, `users/edit/[id]/layout.tsx`, `ModuleCard.tsx`, `middleware.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Should `icons/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.037037037037037035 - nodes in this community are weakly interconnected._
- **Why does `useT()` connect `useT` to `YoutubeSourceForm.tsx`, `SlideMediaForm.tsx`, `MediaForm.tsx`, `BusinessForm.tsx`, `SlidesSettingsPageContent.tsx`, `MenuEditorForm.tsx`, `UsersEditPageContent.tsx`, `I18nProvider.tsx`, `MonitorDeviceView.tsx`, `app/layout.tsx`, `DevicesPageContent.tsx`, `SlidesMediaCreatePageContent.tsx`, `MarqueesForm.tsx`, `QrCodeForm.tsx`, `PageBreadcrumb`, `apiGet`, `DetailsMediaPageContent.tsx`, `UserForm.tsx`, `MediaLibraryPageContent.tsx`, `DevicesPermissionsPageContent.tsx`, `SlidesMediaManagementPageContent.tsx`, `generatePageMetadata`, `YoutubeSourcesCreatePageContent.tsx`, `DeviceForm.tsx`, `BusinessEditPageContent.tsx`, `QrCodesCreatePageContent.tsx`, `DevicesEditPageContent.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09852216748768473 - nodes in this community are weakly interconnected._