import { Request, Response } from "express";
import { CountryService } from "../services/CountryService";
import messages from "../config/messages";

export class CountryController {
    /**
     * List all countries with pagination
     * @param req Request object
     * @param res Response object
     * @returns List of countries
     */
    static async list(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            
            if (page < 1 || limit < 1) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid pagination parameters" 
                });
            }

            const offset = (page - 1) * limit;
            const { countries, total } = await CountryService.findCountries(offset, limit);

            const totalPages = Math.ceil(total / limit);

            return res.json({
                success: true,
                data: countries,
                pagination: {
                    total,
                    perPage: limit,
                    currentPage: page,
                    lastPage: totalPages
                },
                message: "Countries retrieved successfully"
            });
        } catch (error) {
            console.error("Error fetching countries:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get all countries without pagination
     * @param req Request object
     * @param res Response object
     * @returns All active countries
     */
    static async listAll(req: Request, res: Response) {
        try {
            const countries = await CountryService.findAllCountries();

            return res.json({
                success: true,
                data: countries,
                total: countries.length,
                message: "All countries retrieved successfully"
            });
        } catch (error) {
            console.error("Error fetching all countries:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get country by ID
     * @param req Request object
     * @param res Response object
     * @returns Country details
     */
    static async getById(req: Request, res: Response) {
        try {
            const country_id = parseInt(req.params.id, 10);
            
            if (!country_id || isNaN(country_id)) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid country ID" 
                });
            }

            const country = await CountryService.findCountryById(country_id);
            
            if (!country) {
                return res.status(404).json({ 
                    success: false,
                    message: messages.Country?.country_not_exists || "Country not found" 
                });
            }

            return res.json({
                success: true,
                data: country,
                message: "Country retrieved successfully"
            });
        } catch (error) {
            console.error("Error fetching country:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get country by ISO2 code
     * @param req Request object
     * @param res Response object
     * @returns Country details
     */
    static async getByIso2(req: Request, res: Response) {
        try {
            const { iso2 } = req.params;
            
            if (!iso2 || iso2.length !== 2) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid ISO2 code" 
                });
            }

            const country = await CountryService.findCountryByIso2(iso2.toUpperCase());
            
            if (!country) {
                return res.status(404).json({ 
                    success: false,
                    message: messages.Country?.country_not_exists || "Country not found" 
                });
            }

            return res.json({
                success: true,
                data: country,
                message: "Country retrieved successfully"
            });
        } catch (error) {
            console.error("Error fetching country by ISO2:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get countries by continent
     * @param req Request object
     * @param res Response object
     * @returns List of countries in continent
     */
    static async getByContinent(req: Request, res: Response) {
        try {
            const { continent } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            
            if (page < 1 || limit < 1) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid pagination parameters" 
                });
            }

            const offset = (page - 1) * limit;
            const { countries, total } = await CountryService.findCountriesByContinent(continent, offset, limit);

            const totalPages = Math.ceil(total / limit);

            return res.json({
                success: true,
                data: countries,
                pagination: {
                    total,
                    perPage: limit,
                    currentPage: page,
                    lastPage: totalPages
                },
                message: `Countries in ${continent} retrieved successfully`
            });
        } catch (error) {
            console.error("Error fetching countries by continent:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get countries by subcontinent
     * @param req Request object
     * @param res Response object
     * @returns List of countries in subcontinent
     */
    static async getBySubcontinent(req: Request, res: Response) {
        try {
            const { subcontinent } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            
            if (page < 1 || limit < 1) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid pagination parameters" 
                });
            }

            const offset = (page - 1) * limit;
            const { countries, total } = await CountryService.findCountriesBySubcontinent(subcontinent, offset, limit);

            const totalPages = Math.ceil(total / limit);

            return res.json({
                success: true,
                data: countries,
                pagination: {
                    total,
                    perPage: limit,
                    currentPage: page,
                    lastPage: totalPages
                },
                message: `Countries in ${subcontinent} retrieved successfully`
            });
        } catch (error) {
            console.error("Error fetching countries by subcontinent:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get list of continents
     * @param req Request object
     * @param res Response object
     * @returns List of continents
     */
    static async getContinents(req: Request, res: Response) {
        try {
            const continents = await CountryService.getContinents();

            return res.json({
                success: true,
                data: continents,
                total: continents.length,
                message: "Continents retrieved successfully"
            });
        } catch (error) {
            console.error("Error fetching continents:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Get list of subcontinents
     * @param req Request object
     * @param res Response object
     * @returns List of subcontinents
     */
    static async getSubcontinents(req: Request, res: Response) {
        try {
            const subcontinents = await CountryService.getSubcontinents();

            return res.json({
                success: true,
                data: subcontinents,
                total: subcontinents.length,
                message: "Subcontinents retrieved successfully"
            });
        } catch (error) {
            console.error("Error fetching subcontinents:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Create a new country
     * @param req Request object
     * @param res Response object
     * @returns Created country
     */
    static async create(req: Request, res: Response) {
        try {
            const countryData = req.body;
            const country = await CountryService.create(countryData);

            return res.status(201).json({
                success: true,
                data: country,
                message: messages.Country?.country_created || "Country created successfully"
            });
        } catch (error) {
            console.error("Error creating country:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    /**
     * Update a country
     * @param req Request object
     * @param res Response object
     * @returns Success message
     */
    static async update(req: Request, res: Response) {
        try {
            const country_id = parseInt(req.params.id, 10);
            
            if (!country_id || isNaN(country_id)) {
                return res.status(400).json({ 
                    success: false,
                    message: "Invalid country ID" 
                });
            }

            const country = await CountryService.findCountryById(country_id);
            
            if (!country) {
                return res.status(404).json({ 
                    success: false,
                    message: messages.Country?.country_not_exists || "Country not found" 
                });
            }

            const response = await CountryService.update(country, req.body);
            
            return res.json({
                success: true,
                ...response
            });
        } catch (error) {
            console.error("Error updating country:", error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}
