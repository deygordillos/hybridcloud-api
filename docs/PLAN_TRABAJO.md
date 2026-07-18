# Plan de trabajo — Sistema Administrativo Hybrid

> Última actualización: 2026-07-18. Este documento se actualiza al cierre de cada fase.
> Aplica a los dos repositorios: `hybrid-api-ts` (backend) y `hybrid-cloud-angular` (frontend).
> El roadmap de mejoras con IA está en [ROADMAP_IA.md](./ROADMAP_IA.md).

## Contexto

El backend ya tenía implementados y activos: impuestos (`/v1/taxes` + `inventory_taxes` N:M con productos), clientes (`/v1/customers`), depósitos (`/v1/inventory/storage`), precios (`/v1/inventory/prices`, modelo 3 monedas local/stable/ref, `/v1/types-of-prices`) y tasas de cambio (`/v1/currencies-exchanges` con historial). El trabajo se concentra en: **frontend** (clientes, depósitos, precios, monedas), **pedidos** (nuevo en ambas capas), auditoría genérica, seguridad, dashboard y documentación.

Decisiones tomadas:
- El backend es la fuente de verdad del contrato de impuestos; se corrigió el frontend.
- Pedidos = pedidos de **venta** a clientes, con snapshot multimoneda de precios/tasas y estados: borrador → confirmado → despachado → facturado / cancelado.
- `coins`/`rel_coins_companies*` queda **DEPRECATED**; toda UI nueva usa `currencies`/`currencies_exchanges`.
- El stub frontend `productos-servicios-inventario` (duplicado de `inventory`) se elimina.

## Estado de fases

| Fase | Alcance | Tamaño | Estado |
|---|---|---|---|
| F0 | Seguridad base backend (helmet, rate-limit, errorHandler, adminMiddleware en countries) | S | ✅ Completada |
| F1 | Impuestos utilizables (backend: bug tax_type 3 + currency_id + decimal; frontend: alinear contrato + menú) | S | ✅ Completada |
| F2 | Clientes frontend + tests backend | M | ✅ Completada |
| F3 | Depósitos/Almacenes frontend | S | ✅ Completada |
| F4a | Monedas/Tasas (endpoint GET /v1/currencies + UI) | M | ✅ Completada |
| F4b | Precios de productos frontend | L | ✅ Completada |
| F5 | Auditoría genérica backend (`audit_logs`) | M | ✅ Completada |
| F6 | Pedidos backend + frontend | XL | ✅ Completada |
| F7 | Dashboard e indicadores | M-L | ✅ Completada |
| F8 | Documentación | S | ✅ Completada |

**Estado global: Plan A implementado.** Suite backend completa: 192/192 tests ✅ (15 suites). Frontend compila sin errores.

### Resumen de lo entregado por fase (rutas clave)

- **F1 Impuestos**: fix `TaxesService` (tipo 3 + `currency_id` + reglas exento/fijo), migración `tax_value` → decimal(18,3), `GET /v1/currencies` (catálogo, adelantado de F4a). Frontend alineado al contrato real; menú "Configuración" visible. Tests: `tests/modules/taxes/`, `tests/modules/currencies/currencies.route.test.ts`.
- **F2 Clientes**: fix `CustomersService.update` (PATCH parcial ya no pisa campos con undefined ni fuerza exento). Frontend `modules/clientes/` completo. Tests: `tests/modules/customers/`.
- **F3 Depósitos**: frontend `modules/depositos-almacenes/` implementado (antes stub). Stub duplicado `productos-servicios-inventario` eliminado.
- **F4 Monedas/Precios**: UI de tasas (vigentes + historial + form) en `modules/monedas/`; UI de precios multimoneda con cálculo automático por tasa vigente en `modules/precios/`.
- **F5 Auditoría**: entidad + migración `audit_logs`, `AuditService.log()` con diff automático, `GET /v1/audit-logs` (admin). Instrumentados: taxes, customers, currencies_exchanges, inventory_prices, orders. Tests: `tests/modules/audit/`.
- **F6 Pedidos**: entidades `orders`/`order_items` con snapshot 3 monedas, `OrdersService` con máquina de estados (borrador→confirmado→despachado→facturado/cancelado), correlativo `PED-######`, validación de stock, movimientos de salida al despachar, `/v1/orders` completo. Frontend `modules/pedidos/` (lista, detalle con transiciones, form con items). Tests: `tests/modules/orders/` (13).
- **F7 Dashboard**: `/v1/dashboard/{summary,sales,top-products,low-stock,exchange-rate,recent-activity}` + frontend `modules/dashboard/` con KPI cards y chart.js; ruta por defecto de `/app`. Tests: `tests/modules/dashboard/` (6).

## Detalle por fase

### F0 — Seguridad base ✅
- `helmet` y `express-rate-limit` agregados (`src/app.ts`, `src/middlewares/rate-limit.middleware.ts`).
  - Global: 300 req/15min. Auth (`/v1/auth/login`, `/v1/auth/refresh`): 10 req/15min. Deshabilitado con `NODE_ENV=test`.
