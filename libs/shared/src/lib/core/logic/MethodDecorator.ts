/**
 * * Method decorator function
 * @arguments
 *    target — current object’s prototype i.e — If Employee is an Object, Employee.prototype
 *    propertyKey — name of the method
 *    descriptor — property descriptor of the method i.e — Object.getOwnPropertyDescriptor(Employee.prototype, propertyKey)
 */
export type MethodDecorator<O = Record<string, any>> = <T>(
  target: O,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
