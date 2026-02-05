import { AccessToken, ISessionRepository, RefreshToken } from '../../domain/session.repository.interface.ts';
import { db } from '../database/db.ts';

export class SqlSessionRepository implements ISessionRepository {
    
    async saveRefreshToken(token: Omit<RefreshToken, 'id' | 'created_at'>): Promise<void> {
        await db.insertInto('refresh_tokens')
            .values(token)
            .execute();
    }

    async findRefreshTokenByHash(hash: string): Promise<RefreshToken | null> {
        const result = await db.selectFrom('refresh_tokens')
            .selectAll()
            .where('token_hash', '=', hash)
            .executeTakeFirst();

        return result || null;
    }

    async deleteRefreshToken(id: string): Promise<void> {
        await db.deleteFrom('refresh_tokens')
            .where('id', '=', id)
            .execute();
    }

    async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
        await db.deleteFrom('refresh_tokens')
            .where('user_id', '=', userId)
            .execute();
    }

    async saveAccessToken(token: Omit<AccessToken, 'created_at'>): Promise<void> {
        await db.insertInto('access_tokens')
            .values({
                id: token.id,
                user_id: token.user_id,
                expires_at: token.expires_at
            })
            .execute();
    }

    async deleteAccessToken(id: string): Promise<void> {
        await db.deleteFrom('access_tokens')
            .where('id', '=', id)
            .execute();
    }
}
