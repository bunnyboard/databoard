import logger from '../lib/logger';

export default class ExecuteSession {
  private _sessionStart: number = 0;

  public startSessionMuted() {
    this._sessionStart = new Date().getTime();
  }

  public startSession(message: string, props: any) {
    this._sessionStart = new Date().getTime();

    logger.info(message, props);
  }

  public endSession(message: string, props: any) {
    const endExeTime = new Date().getTime();
    const elapsed = endExeTime - this._sessionStart;

    logger.info(message, {
      ...props,
      took: `${elapsed}ms`,
    });

    // reset session
    this._sessionStart = 0;
  }
}
