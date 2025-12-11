
import { DBeaverClient } from './dbeaver-client';
import { DBeaverConnection } from './types';
import { findDBeaverExecutable } from './utils';

// Mock dependencies
jest.mock('./utils', () => ({
    findDBeaverExecutable: jest.fn().mockReturnValue('/mock/path/dbeaver'),
    getTestQuery: jest.fn().mockReturnValue('SELECT 1'),
    parseVersionFromResult: jest.fn().mockReturnValue('1.0.0'),
    buildSchemaQuery: jest.fn().mockReturnValue('SELECT * FROM schema'),
    buildListTablesQuery: jest.fn().mockReturnValue('SELECT * FROM tables')
}));

describe('DBeaverClient', () => {
    let client: DBeaverClient;
    const mockConnection: DBeaverConnection = {
        id: 'test-conn',
        name: 'Test DB',
        driver: 'postgresql',
        url: '',
        folder: '',
        description: '',
        readonly: false
    };

    beforeEach(() => {
        client = new DBeaverClient();
    });

    test('should initialize with default executable path', () => {
        expect(findDBeaverExecutable).toHaveBeenCalled();
        // Accessing private property for testing
        expect((client as any).executablePath).toBe('/mock/path/dbeaver');
    });

    test('testConnection should return success result on valid query', async () => {
        // Mock executeQuery to return success
        // We use spyOn to mock the method of the instance
        const mockExecute = jest.spyOn(DBeaverClient.prototype as any, 'executeQuery').mockResolvedValue({
            columns: ['version'],
            rows: [['1.0.0']],
            rowCount: 1,
            executionTime: 10
        });

        const result = await client.testConnection(mockConnection);

        expect(result.success).toBe(true);
        expect(result.connectionId).toBe('test-conn');
        expect(result.databaseVersion).toBe('1.0.0');

        mockExecute.mockRestore();
    });

    test('testConnection should return failure result on error', async () => {
        // Mock executeQuery to throw
        const mockExecute = jest.spyOn(DBeaverClient.prototype as any, 'executeQuery').mockRejectedValue(new Error('Connection failed'));

        const result = await client.testConnection(mockConnection);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Connection failed');

        mockExecute.mockRestore();
    });

    test('exportData should call dbeaver with correct arguments', async () => {
        // Mock private executeDBeaver
        const executeSpy = jest.spyOn(client as any, 'executeDBeaver').mockResolvedValue(undefined);
        // Mock fs to ensure file checks pass
        const existsSpy = jest.spyOn(require('fs'), 'existsSync').mockReturnValue(true);
        const writeSpy = jest.spyOn(require('fs'), 'writeFileSync').mockImplementation(() => { });

        const exportPath = await client.exportData(mockConnection, 'SELECT * FROM test', { format: 'csv', includeHeaders: true });

        expect(executeSpy).toHaveBeenCalled();
        const args = executeSpy.mock.calls[0][0] as string[];
        expect(args).toContain('-con');
        expect(args).toContain('-f');
        expect(args).toContain('-o');

        executeSpy.mockRestore();
        existsSpy.mockRestore();
        writeSpy.mockRestore();
    });

});
