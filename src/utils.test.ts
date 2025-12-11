
import {
    validateQuery,
    sanitizeConnectionId,
    getTestQuery,
    formatError
} from './utils';

describe('Utils Tests', () => {

    describe('validateQuery', () => {
        test('should return null for valid queries', () => {
            expect(validateQuery('SELECT * FROM users')).toBeNull();
            expect(validateQuery('  select id, name from test  ')).toBeNull();
        });

        test('should return error for empty queries', () => {
            expect(validateQuery('')).toBe('Query cannot be empty');
            expect(validateQuery('   ')).toBe('Query cannot be empty');
        });

        test('should block dangerous operations', () => {
            expect(validateQuery('DROP DATABASE mydb')).toContain('dangerous query');
            expect(validateQuery('dRoP dAtAbAsE some_db')).toContain('dangerous query');
            expect(validateQuery('TRUNCATE TABLE users')).toContain('dangerous query');
            expect(validateQuery('SHUTDOWN')).toContain('dangerous query');
        });

        // Note: The implementation returns specific messages, checking for substring match
        // Adjust expectations based on actual implementation return values
    });

    describe('sanitizeConnectionId', () => {
        test('should allow valid IDs', () => {
            expect(sanitizeConnectionId('valid-id_123')).toBe('valid-id_123');
            expect(sanitizeConnectionId('connection.1')).toBe('connection.1');
        });

        test('should throw error for empty IDs', () => {
            expect(() => sanitizeConnectionId('')).toThrow();
        });

        test('should strip invalid characters', () => {
            expect(sanitizeConnectionId('invalid/id')).toBe('invalidid');
            expect(sanitizeConnectionId('id with spaces')).toBe('idwithspaces');
            expect(sanitizeConnectionId('id$with@special#chars')).toBe('idwithspecialchars');
        });
    });

    describe('getTestQuery', () => {
        test('should return correct query for postgres', () => {
            expect(getTestQuery('postgres-jdbc')).toBe('SELECT version();');
            expect(getTestQuery('postgresql')).toBe('SELECT version();');
        });

        test('should return correct query for mysql', () => {
            expect(getTestQuery('mysql')).toBe('SELECT version();');
        });

        test('should return default query for unknown driver', () => {
            expect(getTestQuery('unknown-driver')).toBe('SELECT 1;');
        });
    });

    describe('formatError', () => {
        test('should return message from Error object', () => {
            const err = new Error('test error');
            expect(formatError(err)).toBe('test error');
        });

        test('should return string as is', () => {
            expect(formatError('string error')).toBe('string error');
        });
    });

});
