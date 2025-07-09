import {  Response } from "express";

interface Pagination {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
}

export function successResponse(res: Response, message: string = 'Success', code: number = 200, data: any = null, pagination?: Pagination) {
    const response: any = {
        success: true,
        message,
        data
      };
    
      if (pagination) {
        response.pagination = pagination;
      }
    return res.status(code).json({ response });
}

export function errorResponse(res: Response, message: string = 'Error', code: number = 500, errors : any = null) {
    return res.status(code).json({ success: false, message, errors });
}