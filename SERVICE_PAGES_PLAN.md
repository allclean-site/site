# Service landing pages — build plan & sourced content (2026-06-26)

## Goal
Per-service landing pages = homepage layout MINUS "Наши услуги" block, with per-service:
hero, benefits, what's-included, process, **embedded full step calculator (instead of pricing)**,
relevant testimonials, relevant FAQ, SEO/GEO/AEO copy + schema. RU + RO. Video replaceable via ?lgedit.

## Architecture
- `src/data/services.ts` — typed per-service content (ru/ro): slug, calcSlug, meta, hero, intro, included[], process[], testimonials[], faq[], seoText, schema bits.
- `src/components/ServiceLanding.astro` — data-driven Sparkles-style sections + `<Calculator>` embedded.
- Routes `src/pages/services/[slug].astro` + `ro/services/[slug].astro` (getStaticPaths over data) — per-service title/desc + Service/FAQPage/BreadcrumbList JSON-LD in head slot.
- `/services` listing (ServicesContent.astro) → relink cards to real slugs.
- Hero video override: editor.js "Заменить видео" → Supabase storage → page_overrides → apply-overrides swaps <source>; Hero.astro reads override. + video params memo.

## Slug map (page slug = calc slug)
home-cleaning(apartments calc), office, post-construction, windows, carpet, upholstery, warehouse, retail, floor-restoration, disinfection.

## Common 5 benefits (verbatim from allclean.md, fix typo отвественность→ответственность)
Управление качеством · Безопасность и ответственность · Полный спектр услуг · Квалифицированный персонал · Экологическая химия

## REAL prices found on allclean.md (vs my placeholder calcs — FLAG to user)
- Post-construction: до 40м² от 3700 lei · до 60м² от 4700 · до 90м² от 5700 · офис от 35 lei/м²
- Windows: внутри от 40 lei/м² · снаружи от 45 · витражи 40 · стеклофасады 35 · Etalbond 35  (SITE = per m², my calc = per window!)
- Carpet: ковролин от 45 lei/м² · ковры от 55 lei/м²
- Upholstery: 50–450 lei за предмет (текстиль/кожа)
- Office: от 35 lei/м² (after inspection)
- Disinfection/warehouse/retail/floor: цена после бесплатного осмотра

## Sourced content per service (RU, adapt for SEO)
- **apartments**: «Специалисты по уборке квартир/домов, опыт годами. Лучшие услуги уборки в Кишинёве.» Поддерживающая 3–5ч (пылесос+мойка полов, пыль с доступных поверхностей, паутина, лёгкая ванная+кухня). Генеральная до 7ч (+люстры/светильники, мойка окон внутри/снаружи, интенсивная кухня+санузлы). Поводы: к празднику, после вечеринки, к рождению ребёнка.
- **office**: «От генеральной раз в неделю до обслуживания всего здания.» Ежедневная: пылесос+мойка полов, пыль со светильников до 2м, подоконники+радиаторы, наличники, зеркала/стекло, мебель до 2м, оргтехника, вынос мусора+смена пакетов, чистка+дезинфекция санузлов, пополнение расходников (бумага/мыло/полотенца/освежитель). Бесплатный осмотр, скидки на площади и абонемент.
- **post-construction**: «Закончили стройку/ремонт — нужна уборка после застройщика?» Сбор строймусора+пыли, удаление наклеек с окон, мойка окон внутри/снаружи, снятие защитной плёнки с рам, обеспыливание стен, чистка розеток/выключателей, двери+рамы, дезинфекция плитки+сантехники, радиаторы, плинтусы, спец. мойка полов.
- **windows**: «Профессиональная мойка окон и фасадов по отличной цене.» Уход за фасадом+окнами важен для эстетики. Бесплатный выезд+оценка. Скидки на площади+абонемент.
- **carpet**: «Ковролин под интенсивным движением, удерживает грязь.» Деликатная механическая чистка. Процесс: освежающий раствор → оборудование с щёткой/текстильным падом → сбор раствора с грязью → ароматизация.
- **upholstery**: «Чистка диванов и матрасов — любимое направление.» Для здоровья семьи нужна правильная периодическая чистка. Отдельные методы для текстиля и кожи.
- **warehouse/industrial**: «Уборка промышленных помещений требует особого внимания» (большие площади, сложные сроки). Промышленная химия, спец. оборудование для разных полов, охрана труда. Мойка+дезинфекция, обеспыливание металлоконструкций, вентиляция, оборудование+тех. поверхности, санузлы/душевые/раздевалки, ежедневная поддерживающая.
- **retail**: «Для крупных магазинов любого профиля.» Приемлемые цены, высокие стандарты. (Список как промышленный.)
- **floor-restoration**: Восстановление блеска+защита линолеума · реставрация+лакировка паркета · восстановление блеска мрамора. Кишинёв+пригороды.
- **disinfection**: «К уборке пищевых производств особо жёсткие требования» (по законодательству РМ). Мойка+дезинфекция помещений+оборудования, чистка вентиляции, вытяжки+жироуловители, санузлы/душевые/раздевалки.

## Contacts (real): +373 79 955 044 · info@allclean.md · ул. Месаджер 7, Кишинёв MD-2069

## Status
- [ ] data/services.ts (RU+RO)
- [ ] ServiceLanding.astro
- [ ] routes [slug] RU/RO + schema
- [ ] /services relink
- [ ] editor video replace + Hero override + apply-overrides + memo
- [ ] build + verify + deploy
