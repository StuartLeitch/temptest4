/* eslint-disable max-len */

import { SchemaDirectiveVisitor } from "graphql-tools";
import {
  ArgumentNode, DirectiveNode,
  GraphQLField,
  GraphQLList,
  GraphQLObjectType, GraphQLSkipDirective, isObjectType, NameNode, SelectionSetNode, ValueNode, VariableNode
} from 'graphql';
import {
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLScalarType
} from 'graphql/type/definition';
import { SelectionNode } from 'graphql/language/ast';

const _prototypes = new WeakMap;

export class FiltersDirective extends SchemaDirectiveVisitor {
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

function FilterPrototype<TSource, TContext extends any, TArgs extends any>(field: GraphQLField<TSource, TContext, TArgs>) {
  const { name, type } = field;
  return {
    name: `~${name}`,
    description: `@${name}/filter`,
    type: FiltersPrototype(type),
    args: ArgumentsPrototype(field),
    resolve(source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) {
      let filters;
      Object.defineProperty(context, 'filters', {
        configurable: true,
        enumerable: false,
        get() {
          if (filters == null) {
            filters = Filters(field, info);
          }
          return filters;
        }
      });
    }
  };
}



function Filters<TSource, TContext, TArgs>(field: GraphQLField<TSource, TContext, TArgs>, info: GraphQLResolveInfo) {
  const { selections } = info.operation.selectionSet;
  if (selections.length < 2)
    return {};

  const root = selections[1];
  if (!checkFilter(root))
    return {};

  return Bundle([field.name, build(root)]);

  function build(node: SelectionNode): Map<string, any> {
    const args = Arguments(node);
    let bundle, isValue;
    if (checkArray(args)) {
      const values = [];
      for (const arg of args) {
        const name = Name(arg);
        const value = Value(arg, (name, type) => {
          if (type == 'variable')
            return resolve(name);
        });
        if (value === undefined)
          continue;

        if (name == 'eq') {
          values.push(value);
        } else if (name == 'in') {
          values.push(...value);
        }
      }

      bundle = Bundle();
      if (values.length > 0) {
        bundle.set('in', values);
      }

      for (const directive of node.directives) {
        const name = Name(directive);
        bundle.set(Symbol.for(name), true);  // TODO: Handle directive arguments here
      }

      isValue = true;
    } else {
      const nodes = Nodes(node);
      if (nodes != null) {
        bundle = Bundle.map(nodes, node => [
          Name(node), build(node)
        ]);
      } else {
        bundle = Bundle();
      }
      isValue = false;
    }

    return Object.defineProperty(bundle, 'isValue', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: isValue
    });
  }

  function resolve(name: string) {
    return info.variableValues[name];
  }
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

function checkFilter(node: SelectionNode) {
  return /^_/.test(Name(node, ""));
}

function checkArray(array: readonly any[]) {
  return (array?.length ?? 0) > 0;
}

function Name(node: Named, fallback?: string): string {
  return ((node as any)?.name as NameNode)?.value ?? fallback;
}

function ValueType(name: string) {
  return name.replace(/Value$/, '').toLowerCase();
}

function Value(node: ArgumentNode, resolve: (name?: any, type?: string) => any): any {
  const { value } = node;
  if (value == null)
    return resolve();

  if (typeof value.kind != 'string')
    return resolve(value, value.kind);

  const type = ValueType(value.kind);
  switch (type) {
    case 'variable':
      return resolve(Name(value), type);

    default:
      return resolve((value as any).value, 'value');
  }
}

function Nodes(node: SelectionNode): readonly SelectionNode[] {
  const { selections } = (node as any)?.selectionSet as SelectionSetNode;
  return selections;
}

function Arguments(node: SelectionNode): readonly ArgumentNode[] {
  const args = (node as any).arguments as readonly ArgumentNode[];
  return args;
}

function Skipped(node: SelectionNode) {
  (node as any).directives.unshift({
    name: {
      value: GraphQLSkipDirective.name
    },
    arguments: [{
      name: { value: 'if' },
      value: {
        kind: 'BooleanValue',
        value: true
      }
    }]
  });

  return node;
}

Bundle._prototype = Object.entries({
  navigate(...keys) {
    let ret = this;
    for (let key of keys) {
      if (!ret.has(key))
        break;

      ret = ret.get(key);
      if (ret.isValue)
        break;
    }
    return ret;
  },

  with(key) {
    return this.isValue && this.has(key);
  }
});

Bundle.from = function<K, V>(items: [K, V][]): Map<K, V> {
  const ret = new Map(items);

  for (let [key, value] of Bundle._prototype) {
    Object.defineProperty(ret, key, {
      enumerable: false,
      configurable: true,
      writable: false,
      value
    });
  }

  return ret;
};

function Bundle<K, V>(...items: [K, V][]) {
  return Bundle.from(items)
}

Bundle.map = function<K, V>(src: readonly any[], cb: (item) => [K, V], self?: any): Map<K, V> {
  return Bundle(...src.map(cb, self));
};

type Named = SelectionNode | ArgumentNode | ValueNode | DirectiveNode;
