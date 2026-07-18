# Hybrid API

This project is a RESTful API developed in TypeScript using Node.js, Express, and TypeORM. It is designed for managing inventories, inventory families, warehouses, taxes, and products for companies. The architecture is microservices-oriented and supports authentication, robust validations, and CRUD operations for the main entities in the system.

## Main Features

- **Inventory Management:** CRUD for products, families, warehouses, variants, lots, movements and stock control.
- **Tax Management:** CRUD for taxes associated with products and companies (exempt / percent / fixed-with-currency).
- **Multi-currency:** 3-currency model (local / stable / reference) with per-company exchange rates and history (`/v1/currencies`, `/v1/currencies-exchanges`).
- **Pricing:** Prices per variant and price type in 3 currencies with history (`/v1/inventory/prices`, `/v1/types-of-prices`).
- **Customers:** CRUD for company customers (`/v1/customers`).
- **Sales Orders:** Orders with items, multi-currency snapshot of prices/rates and a state machine (draft → confirmed → dispatched → invoiced / cancelled). Dispatching creates inventory movements and discounts stock (`/v1/orders`).
- **Dashboard:** KPI aggregations per company: sales, orders by status, top products, low stock, exchange rate series, recent activity (`/v1/dashboard/*`).
- **Audit Trail:** Generic audit log with field-level diff for taxes, customers, prices, exchange rates and orders (`/v1/audit-logs`, admin only) plus the legacy `users_audit` for users.
- **Multi-company:** Each resource is scoped by `company_id` (header `x-company-id` + `users_companies`).
- **Authentication & Authorization:** JWT with refresh tokens, admin middleware, per-company validation.
- **Security:** helmet, global and auth-specific rate limiting.
- **Validations:** Uses express-validator to ensure data integrity.
- **ORM:** Integrated with TypeORM for entity and migration management.
- **Modular Structure:** Clear separation of controllers, services, repositories, and routes.

> **Deprecated:** the legacy `coins` module (`/v1/coins`, `rel_coins_companies*`) is superseded by `currencies` / `currencies-exchanges`. Do not build new features on it.

Planning docs: [docs/PLAN_TRABAJO.md](docs/PLAN_TRABAJO.md) (implementation plan and status) · [docs/ROADMAP_IA.md](docs/ROADMAP_IA.md) (AI roadmap for SMEs).

## Folder Structure

```
src/
  controllers/
  entity/
  middlewares/
  migration/
  repositories/
  routes/
  services/
  config/
```

## Main Entities

- **Companies:** Registered companies in the system.
- **InventoryFamily:** Product families.
- **InventoryStorage:** Warehouses or storage locations.
- **Taxes:** Configurable taxes per company.
- **Inventory:** Products or services managed in inventory.

## Example Endpoints

- `POST /api/v1/inventory`  
  Creates a new product in inventory.

- `GET /api/v1/inventory?family_id=1`  
  Lists products for a specific family.

- `POST /api/v1/taxes`  
  Creates a new tax.

## Example Request to Create an Inventory

```json
{
  "inv_code": "PROD-001",
  "id_inv_family": 1,
  "inv_description": "Sample product",
  "inv_description_detail": "Detailed description of the sample product",
  "inv_status": 1,
  "inv_type": 1,
  "inv_has_variants": 0,
  "inv_is_exempt": 0,
  "inv_stock": 100.0,
  "inv_previous_stock": 50.0,
  "inv_avg_cost": 25.5,
  "inv_avg_cost_previous": 24.0,
  "inv_url_image": "https://example.com/image.jpg"
}
```

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`.
4. Run migrations:
   ```bash
   npm run typeorm migration:run
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## Contributions

Contributions are welcome. Please open an issue or pull request for suggestions or improvements.

## License

In LICENSE file.