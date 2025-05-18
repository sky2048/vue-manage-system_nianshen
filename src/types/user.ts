export interface User {
    id: number;
    username: string;
    password?: string;
    phone?: string;
    role: string;
    status: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Register {
    username: string;
    password: string;
    phone: string;
}

export interface LoginFormData {
    username: string;
    password: string;
}

export interface UserQueryParams {
    username?: string;
    status?: string;
}

export interface UserResponse {
    success: boolean;
    data: User[] | User;
    message?: string;
}