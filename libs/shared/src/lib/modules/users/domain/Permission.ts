/**
 * @description
 * Represents the inner `Permission` class that defines the granted or denied
 *  access permissions for the target resource or role.
 *
 *  You can check for a permission in two ways:
 *
 *  <ul>
 *  <li>
 *  You can first obtain a {@link ?api=ac#AccessControl~Query|`Query` instance}
 *  via {@link ?api=ac#AccessControl#can|`AccessControl#can`} which returns
 *  a `Permission` instance when an action method such as
 *  {@link ?api=ac#AccessControl~Query#createAny|`.createAny()`} is
 *  called.
 *  <p><pre><code> var permission = ac.can('user').createAny('video');
 *  console.log(permission.granted); // boolean</code></pre></p>
 *  </li>
 *  <li>
 *  Or you can call {@link ?api=ac#AccessControl#permission|`AccessControl#permission`}
 *  by passing a fulfilled {@link ?api=ac#AccessControl#IQueryInfo|`IQueryInfo` object}.
 *  <p><pre><code> var permission = ac.permission({
 *      role: 'user',
 *      resource: 'video',
 *      action: 'create',
 *      possession: 'any'
 *  });
 *  console.log(permission.granted); // boolean</code></pre></p>
 *  </li>
 *  </ul>
 *
 *  @class
 *  @inner
 *  @memberof AccessControl
 */
export class Permission {}
