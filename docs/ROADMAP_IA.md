# Roadmap: Sistema administrativo potenciado con IA para pymes (contexto Venezuela)

> Plan B — oportunidades de mejora. Documento de estrategia, no de implementación inmediata.
> Complementa a [PLAN_TRABAJO.md](./PLAN_TRABAJO.md) (Plan A, implementación por fases).
> Última actualización: 2026-07-18.

## 1. Resumen ejecutivo

Hybrid es un ERP ligero multi-tenant para pymes. Su ventaja competitiva en el mercado venezolano es que **"piensa" en dos monedas a la vez**: todo precio, costo y pedido se registra simultáneamente en moneda local (VES), estable (USD) y de referencia, con la tasa sellada en el momento de la transacción. Sobre esa base, la capa de IA propuesta automatiza las decisiones que más tiempo y dinero le cuestan a una pyme en un entorno inflacionario: actualizar tasas, reajustar precios, reponer inventario y entender su negocio con preguntas en lenguaje natural.

## 2. Contexto: la pyme venezolana

- **Dualidad monetaria**: se cobra en VES y USD (efectivo, Zelle, pago móvil), se piensa en USD, se factura fiscalmente en VES a tasa BCV.
- **Tasa BCV vs. paralelo**: dos referencias que divergen; el margen real depende de cuál uses para reponer inventario.
- **IGTF 3%**: impuesto a pagos en divisas, condicionado al método de pago.
- **Repricing constante**: con inflación alta, un precio en VES caduca en días u horas. No reajustar = vender a pérdida.
- **Cumplimiento fiscal**: SENIAT, facturación con imprenta digital / máquinas fiscales, libros de venta.

## 3. Fundaciones ya construidas (Plan A)

| Fundación | Estado | Habilita |
|---|---|---|
| Modelo 3 monedas (local/stable/ref) en precios y pedidos | ✅ | Todo lo multimoneda |
| Tasas de cambio por empresa con historial (`currencies_exchanges_history`) | ✅ | Automatización de tasa, análisis de tendencia |
| Impuestos flexibles (exento/porcentaje/fijo + moneda) | ✅ | IGTF como impuesto configurable |
| Pedidos con snapshot de precios y tasa (nunca se recalculan) | ✅ | Integridad histórica bajo inflación |
| Auditoría genérica (`audit_logs`) | ✅ | Trazabilidad, datos de entrenamiento/contexto |
| Dashboard con KPIs (`/v1/dashboard/*`) | ✅ | Fuente de datos para el asistente IA |
| Multi-tenancy estricto por `company_id` | ✅ | Aislamiento de datos entre clientes |

## 4. Oportunidades priorizadas (impacto / esfuerzo)

### 4.1 Quick wins (alto impacto, bajo esfuerzo)

1. **Actualización automática de tasa BCV** — Job programado (cron/K8s CronJob) que consulta una fuente pública (API pydolarve, scraping BCV) y registra la tasa del día vía `CurrenciesExchangesService` (queda en historial automáticamente). Config por empresa: fuente, hora, margen % opcional sobre BCV.
2. **Alerta de tasa desactualizada** — Si la tasa estable tiene > N horas sin actualizar, banner en dashboard y bloqueo opcional de confirmación de pedidos. Evita vender con tasa vieja (pérdida directa).
3. **Alertas de stock bajo** — Ya existe `/v1/dashboard/low-stock`; agregar notificación por email/WhatsApp al llegar al mínimo.
4. **IGTF automático** — Impuesto tipo porcentaje condicionado al método de pago del pedido (requiere agregar `payment_method` a orders y regla de aplicación). El modelo de taxes ya lo soporta.

### 4.2 Estratégicos (alto impacto, esfuerzo medio)

5. **Repricing automático por inflación** — Regla por familia de productos: "si la tasa varió más de X% desde el último precio, recalcular precios locales con la tasa nueva manteniendo el precio estable". Flujo con aprobación humana (lista de cambios propuestos → aprobar en lote). Usa `inventory_prices_history` para trazabilidad.
6. **Asistente IA conversacional sobre datos del tenant** — Chat en el frontend ("¿cuánto vendí esta semana en USD?", "¿qué producto me deja más margen?", "¿a qué clientes no les vendo hace un mes?") implementado con tool-use del API de Claude sobre los endpoints existentes de dashboard/pedidos/precios. Los guardrails multi-tenant son naturales: el asistente solo llama endpoints con el token y `x-company-id` del usuario.
7. **OCR de facturas de compra** — Foto de la factura del proveedor → extracción con visión (Claude) → borrador de carga de inventario/costos para aprobar. Reduce la carga manual, el mayor freno de adopción en pymes.

### 4.3 Apuestas (alto impacto, esfuerzo alto)

8. **Pronóstico de demanda y sugerencia de reposición** — Con historial de `order_items` e `inventory_movements`: sugerir qué comprar y cuánto, considerando lead time y estacionalidad.
9. **Scoring de clientes** — Riesgo de morosidad y límite de crédito sugerido con base en el historial de pedidos/pagos del cliente.
10. **Conciliación de pagos** — Matching semiautomático de pagos móviles/Zelle/transferencias contra pedidos por monto+fecha+referencia.

## 5. Arquitectura IA propuesta

- **Capa separada**: servicio `hybrid-ai` (o módulo `/v1/ai/*`) que orquesta llamadas al modelo; el core transaccional no depende de la IA.
- **Tool-use, no acceso a BD**: el asistente consume los endpoints REST existentes con el token del usuario — hereda permisos y multi-tenancy; nunca cruza datos entre empresas.
- **Contexto por empresa**: catálogo, tasas y KPIs del tenant como contexto; sin entrenamiento con datos de clientes.
- **Costos**: cachear respuestas frecuentes; usar modelos pequeños (Haiku) para clasificación/extracción y modelos grandes solo para razonamiento complejo; medir tokens por tenant para asignar costo por tier.

## 6. Roadmap sugerido post-Plan A

| Etapa | Alcance | Dependencias |
|---|---|---|
| IA-1 | Tasa BCV automática + alertas (tasa vieja, stock bajo) | Ninguna (fundaciones listas) |
| IA-2 | IGTF/método de pago + repricing con aprobación | payment_method en orders |
| IA-3 | Asistente conversacional (dashboard + pedidos + precios) | API key Claude, UI chat |
| IA-4 | OCR de facturas de compra | Módulo de compras (no existe aún) |
| IA-5 | Pronóstico de demanda, scoring, conciliación | Historial acumulado (± 6 meses de datos) |

**Monetización sugerida**: tier Básico (core administrativo), tier Pro (automatizaciones: tasa, repricing, alertas), tier IA (asistente + OCR + pronósticos), cobrando en USD estable.

## 7. Riesgos

- **Fuentes de tasa**: APIs no oficiales pueden caerse o cambiar; mitigar con múltiples fuentes y fallback manual.
- **Privacidad**: datos financieros del tenant hacia APIs de IA — contratos de no-retención (API comercial de Anthropic no entrena con datos), anonimizar donde sea posible.
- **Costos de inferencia**: medir por tenant desde el día 1; límites por tier.
- **Cumplimiento fiscal**: el repricing automático no exime de las reglas SENIAT de facturación; la facturación fiscal sigue siendo un módulo aparte (imprenta digital homologada).
- **Confianza del usuario**: toda acción de IA que mueva dinero (precios, pedidos) pasa por aprobación humana al menos los primeros meses.
