import { AxiosError } from "axios";

export default {
    get: jest.fn(),
    post: jest.fn(),
    
    isAxiosError: jest.fn((error: any): error is AxiosError => error.isAxiosError === true),
};