- `errorHandler` global recableado **después** de las rutas; catcher de JSON inválido ahora responde 400 y delega el resto.
- `adminMiddleware` agregado a POST/PUT de `/v1/countries` (catálogo global, solo admin).
- Tests: `tests/modules/security/rate_limit.test.ts` (3 ✅).

### F1 — Impuestos utilizables en creación de productos 🔄
Backend (✅):
- `TaxesService`: eliminado `console.log`; acepta `tax_type ∈ {1,2,3}`; maneja `currency_id`. Reglas: tipo 1 (exento) fuerza `tax_value=0`; tipo 3 (fijo) requiere `currency_id`; al salir de tipo 3 se limpia `currency_id`.
- `taxes.route.ts`: validación `currency_id` (entero positivo, requerido si `tax_type=3`) en POST/PUT/PATCH.
- Migración `1784073600000-tax_value_decimal.ts`: `tax_value` float(5,2) → decimal(18,3) (montos fijos grandes en VES).
- Tests: `tests/modules/taxes/taxes.route.test.ts` (12 ✅).

Frontend (en curso):
- Reescribir `tax.model.ts`/`taxDto.ts` a campos reales de la API (`tax_code, tax_name, tax_description, tax_type, tax_value, currency_id, tax_status`), eliminando `tax_siglas/tax_percentage/tax_affects_cost` (nunca existieron en la API).
- Form y tabla de impuestos alineados; labels de taxes en form de productos y familias.
- Menú: sección "Configuración" visible en producción con "Impuestos".

### F2 — Clientes (frontend)
Backend listo (`/v1/customers`); agregar `tests/modules/customers/`. Frontend: `modules/clientes/` (lista p-table server-side + modal crear/editar), `services/clientes/`, modelos/DTOs, ruta `app/clientes`, menú sección "Ventas".

### F3 — Depósitos/Almacenes (frontend)
Backend listo (`/v1/inventory/storage`). Reemplazar stub `modules/depositos-almacenes/`, con servicio/modelos/DTOs y modal CRUD. Menú en "Inventario". Eliminar stub `productos-servicios-inventario`.

### F4 — Monedas/Tasas + Precios
- Backend: nuevo `GET /v1/currencies` (catálogo). 
- 4a UI Monedas: tasa vigente por tipo (local/stable/ref, DIVIDE/MULTIPLY), historial con gráfico, form de tasa del día.
- 4b UI Precios: selector producto/variante, precios por tipo en 3 monedas, historial, cálculo automático con tasa vigente y `tax_amount`.

### F5 — Auditoría genérica (backend)
Tabla `audit_logs`: `audit_id, company_id FK, entity_type, entity_id, action_type enum(CREATE,UPDATE,DELETE,ACTIVATE,DEACTIVATE,STATUS_CHANGE), changes_data json {before,after}, changed_by FK users SET NULL, ip_address, created_at`. Índices `(entity_type, entity_id)`, `(company_id, created_at)`. `AuditService.log()` con diff automático; instrumentar Taxes/Customers/Prices/CurrenciesExchanges/Orders. Endpoint `GET /v1/audit-logs` (admin). `users_audit` se mantiene intacto.

### F6 — Pedidos (backend + frontend)
Entidades `orders` y `order_items` con snapshot 3 monedas (patrón de `inventory_prices`): tasas `exchange_rate_stable/ref` selladas al confirmar; totales persistidos; **nunca recalcular un pedido confirmado con tasa nueva**. Estados: 1 borrador (editable), 2 confirmado (re-snapshot + validación stock), 3 despachado (genera `inventory_movements`), 4 facturado, 5 cancelado. Endpoints `/v1/orders` (CRUD + `POST /:id/status`). Frontend `modules/pedidos/` (lista, detalle con transiciones, form con autocomplete de cliente/producto).

### F7 — Dashboard
Backend `/v1/dashboard/{summary,sales,top-products,low-stock,exchange-rate}` (agregaciones por company_id). Frontend: KPI cards + chart.js (línea ventas, barras top productos, dona estados, línea tasa, tabla stock bajo). Ruta por defecto de `/app`.

### F8 — Documentación
Actualizar en cada cierre de fase: `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md` (backend) y `README.md`, `AGENTS.md`, `docs/` (frontend). Marcar `coins` DEPRECATED.

## Deuda técnica conocida

- ✅ ~~Tests de currencies e inventory_lots fallaban~~ — corregidos: ahora envían `x-company-id` vía `authHeader(token, company.company_id)`.
- `authMiddleware` responde **400** (no 401) cuando no se envía token.
- `checkJwtMiddleware` (rutas coins legado) solo valida firma, no carga usuario.
- Sistema `coins` legado sin migración TypeORM propia — candidato a eliminación.

## Verificación

- Backend: `npm test`; Swagger en `http://localhost:3001/api/v1/docs`; `npm run migration:run` sin errores.
- Frontend: `ng serve` + backend local; flujo E2E por fase (crear impuesto fijo y asignarlo a producto; CRUD cliente/depósito; tasa del día + precio 3 monedas; ciclo completo de pedido; dashboard con datos del tenant).
- Multi-tenancy: probar cada módulo nuevo con dos empresas (`x-company-id`) verificando aislamiento.
