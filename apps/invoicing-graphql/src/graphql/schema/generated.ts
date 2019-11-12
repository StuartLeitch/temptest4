import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Invoice = {
   __typename?: 'Invoice',
  id?: Maybe<Scalars['String']>,
  dateCreated?: Maybe<Scalars['String']>,
  dateChanged?: Maybe<Scalars['String']>,
  vat?: Maybe<Scalars['Float']>,
  charge?: Maybe<Scalars['Float']>,
  status?: Maybe<InvoiceStatus>,
  payer?: Maybe<Payer>,
};

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FINAL = 'FINAL'
}

export type Mutation = {
   __typename?: 'Mutation',
  updateInvoicePayer: Payer,
  createInvoice?: Maybe<Invoice>,
  deleteInvoice?: Maybe<Scalars['Boolean']>,
};


export type MutationUpdateInvoicePayerArgs = {
  payerId: Scalars['String'],
  payer: PayerInput
};


export type MutationCreateInvoiceArgs = {
  totalAmount?: Maybe<Scalars['Float']>
};


export type MutationDeleteInvoiceArgs = {
  id: Scalars['String']
};

export type Payer = {
   __typename?: 'Payer',
  id?: Maybe<Scalars['String']>,
  type?: Maybe<PayerType>,
  name?: Maybe<Scalars['String']>,
  city?: Maybe<Scalars['String']>,
  email?: Maybe<Scalars['String']>,
  country?: Maybe<Scalars['String']>,
  billingAddress?: Maybe<Scalars['String']>,
  organization?: Maybe<Scalars['String']>,
};

export type PayerInput = {
  type?: Maybe<PayerType>,
  name?: Maybe<Scalars['String']>,
  city?: Maybe<Scalars['String']>,
  email?: Maybe<Scalars['String']>,
  country?: Maybe<Scalars['String']>,
  billingAddress?: Maybe<Scalars['String']>,
  organization?: Maybe<Scalars['String']>,
};

export enum PayerType {
  INSTITUTION = 'INSTITUTION',
  INDIVIDUAL = 'INDIVIDUAL'
}

export type Query = {
   __typename?: 'Query',
  invoice?: Maybe<Invoice>,
  echo?: Maybe<Scalars['String']>,
};


export type QueryInvoiceArgs = {
  id?: Maybe<Scalars['String']>
};


export type QueryEchoArgs = {
  value?: Maybe<Scalars['String']>
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Invoice: ResolverTypeWrapper<Invoice>,
  Float: ResolverTypeWrapper<Scalars['Float']>,
  InvoiceStatus: InvoiceStatus,
  Payer: ResolverTypeWrapper<Payer>,
  PayerType: PayerType,
  Mutation: ResolverTypeWrapper<{}>,
  PayerInput: PayerInput,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  String: Scalars['String'],
  Invoice: Invoice,
  Float: Scalars['Float'],
  InvoiceStatus: InvoiceStatus,
  Payer: Payer,
  PayerType: PayerType,
  Mutation: {},
  PayerInput: PayerInput,
  Boolean: Scalars['Boolean'],
};

export type InvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Invoice'] = ResolversParentTypes['Invoice']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  dateCreated?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  dateChanged?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  vat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>,
  charge?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>,
  status?: Resolver<Maybe<ResolversTypes['InvoiceStatus']>, ParentType, ContextType>,
  payer?: Resolver<Maybe<ResolversTypes['Payer']>, ParentType, ContextType>,
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateInvoicePayer?: Resolver<ResolversTypes['Payer'], ParentType, ContextType, RequireFields<MutationUpdateInvoicePayerArgs, 'payerId' | 'payer'>>,
  createInvoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, MutationCreateInvoiceArgs>,
  deleteInvoice?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteInvoiceArgs, 'id'>>,
};

export type PayerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Payer'] = ResolversParentTypes['Payer']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  type?: Resolver<Maybe<ResolversTypes['PayerType']>, ParentType, ContextType>,
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  billingAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
  organization?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>,
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  invoice?: Resolver<Maybe<ResolversTypes['Invoice']>, ParentType, ContextType, QueryInvoiceArgs>,
  echo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, QueryEchoArgs>,
};

export type Resolvers<ContextType = any> = {
  Invoice?: InvoiceResolvers<ContextType>,
  Mutation?: MutationResolvers<ContextType>,
  Payer?: PayerResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
