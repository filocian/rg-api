export interface RefreshToken {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    created_at: Date;
}

export interface AccessToken {
    id: string;
    user_id: string;
    expires_at: Date;
    created_at: Date;
}

export interface ISessionRepository {
    // Refresh Tokens
    saveRefreshToken(token: Omit<RefreshToken, 'id' | 'created_at'>): Promise<void>;
    findRefreshTokenByHash(hash: string): Promise<RefreshToken | null>;
    deleteRefreshToken(id: string): Promise<void>;
    deleteAllRefreshTokensForUser(userId: string): Promise<void>;

    // Access Tokens (Sessions)
    saveAccessToken(token: Omit<AccessToken, 'created_at'>): Promise<void>;
    deleteAccessToken(id: string): Promise<void>;
}
