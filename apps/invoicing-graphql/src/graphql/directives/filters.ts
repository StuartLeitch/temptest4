/* eslint-disable max-len */

import { SchemaDirectiveVisitor } from "graphql-tools";
import {
  GraphQLField,
  GraphQLList,
  GraphQLObjectType, isObjectType
} from 'graphql';
import {
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLScalarType
} from 'graphql/type/definition';

const _prototypes = new WeakMap;


export class FiltersDirective extends SchemaDirectiveVisitor {
  // visitSchema(schema: GraphQLSchema) {
  // }

  visitObject<TSource, TContext, TArgs>(target: GraphQLObjectType<TSource, TContext, TArgs>) {
    Object.defineProperties(target['_fields'], Object.fromEntries(
      Object.entries(target.getFields())
        .map(([key, field]) =>
          [`_${key}`, {
            value: FilterPrototype(field),
            enumerable: false,
            configurable: true,
            writable: false
          }])
      ));
  }
}

function FilterPrototype<TSource, TContext, TArgs>(field: GraphQLField<TSource, TContext, TArgs>) {
  const { name, type } = field;
  return {
    name: `~${name}`,
    description: `@${name}/filter`,
    type: FiltersPrototype(type),
    args: ArgumentsPrototype(field),
    // resolve(source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) {
    //   console.info('[RESOLVE]', name, [context, info], '[/RESOLVE]');
    //   return FilterResult(context, info);
    // }
  };
}

function FiltersPrototype(type: GraphQLOutputType) {
  const resolvedType = resolveType(type);
  if (!_prototypes.has(resolvedType)) {
    const { name } = resolvedType as any;
    const config = {
      name: `~${name}`,
      description: `^${name}/filters`,
    };

    if (isObjectType(resolvedType)) {
      _prototypes.set(resolvedType, new GraphQLObjectType({
        ...config,
        fields() {
          return FieldsPrototype(resolvedType);
        }
      }));
    } else {
      _prototypes.set(resolvedType, new GraphQLScalarType({
        ...config,
        serialize(value: any) {
          // TODO
        }
      }));
    }
  }

  return _prototypes.get(type);
}

function ArgumentsPrototype<TSource, TContext, TArgs>(field: GraphQLField<TSource, TContext, TArgs>) {
  const { type } = field;
  const resolvedType = resolveType(type);
  if (isObjectType(resolvedType))
    return {};

  return {
    eq: {
      name: 'eq',
      type
    },
    in: {
      name: 'in',
      type: GraphQLList
    }
  } as any;
}

function FieldsPrototype<TSource, TContext, TArgs>(type: GraphQLObjectType<TSource, TContext, TArgs>) {
  return Object.fromEntries(
    Object.entries(type.getFields())
      .map(([key, field]: [string, GraphQLField<TSource, TContext, TArgs>]) => {
        return [key, FilterPrototype(field)];
      })
  );
}

function resolveType(type: GraphQLOutputType) {
  if (type instanceof GraphQLList)
    return resolveType(type.ofType);

  return type;
}

function FilterResult<TContext>(context: TContext, info: GraphQLResolveInfo) {
  const { variableValues: variables, operation: { variableDefinitions }} = info;
  const definitions = new Map(
    variableDefinitions.map(definition => [definition.variable.name.value, definition])
  );
  return {
    context,
    info: {
      ...info,
      variables: Object.entries(variables).map(([name, value]) => {
        return { ...definitions.get(name), name, value };
      }),
    }
  };
}
