import { logger } from '../../src/lib/logger';

describe('logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('loguea info como JSON con nivel, mensaje y timestamp', () => {
    logger.info('algo paso', { requestId: 'abc-123' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.level).toBe('info');
    expect(logged.message).toBe('algo paso');
    expect(logged.requestId).toBe('abc-123');
    expect(typeof logged.timestamp).toBe('string');
  });

  it('redacta campos sensibles en vez de loguearlos en texto plano', () => {
    logger.error('fallo de auth', {
      token: 'super-secreto',
      authorization: 'Bearer xyz',
      userId: 'u1',
    });

    const logged = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(logged.token).toBe('[REDACTED]');
    expect(logged.authorization).toBe('[REDACTED]');
    expect(logged.userId).toBe('u1');
  });
});
