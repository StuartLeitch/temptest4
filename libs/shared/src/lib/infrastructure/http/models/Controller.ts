export abstract class ControllerContract<Request, Response> {
  // or even private
  protected req: Request;
  protected res: Response;

  /* static methods */
  public static jsonResponse<RequestType extends any>(
    res: RequestType,
    code: number,
    message: string
  ) {
    return res.status(code).json({message});
  }

  protected abstract executeImpl(): Promise<void | any>;

  public async execute(req: Request, res: Response): Promise<void> {
    try {
      this.req = req;
      this.res = res;

      await this.executeImpl();
    } catch (err) {
      console.log(`[BaseController]: Uncaught controller error`);
      console.log(err);
      this.fail('An unexpected error occurred');
    }
  }

  public ok<T, ResponseType extends any>(res: ResponseType, dto?: T) {
    if (!!dto) {
      res.type('application/json');
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  public created<ResponseType extends any>(res: ResponseType) {
    return res.sendStatus(201);
  }

  public clientError(message?: string) {
    return BaseController.jsonResponse(
      this.res,
      400,
      message ? message : 'Unauthorized'
    );
  }

  public unauthorized(message?: string) {
    return BaseController.jsonResponse(
      this.res,
      401,
      message ? message : 'Unauthorized'
    );
  }

  public forbidden(message?: string) {
    return BaseController.jsonResponse(
      this.res,
      403,
      message ? message : 'Forbidden'
    );
  }

  public notFound(message?: string) {
    return BaseController.jsonResponse(
      this.res,
      404,
      message ? message : 'Not found'
    );
  }

  public conflict(message?: string) {
    return BaseController.jsonResponse(
      this.res,
      409,
      message ? message : 'Conflict'
    );
  }

  public tooMany(message?: string) {
    return BaseController.jsonResponse(
      this.res,
      429,
      message ? message : 'Too many requests'
    );
  }

  public todo() {
    return BaseController.jsonResponse(this.res, 400, 'TODO');
  }

  public fail(error: Error | string) {
    console.log(error);
    return (this.res as any).status(500).json({
      message: error.toString()
    });
  }
}
