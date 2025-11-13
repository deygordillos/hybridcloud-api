import { InventoryStorage } from "../entity/inventoryStorage.entity";

export default {
    Auth: {
        user_not_found: 'User not found',
        user_auth_incorrect: 'User or password incorrect.',
        user_complete_user_and_pass: 'Please, you have to complete username and password',
        invalid_refresh_token: 'Invalid refresh token.'
    },
    User: {
        user_created: 'User created',
        user_updated: 'User updated',
        user_exists: 'Sorry, user already exists',
        user_not_exists: 'Sorry, user does not exists',
        user_complete_required_fields: 'Please, you have to send username, password, email and user_type at least',
        user_needed: 'You must have send an userid'
    },
    Groups: {
        group_created: 'Group created',
        group_updated: 'Group updated',
        group_not_exists: 'Sorry, group does not exists',
        group_exists: 'Sorry, group exists',
        group_needed: 'You must have send a group id',
        group_creation_unauthorized: 'You do not have authorization to create groups'
    },
    Companies: {
        company_created: 'Company created',
        company_updated: 'Company updated',
        company_not_exists: 'Sorry, company does not exists',
        company_exists: 'Sorry, company exists',
        company_needed: 'You must have send a company id'
    },
    Country: {
        country_created: 'Country created successfully',
        country_updated: 'Country updated successfully',
        country_not_exists: 'Sorry, country does not exists',
        country_exists: 'Sorry, country already exists',
        country_needed: 'You must have send a country id'
    },
    Customers: {
        customer_created: 'Customer created',
        customer_updated: 'Customer updated',
        customer_not_exists: 'Sorry, customer does not exists',
        customer_exists: 'Sorry, customer exists',
        customer_needed: 'You must have send a customer id'
    },
    Sucursales: {
        sucursal_created: 'Sucursal created',
        sucursal_updated: 'Sucursal updated',
        sucursal_not_exists: 'Sorry, sucursal does not exists',
        sucursal_needed: 'You must have send a sucursal id'
    },
    Tax: {
        tax_created: 'Tax created',
        tax_updated: 'Tax updated',
        tax_exists: 'Sorry, tax already exists',
        tax_not_exists: 'Sorry, tax does not exists',
        tax_needed: 'You must have send a tax id'
    },
    Coins: {
        coins_assigned: 'Coins assigned!',
        coin_not_exists: 'Sorry, coin does not exists',
    },
    Inventory: {
        inv_created: 'Inventory created',
        inv_updated: 'Inventory updated',
        inv_not_exists: 'Sorry, Inventory does not exists',
        inv_exists: 'Sorry, Inventory exists',
        inv_needed: 'You must have send an inventory id'
    },
    InventoryFamily: {
        invFamily_created: 'Inventory family created',
        invFamily_updated: 'Inventory family updated',
        invFamily_not_exists: 'Sorry, Inventory family does not exists',
        invFamily_exists: 'Sorry, Inventory family exists',
        invFamily_needed: 'You must have send an inventory family id'
    },
    InventoryStorage: {
        invStorage_created: 'Inventory storage created',
        invStorage_updated: 'Inventory storage updated',
        invStorage_not_exists: 'Sorry, Inventory storage does not exists',
        invStorage_exists: 'Sorry, Inventory storage exists',
        invStorage_needed: 'You must have send an inventory storage id'
    },
    InventoryPrices: {
        price_created: 'Inventory price created',
        price_updated: 'Inventory price updated',
        price_deleted: 'Inventory price deleted',
        price_not_exists: 'Sorry, Inventory price does not exists',
        price_exists: 'Sorry, Inventory price exists',
        price_needed: 'You must have send an inventory price id'
    },
    InventoryVariantStorages: {
        storage_created: 'Variant storage created',
        storage_updated: 'Variant storage updated',
        storage_deleted: 'Variant storage deleted',
        storage_not_exists: 'Sorry, Variant storage does not exists',
        storage_exists: 'Sorry, Variant storage exists',
        storage_needed: 'You must have send a variant storage id'
    },
    InventoryLotsStorages: {
        storage_created: 'Lot storage created',
        storage_updated: 'Lot storage updated',
        storage_deleted: 'Lot storage deleted',
        storage_not_exists: 'Sorry, Lot storage does not exists',
        storage_exists: 'Sorry, Lot storage exists',
        storage_needed: 'You must have send a lot storage id'
    },
    InventoryMovements: {
        movement_created: 'Inventory movement created',
        movement_updated: 'Inventory movement updated',
        movement_deleted: 'Inventory movement deleted',
        movement_not_exists: 'Sorry, Inventory movement does not exists',
        movement_exists: 'Sorry, Inventory movement exists',
        movement_needed: 'You must have send an inventory movement id'
    },
    CurrenciesExchanges: {
        currency_exchange_created: 'Currency exchange created successfully',
        currency_exchange_updated: 'Currency exchange updated successfully',
        currency_exchange_deleted: 'Currency exchange deleted successfully',
        currency_exchange_not_exists: 'Sorry, currency exchange does not exists',
        currency_exchange_exists: 'Sorry, currency exchange already exists for this company, currency and type',
        currency_exchange_needed: 'You must have send a currency exchange id',
        currency_exchange_retrieved: 'Currency exchange retrieved successfully',
        currencies_retrieved: 'Currencies retrieved successfully',
        currency_conversion_completed: 'Currency conversion completed',
        currency_history_retrieved: 'Currency history retrieved successfully',
        base_currency_set: 'Base currency set successfully',
        company_id_required: 'Company ID is required',
        currency_id_required: 'Currency ID is required',
        exchange_rate_required: 'Exchange rate is required',
        currency_type_required: 'Currency type is required',
        from_currency_id_required: 'From currency ID is required',
        to_currency_id_required: 'To currency ID is required',
        amount_required: 'Valid amount is required',
        invalid_currency_exchange_id: 'Invalid currency exchange ID',
        invalid_pagination_params: 'Invalid pagination parameters',
        currencies_not_found: 'One or both currencies not found for this company',
        currency_not_found: 'Currency not found'
    },
}