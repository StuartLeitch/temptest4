// import * as express from 'express';

export abstract class BaseController {
  // or even private
  private request: any;
  private response: any;

  protected abstract executeImpl(): Promise<void | any>;

  public execute(request: any, response: any): void {
    this.request = request;
    this.response = response;

    this.executeImpl();
  }

  public static jsonResponse(response: any, code: number, message: string) {
    return response.status(code).json({ message });
  }

  public ok<T>(response: any, dto?: T) {
    if (dto) {
      return response.status(200).json(dto);
    } else {
      return response.sendStatus(200);
    }
  }

  public created(response: any) {
    return response.sendStatus(201);
  }

  public clientError(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      400,
      message ? message : 'Unauthorized'
    );
  }

  public unauthorized(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      401,
      message ? message : 'Unauthorized'
    );
  }

  public paymentRequired(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      402,
      message ? message : 'Payment required'
    );
  }

  public forbidden(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      403,
      message ? message : 'Forbidden'
    );
  }

  public notFound(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      404,
      message ? message : 'Not found'
    );
  }

  public conflict(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      409,
      message ? message : 'Conflict'
    );
  }

  public tooMany(message?: string) {
    return BaseController.jsonResponse(
      this.response,
      429,
      message ? message : 'Too many requests'
    );
  }

  public todo() {
    return BaseController.jsonResponse(this.response, 400, 'TODO');
  }

  public fail(error: Error | string) {
    console.log(error);
    return this.response.status(500).json({
      message: error.toString()
    });
  }
}
