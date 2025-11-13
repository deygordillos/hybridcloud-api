import messages from "../config/messages";
import { CountryRepository } from "../repositories/CountryRepository";
import { Countries } from "../entity/countries.entity";

export class CountryService {
    /**
     * Get all countries with pagination
     * @param offset Offset for pagination
     * @param limit Limit for pagination
     * @returns Countries and total count
     */
    static async findCountries(offset: number = 0, limit: number = 10) {
        const [countries, total] = await CountryRepository
            .createQueryBuilder("country")
            .where("country.country_status = :status", { status: 1 })
            .orderBy("country.country_name", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { countries, total };
    }

    /**
     * Get all active countries without pagination
     * @returns All active countries
     */
    static async findAllCountries() {
        return await CountryRepository.find({
            where: { country_status: 1 },
            order: { country_name: "ASC" }
        });
    }

    /**
     * Find country by ID
     * @param country_id Country ID
     * @returns Country or null
     */
    static async findCountryById(country_id: number) {
        return await CountryRepository.findOneBy({ country_id });
    }

    /**
     * Find country by ISO2 code
     * @param country_iso2 ISO2 code (e.g., "US")
     * @returns Country or null
     */
    static async findCountryByIso2(country_iso2: string) {
        return await CountryRepository.findOneBy({ country_iso2 });
    }

    /**
     * Find country by ISO3 code
     * @param country_iso3 ISO3 code (e.g., "USA")
     * @returns Country or null
     */
    static async findCountryByIso3(country_iso3: string) {
        return await CountryRepository.findOneBy({ country_iso3 });
    }

    /**
     * Find countries by continent
     * @param continent_name Continent name
     * @param offset Offset for pagination
     * @param limit Limit for pagination
     * @returns Countries and total count
     */
    static async findCountriesByContinent(continent_name: string, offset: number = 0, limit: number = 10) {
        const [countries, total] = await CountryRepository
            .createQueryBuilder("country")
            .where("country.continent_name = :continent_name", { continent_name })
            .andWhere("country.country_status = :status", { status: 1 })
            .orderBy("country.country_name", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { countries, total };
    }

    /**
     * Find countries by subcontinent
     * @param subcontinent_name Subcontinent name
     * @param offset Offset for pagination
     * @param limit Limit for pagination
     * @returns Countries and total count
     */
    static async findCountriesBySubcontinent(subcontinent_name: string, offset: number = 0, limit: number = 10) {
        const [countries, total] = await CountryRepository
            .createQueryBuilder("country")
            .where("country.subcontinent_name = :subcontinent_name", { subcontinent_name })
            .andWhere("country.country_status = :status", { status: 1 })
            .orderBy("country.country_name", "ASC")
            .offset(offset)
            .limit(limit)
            .getManyAndCount();

        return { countries, total };
    }

    /**
     * Create a new country
     * @param countryData Country data
     * @returns Created country
     */
    static async create(countryData: Partial<Countries>) {
        // Verificar si ya existe un país con el mismo ISO2
        if (countryData.country_iso2) {
            const existingCountry = await CountryRepository.findOneBy({ 
                country_iso2: countryData.country_iso2 
            });
            if (existingCountry) {
                throw new Error(messages.Country?.country_exists || "Country with this ISO2 code already exists");
            }
        }

        const newCountry = CountryRepository.create(countryData);
        await CountryRepository.save(newCountry);

        return newCountry;
    }

    /**
     * Update country
     * @param country Country entity
     * @param countryData Update data
     * @returns Success message
     */
    static async update(country: Countries, countryData: Partial<Countries>) {
        if (countryData.country_name !== undefined) {
            country.country_name = countryData.country_name;
        }
        if (countryData.country_status !== undefined) {
            country.country_status = countryData.country_status;
        }
        if (countryData.country_language !== undefined) {
            country.country_language = countryData.country_language;
        }
        if (countryData.prefix_cellphone !== undefined) {
            country.prefix_cellphone = countryData.prefix_cellphone;
        }
        if (countryData.mask_phone !== undefined) {
            country.mask_phone = countryData.mask_phone;
        }

        await CountryRepository.save(country);
        return { message: messages.Country?.country_updated || "Country updated successfully" };
    }

    /**
     * Get unique continents
     * @returns List of continents
     */
    static async getContinents() {
        const result = await CountryRepository
            .createQueryBuilder("country")
            .select("DISTINCT country.continent_name", "continent_name")
            .where("country.country_status = :status", { status: 1 })
            .andWhere("country.continent_name IS NOT NULL")
            .orderBy("country.continent_name", "ASC")
            .getRawMany();

        return result.map(r => r.continent_name);
    }

    /**
     * Get unique subcontinents
     * @returns List of subcontinents
     */
    static async getSubcontinents() {
        const result = await CountryRepository
            .createQueryBuilder("country")
            .select("DISTINCT country.subcontinent_name", "subcontinent_name")
            .where("country.country_status = :status", { status: 1 })
            .andWhere("country.subcontinent_name IS NOT NULL")
            .orderBy("country.subcontinent_name", "ASC")
            .getRawMany();

        return result.map(r => r.subcontinent_name);
    }
}
