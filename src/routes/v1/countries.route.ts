import { Router } from 'express';
import { body, param, query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { CountryController } from '../../controllers/country.controller';

const router = Router();

/**
 * @swagger
 * /v1/countries:
 *   get:
 *     summary: Get all countries with pagination
 *     description: Retrieves a paginated list of all active countries
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country_id:
 *                         type: integer
 *                         example: 1
 *                       country_iso2:
 *                         type: string
 *                         example: US
 *                       country_iso3:
 *                         type: string
 *                         example: USA
 *                       country_name:
 *                         type: string
 *                         example: United States
 *                       prefix_cellphone:
 *                         type: string
 *                         example: "+1"
 *                       continent_name:
 *                         type: string
 *                         example: North America
 *                       subcontinent_name:
 *                         type: string
 *                         example: Northern America
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 195
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     lastPage:
 *                       type: integer
 *                       example: 20
 *                 message:
 *                   type: string
 *                   example: Countries retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized access
 */
router.get('/',
    [
        authMiddleware,
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        validatorRequestMiddleware
    ],
    CountryController.list
);

/**
 * @swagger
 * /v1/countries/all:
 *   get:
 *     summary: Get all countries without pagination
 *     description: Retrieves all active countries without pagination
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                   example: 195
 *                 message:
 *                   type: string
 *                   example: All countries retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/all',
    [authMiddleware],
    CountryController.listAll
);

/**
 * @swagger
 * /v1/countries/continents:
 *   get:
 *     summary: Get list of continents
 *     description: Retrieves a unique list of all continents
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Continents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica"]
 *                 total:
 *                   type: integer
 *                   example: 7
 *                 message:
 *                   type: string
 *                   example: Continents retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/continents',
    [authMiddleware],
    CountryController.getContinents
);

/**
 * @swagger
 * /v1/countries/subcontinents:
 *   get:
 *     summary: Get list of subcontinents
 *     description: Retrieves a unique list of all subcontinents
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subcontinents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Northern America", "Central America", "South America", "Caribbean"]
 *                 total:
 *                   type: integer
 *                   example: 22
 *                 message:
 *                   type: string
 *                   example: Subcontinents retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/subcontinents',
    [authMiddleware],
    CountryController.getSubcontinents
);

/**
 * @swagger
 * /v1/countries/continent/{continent}:
 *   get:
 *     summary: Get countries by continent
 *     description: Retrieves countries filtered by continent with pagination
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: continent
 *         required: true
 *         schema:
 *           type: string
 *         description: Continent name
 *         example: Europe
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Countries in continent retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Countries in Europe retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/continent/:continent',
    [
        authMiddleware,
        param('continent').notEmpty().withMessage('Continent name is required'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        validatorRequestMiddleware
    ],
    CountryController.getByContinent
);

/**
 * @swagger
 * /v1/countries/subcontinent/{subcontinent}:
 *   get:
 *     summary: Get countries by subcontinent
 *     description: Retrieves countries filtered by subcontinent with pagination
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subcontinent
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcontinent name
 *         example: Southern Europe
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Countries in subcontinent retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Countries in Southern Europe retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/subcontinent/:subcontinent',
    [
        authMiddleware,
        param('subcontinent').notEmpty().withMessage('Subcontinent name is required'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        validatorRequestMiddleware
    ],
    CountryController.getBySubcontinent
);

/**
 * @swagger
 * /v1/countries/iso2/{iso2}:
 *   get:
 *     summary: Get country by ISO2 code
 *     description: Retrieves a country by its 2-letter ISO code
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: iso2
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 2
 *         description: ISO2 country code
 *         example: US
 *     responses:
 *       200:
 *         description: Country retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     country_id:
 *                       type: integer
 *                       example: 1
 *                     country_iso2:
 *                       type: string
 *                       example: US
 *                     country_iso3:
 *                       type: string
 *                       example: USA
 *                     country_name:
 *                       type: string
 *                       example: United States
 *                 message:
 *                   type: string
 *                   example: Country retrieved successfully
 *       400:
 *         description: Invalid ISO2 code
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Country not found
 */
router.get('/iso2/:iso2',
    [
        authMiddleware,
        param('iso2').isLength({ min: 2, max: 2 }).withMessage('ISO2 code must be 2 characters'),
        validatorRequestMiddleware
    ],
    CountryController.getByIso2
);

/**
 * @swagger
 * /v1/countries/{id}:
 *   get:
 *     summary: Get country by ID
 *     description: Retrieves a country by its ID
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Country retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Country retrieved successfully
 *       400:
 *         description: Invalid country ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Country not found
 */
router.get('/:id',
    [
        authMiddleware,
        param('id').isInt({ min: 1 }).withMessage('Country ID must be a positive integer'),
        validatorRequestMiddleware
    ],
    CountryController.getById
);

/**
 * @swagger
 * /v1/countries:
 *   post:
 *     summary: Create a new country
 *     description: Creates a new country (Admin only)
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country_iso2
 *               - country_iso3
 *               - country_name
 *             properties:
 *               country_iso2:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 description: ISO2 country code
 *                 example: US
 *               country_iso3:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *                 description: ISO3 country code
 *                 example: USA
 *               country_name:
 *                 type: string
 *                 description: Country name
 *                 example: United States
 *               prefix_cellphone:
 *                 type: string
 *                 description: Phone prefix
 *                 example: "+1"
 *               country_language:
 *                 type: string
 *                 description: Official language
 *                 example: English
 *               continent_name:
 *                 type: string
 *                 description: Continent name
 *                 example: North America
 *               subcontinent_name:
 *                 type: string
 *                 description: Subcontinent name
 *                 example: Northern America
 *               mask_phone:
 *                 type: string
 *                 description: Phone mask format
 *                 example: "(###) ###-####"
 *     responses:
 *       201:
 *         description: Country created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: Country created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/',
    [
        authMiddleware,
        body('country_iso2')
            .notEmpty().withMessage('ISO2 code is required')
            .isLength({ min: 2, max: 2 }).withMessage('ISO2 code must be 2 characters'),
        body('country_iso3')
            .notEmpty().withMessage('ISO3 code is required')
            .isLength({ min: 3, max: 3 }).withMessage('ISO3 code must be 3 characters'),
        body('country_name')
            .notEmpty().withMessage('Country name is required')
            .isString().withMessage('Country name must be a string'),
        body('prefix_cellphone').optional().isString(),
        body('country_language').optional().isString(),
        body('continent_name').optional().isString(),
        body('subcontinent_name').optional().isString(),
        body('mask_phone').optional().isString(),
        validatorRequestMiddleware
    ],
    CountryController.create
);

/**
 * @swagger
 * /v1/countries/{id}:
 *   put:
 *     summary: Update a country
 *     description: Updates an existing country (Admin only)
 *     tags: [countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Country ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country_name:
 *                 type: string
 *                 description: Country name
 *               country_status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: Status (0=inactive, 1=active)
 *               country_language:
 *                 type: string
 *                 description: Official language
 *               prefix_cellphone:
 *                 type: string
 *                 description: Phone prefix
 *               mask_phone:
 *                 type: string
 *                 description: Phone mask format
 *     responses:
 *       200:
 *         description: Country updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Country updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Country not found
 */
router.put('/:id',
    [
        authMiddleware,
        param('id').isInt({ min: 1 }).withMessage('Country ID must be a positive integer'),
        body('country_name').optional().isString().withMessage('Country name must be a string'),
        body('country_status').optional().isInt().isIn([0, 1]).withMessage('Status must be 0 or 1'),
        body('country_language').optional().isString(),
        body('prefix_cellphone').optional().isString(),
        body('mask_phone').optional().isString(),
        validatorRequestMiddleware
    ],
    CountryController.update
);

export default router;
