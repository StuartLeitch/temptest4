(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./apps/invoicing-graphql/src/app/context.ts":
/*!***************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/context.ts ***!
  \***************************************************/
/*! exports provided: makeContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeContext", function() { return makeContext; });
/* harmony import */ var _hindawi_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hindawi/shared */ "./libs/shared/src/index.ts");

function makeContext(db) {
    return () => ({
        repos: {
            invoice: new _hindawi_shared__WEBPACK_IMPORTED_MODULE_0__["KnexInvoiceRepo"](db),
            transaction: new _hindawi_shared__WEBPACK_IMPORTED_MODULE_0__["KnexTransactionRepo"](db)
        }
    });
}


/***/ }),

/***/ "./apps/invoicing-graphql/src/app/resolvers/echo.ts":
/*!**********************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/resolvers/echo.ts ***!
  \**********************************************************/
/*! exports provided: echo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "echo", function() { return echo; });
const echo = {
    Query: {
        echo(parent, args) {
            return args.value;
        }
    }
};


/***/ }),

/***/ "./apps/invoicing-graphql/src/app/resolvers/index.ts":
/*!***********************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/resolvers/index.ts ***!
  \***********************************************************/
/*! exports provided: resolvers */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resolvers", function() { return resolvers; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _echo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./echo */ "./apps/invoicing-graphql/src/app/resolvers/echo.ts");
/* harmony import */ var _invoice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./invoice */ "./apps/invoicing-graphql/src/app/resolvers/invoice.ts");



const resolvers = Object(lodash__WEBPACK_IMPORTED_MODULE_0__["merge"])({}, _echo__WEBPACK_IMPORTED_MODULE_1__["echo"], _invoice__WEBPACK_IMPORTED_MODULE_2__["invoice"]);


/***/ }),

/***/ "./apps/invoicing-graphql/src/app/resolvers/invoice.ts":
/*!*************************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/resolvers/invoice.ts ***!
  \*************************************************************/
/*! exports provided: invoice */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invoice", function() { return invoice; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hindawi_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hindawi/shared */ "./libs/shared/src/index.ts");


const invoice = {
    Query: {
        invoice(parent, args, context, info) {
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
                const { repos } = context;
                const usecase = new _hindawi_shared__WEBPACK_IMPORTED_MODULE_1__["GetInvoiceDetailsUsecase"](repos.invoice);
                const request = {
                    invoiceId: args.id
                };
                const result = yield usecase.execute(request);
                if (!result.isSuccess) {
                    return undefined;
                }
                const invoice = result.getValue();
                return {
                    id: invoice.id.toString(),
                    invoice
                    // totalAmount: invoice.totalAmount,
                    // netAmount: invoice.netAmount
                };
            });
        }
    },
    Mutation: {
        deleteInvoice(parent, args, context) {
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
                const { repos } = context;
                const usecase = new _hindawi_shared__WEBPACK_IMPORTED_MODULE_1__["DeleteInvoiceUsecase"](repos.invoice);
                const request = {
                    invoiceId: args.id
                };
                const result = yield usecase.execute(request);
                return result.isSuccess;
            });
        },
        createInvoice(parent, args, context) {
            return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
                const { repos } = context;
                const usecase = new _hindawi_shared__WEBPACK_IMPORTED_MODULE_1__["CreateInvoiceUsecase"](repos.invoice, repos.transaction);
                const request = {
                    transactionId: 'transaction-1'
                };
                const result = yield usecase.execute(request);
                return _hindawi_shared__WEBPACK_IMPORTED_MODULE_1__["InvoiceMap"].toPersistence(result.getValue());
            });
        }
    }
};


/***/ }),

/***/ "./apps/invoicing-graphql/src/app/schema/generated.ts":
/*!************************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/schema/generated.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./apps/invoicing-graphql/src/app/schema/index.ts":
/*!********************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/schema/index.ts ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "typeDefs", function() { return typeDefs; });
/* harmony import */ var _generated__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./generated */ "./apps/invoicing-graphql/src/app/schema/generated.ts");
/* harmony import */ var _generated__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_generated__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _generated__WEBPACK_IMPORTED_MODULE_0__) if(["typeDefs","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _generated__WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
// eslint-disable-next-line
const typeDefs = __webpack_require__(/*! ./schema.graphql */ "./apps/invoicing-graphql/src/app/schema/schema.graphql");




/***/ }),

/***/ "./apps/invoicing-graphql/src/app/schema/schema.graphql":
/*!**************************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/schema/schema.graphql ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "type Invoice {\n  id: String\n  totalAmount: Float\n  netAmount: Float\n}\n\ntype Query {\n  invoice(id: String): Invoice!\n  echo(value: String): String\n}\n\ntype Mutation {\n  createInvoice(totalAmount: Float): Invoice\n  deleteInvoice(id: String!): Boolean\n}\n"

/***/ }),

/***/ "./apps/invoicing-graphql/src/app/server.ts":
/*!**************************************************!*\
  !*** ./apps/invoicing-graphql/src/app/server.ts ***!
  \**************************************************/
/*! exports provided: makeServer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeServer", function() { return makeServer; });
/* harmony import */ var apollo_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! apollo-server */ "apollo-server");
/* harmony import */ var apollo_server__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(apollo_server__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./schema */ "./apps/invoicing-graphql/src/app/schema/index.ts");
/* harmony import */ var _resolvers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./resolvers */ "./apps/invoicing-graphql/src/app/resolvers/index.ts");



function makeServer(context) {
    return new apollo_server__WEBPACK_IMPORTED_MODULE_0__["ApolloServer"]({
        typeDefs: _schema__WEBPACK_IMPORTED_MODULE_1__["typeDefs"],
        resolvers: _resolvers__WEBPACK_IMPORTED_MODULE_2__["resolvers"],
        context
    });
}


/***/ }),

/***/ "./apps/invoicing-graphql/src/main.ts":
/*!********************************************!*\
  !*** ./apps/invoicing-graphql/src/main.ts ***!
  \********************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hindawi_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hindawi/shared */ "./libs/shared/src/index.ts");
/* harmony import */ var _app_context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app/context */ "./apps/invoicing-graphql/src/app/context.ts");
/* harmony import */ var _app_server__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/server */ "./apps/invoicing-graphql/src/app/server.ts");



const db = Object(_hindawi_shared__WEBPACK_IMPORTED_MODULE_0__["KnexDB"])();
const context = Object(_app_context__WEBPACK_IMPORTED_MODULE_1__["makeContext"])(db);
const server = Object(_app_server__WEBPACK_IMPORTED_MODULE_2__["makeServer"])(context);
server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});


/***/ }),

/***/ "./libs/shared/src/index.ts":
/*!**********************************!*\
  !*** ./libs/shared/src/index.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/shared */ "./libs/shared/src/lib/shared.ts");
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _lib_shared__WEBPACK_IMPORTED_MODULE_0__) if(__WEBPACK_IMPORT_KEY__ !== 'default') (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _lib_shared__WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));



/***/ }),

/***/ "./libs/shared/src/lib/core/domain/AggregateRoot.ts":
/*!**********************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/AggregateRoot.ts ***!
  \**********************************************************/
/*! exports provided: AggregateRoot */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AggregateRoot", function() { return AggregateRoot; });
/* harmony import */ var _events_DomainEvents__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./events/DomainEvents */ "./libs/shared/src/lib/core/domain/events/DomainEvents.ts");
/* harmony import */ var _Entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");


class AggregateRoot extends _Entity__WEBPACK_IMPORTED_MODULE_1__["Entity"] {
    constructor() {
        super(...arguments);
        this._domainEvents = [];
    }
    get id() {
        return this._id;
    }
    get domainEvents() {
        return this._domainEvents;
    }
    addDomainEvent(domainEvent) {
        // Add the domain event to this aggregate's list of domain events
        this._domainEvents.push(domainEvent);
        // Add this aggregate instance to the domain event's list of aggregates who's
        // events it eventually needs to dispatch.
        _events_DomainEvents__WEBPACK_IMPORTED_MODULE_0__["DomainEvents"].markAggregateForDispatch(this);
        // Log the domain event
        this.logDomainEventAdded(domainEvent);
    }
    clearEvents() {
        this._domainEvents.splice(0, this._domainEvents.length);
    }
    logDomainEventAdded(domainEvent) {
        const thisClass = Reflect.getPrototypeOf(this);
        const domainEventClass = Reflect.getPrototypeOf(domainEvent);
        console.info(`[Domain Event Created]:`, thisClass.constructor.name, '==>', domainEventClass.constructor.name);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/domain/Entity.ts":
/*!***************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/Entity.ts ***!
  \***************************************************/
/*! exports provided: Entity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Entity", function() { return Entity; });
/* harmony import */ var _UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");

class Entity {
    constructor(props, id) {
        this._id = id ? id : new _UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"]();
        this.props = props;
    }
    equals(object) {
        if (object == null || object == undefined) {
            return false;
        }
        if (this === object) {
            return true;
        }
        if (!isEntity(object)) {
            return false;
        }
        return this._id.equals(object._id);
    }
}
const isEntity = (v) => {
    return v instanceof Entity;
};


/***/ }),

/***/ "./libs/shared/src/lib/core/domain/Identifier.ts":
/*!*******************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/Identifier.ts ***!
  \*******************************************************/
/*! exports provided: Identifier */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Identifier", function() { return Identifier; });
class Identifier {
    constructor(value) {
        this.value = value;
        this.value = value;
    }
    equals(id) {
        if (id === null || id === undefined) {
            return false;
        }
        if (!(id instanceof this.constructor)) {
            return false;
        }
        return id.toValue() === this.value;
    }
    toString() {
        return String(this.value);
    }
    /**
     * Return raw value of identifier
     */
    toValue() {
        return this.value;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts":
/*!***********************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/UniqueEntityID.ts ***!
  \***********************************************************/
/*! exports provided: UniqueEntityID */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UniqueEntityID", function() { return UniqueEntityID; });
/* harmony import */ var uuid_v4__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid/v4 */ "uuid/v4");
/* harmony import */ var uuid_v4__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uuid_v4__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Identifier__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Identifier */ "./libs/shared/src/lib/core/domain/Identifier.ts");


class UniqueEntityID extends _Identifier__WEBPACK_IMPORTED_MODULE_1__["Identifier"] {
    constructor(id) {
        super(id ? id : uuid_v4__WEBPACK_IMPORTED_MODULE_0___default()());
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/domain/ValueObject.ts":
/*!********************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/ValueObject.ts ***!
  \********************************************************/
/*! exports provided: ValueObject */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ValueObject", function() { return ValueObject; });
/* harmony import */ var shallow_equal_object__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! shallow-equal-object */ "shallow-equal-object");
/* harmony import */ var shallow_equal_object__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(shallow_equal_object__WEBPACK_IMPORTED_MODULE_0__);

/**
 * @description ValueObjects are objects that we determine their
 * equality through their structural property.
 */
class ValueObject {
    constructor(props) {
        this.props = Object.freeze(props);
    }
    equals(vo) {
        if (vo === null || vo === undefined) {
            return false;
        }
        if (vo.props === undefined) {
            return false;
        }
        return Object(shallow_equal_object__WEBPACK_IMPORTED_MODULE_0__["shallowEqual"])(this.props, vo.props);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/domain/WatchedList.ts":
/*!********************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/WatchedList.ts ***!
  \********************************************************/
/*! exports provided: WatchedList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WatchedList", function() { return WatchedList; });
class WatchedList {
    constructor(initialItems) {
        this.currentItems = initialItems ? initialItems : [];
        this.initial = initialItems ? initialItems : [];
        this.new = [];
        this.removed = [];
    }
    getItems() {
        return this.currentItems;
    }
    getNewItems() {
        return this.new;
    }
    getRemovedItems() {
        return this.removed;
    }
    isCurrentItem(item) {
        return (this.currentItems.filter((v) => this.compareItems(item, v)).length !==
            0);
    }
    isNewItem(item) {
        return this.new.filter((v) => this.compareItems(item, v)).length !== 0;
    }
    isRemovedItem(item) {
        return (this.removed.filter((v) => this.compareItems(item, v)).length !== 0);
    }
    removeFromNew(item) {
        this.new = this.new.filter(v => !this.compareItems(v, item));
    }
    removeFromCurrent(item) {
        this.currentItems = this.currentItems.filter(v => !this.compareItems(item, v));
    }
    removeFromRemoved(item) {
        this.removed = this.removed.filter(v => !this.compareItems(item, v));
    }
    wasAddedInitially(item) {
        return (this.initial.filter((v) => this.compareItems(item, v)).length !== 0);
    }
    exists(item) {
        return this.isCurrentItem(item);
    }
    add(item) {
        if (this.isRemovedItem(item)) {
            this.removeFromRemoved(item);
        }
        if (!this.isNewItem(item) && !this.wasAddedInitially(item)) {
            this.new.push(item);
        }
        if (!this.isCurrentItem(item)) {
            this.currentItems.push(item);
        }
    }
    remove(item) {
        this.removeFromCurrent(item);
        if (this.isNewItem(item)) {
            this.removeFromNew(item);
            return;
        }
        if (!this.isRemovedItem(item)) {
            this.removed.push(item);
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/domain/events/DomainEvents.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/core/domain/events/DomainEvents.ts ***!
  \****************************************************************/
/*! exports provided: DomainEvents */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomainEvents", function() { return DomainEvents; });
class DomainEvents {
    /**
     * @method markAggregateForDispatch
     * @static
     * @desc Called by aggregate root objects that have created domain
     * events to eventually be dispatched when the infrastructure commits
     * the unit of work.
     */
    static markAggregateForDispatch(aggregate) {
        const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);
        if (!aggregateFound) {
            this.markedAggregates.push(aggregate);
        }
    }
    static dispatchAggregateEvents(aggregate) {
        aggregate.domainEvents.forEach((event) => this.dispatch(event));
    }
    static removeAggregateFromMarkedDispatchList(aggregate) {
        const index = this.markedAggregates.findIndex(a => a.equals(aggregate));
        this.markedAggregates.splice(index, 1);
    }
    static findMarkedAggregateByID(id) {
        let found = null;
        for (const aggregate of this.markedAggregates) {
            if (aggregate.id.equals(id)) {
                found = aggregate;
            }
        }
        return found;
    }
    static dispatchEventsForAggregate(id) {
        const aggregate = this.findMarkedAggregateByID(id);
        if (aggregate) {
            this.dispatchAggregateEvents(aggregate);
            aggregate.clearEvents();
            this.removeAggregateFromMarkedDispatchList(aggregate);
        }
    }
    static register(callback, eventClassName) {
        if (!Object.hasOwnProperty.call(this.handlersMap, eventClassName)) {
            this.handlersMap[eventClassName] = [];
        }
        this.handlersMap[eventClassName].push(callback);
    }
    static clearHandlers() {
        this.handlersMap = {};
    }
    static clearMarkedAggregates() {
        this.markedAggregates = [];
    }
    static dispatch(event) {
        const eventClassName = event.constructor.name;
        if (Object.hasOwnProperty.call(this.handlersMap, eventClassName)) {
            const handlers = this.handlersMap[eventClassName];
            for (const handler of handlers) {
                handler(event);
            }
        }
    }
}
DomainEvents.handlersMap = {};
DomainEvents.markedAggregates = [];


/***/ }),

/***/ "./libs/shared/src/lib/core/logic/Guard.ts":
/*!*************************************************!*\
  !*** ./libs/shared/src/lib/core/logic/Guard.ts ***!
  \*************************************************/
/*! exports provided: Guard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Guard", function() { return Guard; });
class Guard {
    static combine(guardResults) {
        for (let result of guardResults) {
            if (result.succeeded === false)
                return result;
        }
        return { succeeded: true };
    }
    static greaterThan(minValue, actualValue) {
        return actualValue > minValue
            ? { succeeded: true }
            : {
                succeeded: false,
                message: `Number given {${actualValue}} is not greater than {${minValue}}`
            };
    }
    static againstNullOrUndefined(argument, argumentName) {
        if (argument === null || argument === undefined) {
            return {
                succeeded: false,
                message: `${argumentName} is null or undefined`
            };
        }
        else {
            return { succeeded: true };
        }
    }
    static againstAtLeast(numChars, text) {
        return text.length >= numChars
            ? { succeeded: true }
            : {
                succeeded: false,
                message: `Text is not at least ${numChars} chars.`
            };
    }
    static againstAtMost(numChars, text) {
        return text.length <= numChars
            ? { succeeded: true }
            : {
                succeeded: false,
                message: `Text is greater than ${numChars} chars.`
            };
    }
    static againstNullOrUndefinedBulk(args) {
        for (let arg of args) {
            const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
            if (!result.succeeded)
                return result;
        }
        return { succeeded: true, message: '' };
    }
    static isOneOf(value, validValues, argumentName) {
        let isValid = false;
        for (let validValue of validValues) {
            if (value === validValue) {
                isValid = true;
            }
        }
        if (isValid) {
            return { succeeded: true };
        }
        else {
            return {
                succeeded: false,
                message: `${argumentName} isn't oneOf the correct types in ${JSON.stringify(validValues)}. Got "${value}".`
            };
        }
    }
    static inRange(num, min, max, argumentName) {
        const isInRange = num >= min && num <= max;
        if (!isInRange) {
            return {
                succeeded: false,
                message: `${argumentName} is not within range ${min} to ${max}.`
            };
        }
        else {
            return { succeeded: true };
        }
    }
    static allInRange(numbers, min, max, argumentName) {
        let failingResult;
        for (let num of numbers) {
            const numIsInRangeResult = this.inRange(num, min, max, argumentName);
            if (!numIsInRangeResult.succeeded)
                failingResult = numIsInRangeResult;
        }
        if (failingResult) {
            return {
                succeeded: false,
                message: `${argumentName} is not within the range.`
            };
        }
        else {
            return { succeeded: true };
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/logic/Left.ts":
/*!************************************************!*\
  !*** ./libs/shared/src/lib/core/logic/Left.ts ***!
  \************************************************/
/*! exports provided: Left */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Left", function() { return Left; });
class Left {
    constructor(value) {
        this.value = value;
    }
    isLeft() {
        return true;
    }
    isRight() {
        return false;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/logic/Result.ts":
/*!**************************************************!*\
  !*** ./libs/shared/src/lib/core/logic/Result.ts ***!
  \**************************************************/
/*! exports provided: left, right, Result */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "left", function() { return left; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "right", function() { return right; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Result", function() { return Result; });
/* harmony import */ var _Left__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Left */ "./libs/shared/src/lib/core/logic/Left.ts");
/* harmony import */ var _Right__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Right */ "./libs/shared/src/lib/core/logic/Right.ts");


const left = (l) => {
    return new _Left__WEBPACK_IMPORTED_MODULE_0__["Left"](l);
};
const right = (a) => {
    return new _Right__WEBPACK_IMPORTED_MODULE_1__["Right"](a);
};
class Result {
    constructor(isSuccess, error, value) {
        if (isSuccess && error) {
            throw new Error('InvalidOperation: A result cannot be successful and contain an error');
        }
        if (!isSuccess && !error) {
            throw new Error('InvalidOperation: A failing result needs to contain an error message');
        }
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;
        Object.freeze(this);
    }
    getValue() {
        if (!this.isSuccess) {
            console.log(this.error);
            throw new Error("Can't get the value of an error result. Use 'errorValue' instead.");
        }
        return this._value;
    }
    errorValue() {
        return this.error;
    }
    static ok(value) {
        return new Result(true, null, value);
    }
    static fail(error) {
        return new Result(false, error);
    }
    static combine(results) {
        for (const result of results) {
            if (result.isFailure)
                return result;
        }
        return Result.ok();
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/core/logic/Right.ts":
/*!*************************************************!*\
  !*** ./libs/shared/src/lib/core/logic/Right.ts ***!
  \*************************************************/
/*! exports provided: Right */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Right", function() { return Right; });
class Right {
    constructor(value) {
        this.value = value;
    }
    isLeft() {
        return false;
    }
    isRight() {
        return true;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/Amount.ts":
/*!**********************************************!*\
  !*** ./libs/shared/src/lib/domain/Amount.ts ***!
  \**********************************************/
/*! exports provided: Amount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Amount", function() { return Amount; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class Amount extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(value) {
        if (isNaN(value) || value === 0 || value < 0) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('Must provide a valid amount');
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new Amount({ value }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/Email.ts":
/*!*********************************************!*\
  !*** ./libs/shared/src/lib/domain/Email.ts ***!
  \*********************************************/
/*! exports provided: Email */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Email", function() { return Email; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");



class Email extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(email) {
        const guardResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__["Guard"].againstNullOrUndefined(email, 'email');
        if (!guardResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(guardResult.message);
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new Email({ value: email }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/File.ts":
/*!********************************************!*\
  !*** ./libs/shared/src/lib/domain/File.ts ***!
  \********************************************/
/*! exports provided: File */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "File", function() { return File; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");



class File extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get src() {
        return this.props.src;
    }
    get name() {
        return this.props.name;
    }
    constructor(props) {
        super(props);
    }
    static create(src, name) {
        const guardResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__["Guard"].againstNullOrUndefined(src, 'source');
        if (!guardResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(guardResult.message);
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new File({ src, name }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/Name.ts":
/*!********************************************!*\
  !*** ./libs/shared/src/lib/domain/Name.ts ***!
  \********************************************/
/*! exports provided: Name */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Name", function() { return Name; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");



class Name extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(name) {
        const guardResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__["Guard"].againstNullOrUndefined(name, 'name');
        if (!guardResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(guardResult.message);
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new Name({ value: name }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/PhoneNumber.ts":
/*!***************************************************!*\
  !*** ./libs/shared/src/lib/domain/PhoneNumber.ts ***!
  \***************************************************/
/*! exports provided: PhoneNumber */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PhoneNumber", function() { return PhoneNumber; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");



class PhoneNumber extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(number) {
        const guardResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__["Guard"].againstNullOrUndefined(number, 'phone number');
        if (!guardResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(guardResult.message);
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new PhoneNumber({ value: number }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/authorization/AccessControl.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/domain/authorization/AccessControl.ts ***!
  \*******************************************************************/
/*! exports provided: accessControl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "accessControl", function() { return accessControl; });
/* harmony import */ var accesscontrol_plus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! accesscontrol-plus */ "accesscontrol-plus");
/* harmony import */ var accesscontrol_plus__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(accesscontrol_plus__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../modules/users/domain/enums/Roles */ "./libs/shared/src/lib/modules/users/domain/enums/Roles.ts");


const userOwnsEntity = (context) => context.entityOwnerId === context.userId;
const tenantMatches = (context) => context.entityTenantId === context.userTenantId;
const accessControl = new accesscontrol_plus__WEBPACK_IMPORTED_MODULE_0__["AccessControlPlus"]();
accessControl
    .deny('public')
    .resource('*')
    .action('*')
    .grant(_modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__["Roles"].CUSTOMER)
    .resource('invoice')
    .action('create')
    .where(userOwnsEntity)
    .grant(_modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__["Roles"].AUTHOR)
    .inherits(_modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__["Roles"].CUSTOMER)
    .grant(_modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__["Roles"].ADMIN)
    .inherits(_modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__["Roles"].CUSTOMER)
    .resource('*')
    .action('*')
    .where(tenantMatches)
    .grant(_modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_1__["Roles"].SUPER_ADMIN)
    .resource('*')
    .action('*');



/***/ }),

/***/ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts":
/*!**************************************************************************!*\
  !*** ./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts ***!
  \**************************************************************************/
/*! exports provided: AccessControlledUsecase, Authorize */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AccessControlledUsecase", function() { return AccessControlledUsecase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Authorize", function() { return Authorize; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _AccessControl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../AccessControl */ "./libs/shared/src/lib/domain/authorization/AccessControl.ts");



class AccessControlledUsecase {
}
const Authorize = (action) => (_target, // Class of the decorated method
_propertyName, // method name
propertyDescriptor) => {
    const method = propertyDescriptor.value;
    propertyDescriptor.value = function (request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { roles } = context;
            const accessControlContext = yield _target.getAccessControlContext(request, context, {});
            // Object.assign({}, accessControlContext, context);
            const permission = yield _AccessControl__WEBPACK_IMPORTED_MODULE_2__["accessControl"].can(roles, action, accessControlContext);
            if (!permission.granted) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('UnauthorizedUserException');
            }
            const result = yield method.call(this, request, context, permission);
            return result;
        });
    };
    return propertyDescriptor;
};


/***/ }),

/***/ "./libs/shared/src/lib/domain/authorization/index.ts":
/*!***********************************************************!*\
  !*** ./libs/shared/src/lib/domain/authorization/index.ts ***!
  \***********************************************************/
/*! exports provided: AccessControlledUsecase, Authorize, accessControl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _AccessControl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AccessControl */ "./libs/shared/src/lib/domain/authorization/AccessControl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "accessControl", function() { return _AccessControl__WEBPACK_IMPORTED_MODULE_0__["accessControl"]; });

/* harmony import */ var _decorators_Authorize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./decorators/Authorize */ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AccessControlledUsecase", function() { return _decorators_Authorize__WEBPACK_IMPORTED_MODULE_1__["AccessControlledUsecase"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Authorize", function() { return _decorators_Authorize__WEBPACK_IMPORTED_MODULE_1__["Authorize"]; });





/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/BaseReductionCreator.ts":
/*!***********************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/BaseReductionCreator.ts ***!
  \***********************************************************************/
/*! exports provided: BaseReductionCreator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BaseReductionCreator", function() { return BaseReductionCreator; });
/**
 * The Creator class declares the factory method that is supposed to return an
 * object of a Reduction class. The Creator's subclasses usually provide the
 * implementation of this method.
 */
class BaseReductionCreator {
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/Coupon.ts":
/*!*********************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/Coupon.ts ***!
  \*********************************************************/
/*! exports provided: Coupon */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Coupon", function() { return Coupon; });
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _Discount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Discount */ "./libs/shared/src/lib/domain/reductions/Discount.ts");
// * Core Domain


class Coupon extends _Discount__WEBPACK_IMPORTED_MODULE_1__["Discount"] {
    constructor(props, id) {
        super(props, id);
    }
    get name() {
        return this.props.name;
    }
    get reduction() {
        return this.props.reduction;
    }
    get created() {
        return this.props.created;
    }
    static create(props, id) {
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__["Result"].ok(new Coupon(Object.assign(Object.assign({}, props), { type: 'COUPON' }), id));
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/CouponCreator.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/CouponCreator.ts ***!
  \****************************************************************/
/*! exports provided: CouponCreator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CouponCreator", function() { return CouponCreator; });
/* harmony import */ var _BaseReductionCreator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseReductionCreator */ "./libs/shared/src/lib/domain/reductions/BaseReductionCreator.ts");
/* harmony import */ var _Coupon__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Coupon */ "./libs/shared/src/lib/domain/reductions/Coupon.ts");


/**
 * Concrete Creators override the factory method in order to change the
 * resulting reduction's type.
 */
class CouponCreator extends _BaseReductionCreator__WEBPACK_IMPORTED_MODULE_0__["BaseReductionCreator"] {
    /**
     * Note that the signature of the method still uses the abstract reduction
     * type, even though the concrete reduction is actually returned from the
     * method. This way the Creator can stay independent of concrete reduction
     * classes.
     */
    create(props, id) {
        return _Coupon__WEBPACK_IMPORTED_MODULE_1__["Coupon"].create(Object.assign({}, props), id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/Discount.ts":
/*!***********************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/Discount.ts ***!
  \***********************************************************/
/*! exports provided: Discount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Discount", function() { return Discount; });
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _Reduction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Reduction */ "./libs/shared/src/lib/domain/reductions/Reduction.ts");
// * Core Domain


class Discount extends _Reduction__WEBPACK_IMPORTED_MODULE_1__["Reduction"] {
    static create(props, id) {
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__["Result"].ok(new Discount(Object.assign(Object.assign({}, props), { type: 'DISCOUNT' }), id));
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/DiscountCreator.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/DiscountCreator.ts ***!
  \******************************************************************/
/*! exports provided: DiscountCreator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiscountCreator", function() { return DiscountCreator; });
/* harmony import */ var _BaseReductionCreator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseReductionCreator */ "./libs/shared/src/lib/domain/reductions/BaseReductionCreator.ts");
/* harmony import */ var _Discount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Discount */ "./libs/shared/src/lib/domain/reductions/Discount.ts");


/**
 * Concrete Creators override the factory method in order to change the
 * resulting reduction's type.
 */
class DiscountCreator extends _BaseReductionCreator__WEBPACK_IMPORTED_MODULE_0__["BaseReductionCreator"] {
    /**
     * Note that the signature of the method still uses the abstract reduction
     * type, even though the concrete reduction is actually returned from the
     * method. This way the Creator can stay independent of concrete reduction
     * classes.
     */
    create(props, id) {
        return _Discount__WEBPACK_IMPORTED_MODULE_1__["Discount"].create(Object.assign({}, props), id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/Reduction.ts":
/*!************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/Reduction.ts ***!
  \************************************************************/
/*! exports provided: Reduction */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Reduction", function() { return Reduction; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _ReductionId__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ReductionId */ "./libs/shared/src/lib/domain/reductions/ReductionId.ts");
// * Core Domain


class Reduction extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    constructor() {
        super(...arguments);
        this.reductionPercentage = 0;
    }
    get id() {
        return this._id;
    }
    get reductionId() {
        return _ReductionId__WEBPACK_IMPORTED_MODULE_1__["ReductionId"].create(this.id);
    }
    get type() {
        return this.props.type;
    }
    get isAutomatic() {
        return this.props.isAutomatic;
    }
    get isValid() {
        return this.props.isValid;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/ReductionFactory.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/ReductionFactory.ts ***!
  \*******************************************************************/
/*! exports provided: ReductionFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReductionFactory", function() { return ReductionFactory; });
/* harmony import */ var _DiscountCreator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DiscountCreator */ "./libs/shared/src/lib/domain/reductions/DiscountCreator.ts");
/* harmony import */ var _WaiverCreator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./WaiverCreator */ "./libs/shared/src/lib/domain/reductions/WaiverCreator.ts");
/* harmony import */ var _CouponCreator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./CouponCreator */ "./libs/shared/src/lib/domain/reductions/CouponCreator.ts");



var ReductionTypes;
(function (ReductionTypes) {
    ReductionTypes[ReductionTypes["DISCOUNT"] = 0] = "DISCOUNT";
    ReductionTypes[ReductionTypes["WAIVER"] = 1] = "WAIVER";
    ReductionTypes[ReductionTypes["COUPON"] = 2] = "COUPON";
})(ReductionTypes || (ReductionTypes = {}));
class ReductionFactory {
    static createReduction(type, props, id) {
        if (type === 'DISCOUNT') {
            const discountCreator = new _DiscountCreator__WEBPACK_IMPORTED_MODULE_0__["DiscountCreator"]();
            return discountCreator.create(props, id).getValue();
        }
        else if (type === 'WAIVER') {
            const waiverCreator = new _WaiverCreator__WEBPACK_IMPORTED_MODULE_1__["WaiverCreator"]();
            return waiverCreator.create(props, id).getValue();
        }
        else if (type === 'COUPON') {
            const couponCreator = new _CouponCreator__WEBPACK_IMPORTED_MODULE_2__["CouponCreator"]();
            return couponCreator.create(props, id).getValue();
        }
        return null;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/ReductionId.ts":
/*!**************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/ReductionId.ts ***!
  \**************************************************************/
/*! exports provided: ReductionId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReductionId", function() { return ReductionId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class ReductionId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new ReductionId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/Waiver.ts":
/*!*********************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/Waiver.ts ***!
  \*********************************************************/
/*! exports provided: Waiver */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Waiver", function() { return Waiver; });
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _Discount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Discount */ "./libs/shared/src/lib/domain/reductions/Discount.ts");
// * Core Domain


class Waiver extends _Discount__WEBPACK_IMPORTED_MODULE_1__["Discount"] {
    constructor() {
        super(...arguments);
        this.reductionPercentage = 1;
    }
    static create(props, id) {
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__["Result"].ok(new Waiver(Object.assign(Object.assign({}, props), { type: 'WAIVER' }), id));
    }
    get percentage() {
        return this.props.reduction || this.reductionPercentage;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/WaiverCreator.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/WaiverCreator.ts ***!
  \****************************************************************/
/*! exports provided: WaiverCreator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WaiverCreator", function() { return WaiverCreator; });
/* harmony import */ var _BaseReductionCreator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseReductionCreator */ "./libs/shared/src/lib/domain/reductions/BaseReductionCreator.ts");
/* harmony import */ var _Waiver__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Waiver */ "./libs/shared/src/lib/domain/reductions/Waiver.ts");


/**
 * Concrete Creators override the factory method in order to change the
 * resulting reduction's type.
 */
class WaiverCreator extends _BaseReductionCreator__WEBPACK_IMPORTED_MODULE_0__["BaseReductionCreator"] {
    /**
     * Note that the signature of the method still uses the abstract reduction
     * type, even though the concrete reduction is actually returned from the
     * method. This way the Creator can stay independent of concrete reduction
     * classes.
     */
    create(props, id) {
        return _Waiver__WEBPACK_IMPORTED_MODULE_1__["Waiver"].create(Object.assign({}, props), id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/policies/PoliciesRegister.ts":
/*!****************************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/policies/PoliciesRegister.ts ***!
  \****************************************************************************/
/*! exports provided: PoliciesRegister */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PoliciesRegister", function() { return PoliciesRegister; });
class PoliciesRegister {
    constructor() {
        this.policies = new Map();
    }
    registerPolicy(policy) {
        this.policies.set(policy.getType(), policy);
    }
    get(name) {
        return this.policies.get(name);
    }
    applyPolicy(policy, conditions) {
        return this.get(policy).getDiscount(...conditions);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/policies/SanctionedCountryPolicy.ts":
/*!***********************************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/policies/SanctionedCountryPolicy.ts ***!
  \***********************************************************************************/
/*! exports provided: SanctionedCountryPolicy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SanctionedCountryPolicy", function() { return SanctionedCountryPolicy; });
/* harmony import */ var _SanctionedCountryRule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SanctionedCountryRule */ "./libs/shared/src/lib/domain/reductions/policies/SanctionedCountryRule.ts");

/**
 * * Corresponding author’s institution is based in a sanctioned country
 * * which is also on the list of waiver countries
 *
 * * IF (waiverCountries[correspondingAuthor.country])
 * * THEN {APC = 0}
 */
class SanctionedCountryPolicy {
    constructor() {
        this.SANCTIONED_COUNTRY = Symbol.for('@SanctionedCountryPolicy');
    }
    /**
     * @Description
     *    Calculate the discount based on the corresponding author institution country code
     * @param invoice
     */
    getDiscount(correspondingAuthorInstitutionCountryCode) {
        return new _SanctionedCountryRule__WEBPACK_IMPORTED_MODULE_0__["SanctionedCountryRule"](correspondingAuthorInstitutionCountryCode);
    }
    getType() {
        return this.SANCTIONED_COUNTRY;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/policies/SanctionedCountryRule.ts":
/*!*********************************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/policies/SanctionedCountryRule.ts ***!
  \*********************************************************************************/
/*! exports provided: SanctionedCountryRule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SanctionedCountryRule", function() { return SanctionedCountryRule; });
/* harmony import */ var _ReductionFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ReductionFactory */ "./libs/shared/src/lib/domain/reductions/ReductionFactory.ts");

const SANCTIONED_COUNTRIES = {
    AF: { country: 'Afghanistan' },
    CU: { country: 'Cuba' },
    IR: { country: 'Iran' },
    KP: { country: 'Democratic People’s Republic of Korea' },
    SS: { country: 'South Sudan' },
    SD: { country: 'Sudan' },
    SY: { country: 'Syria' },
    UA: { country: 'Ukraine' }
};
class SanctionedCountryRule {
    constructor(correspondingAuthorInstitutionCountryCode) {
        this.correspondingAuthorInstitutionCountryCode = correspondingAuthorInstitutionCountryCode;
    }
    getReduction() {
        if (this.correspondingAuthorInstitutionCountryCode in SANCTIONED_COUNTRIES) {
            return _ReductionFactory__WEBPACK_IMPORTED_MODULE_0__["ReductionFactory"].createReduction('WAIVER', {
                reduction: -1
            });
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/policies/WaivedCountryPolicy.ts":
/*!*******************************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/policies/WaivedCountryPolicy.ts ***!
  \*******************************************************************************/
/*! exports provided: WaivedCountryPolicy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WaivedCountryPolicy", function() { return WaivedCountryPolicy; });
/* harmony import */ var _WaivedCountryRule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WaivedCountryRule */ "./libs/shared/src/lib/domain/reductions/policies/WaivedCountryRule.ts");

/**
 * * Corresponding author’s institution is based in a sanctioned country
 * * which is also on the list of waiver countries
 *
 * * IF (waiverCountries[correspondingAuthor.country])
 * * THEN {APC = 0}
 */
class WaivedCountryPolicy {
    constructor() {
        this.WAIVED_COUNTRY = Symbol.for('@WaivedCountryPolicy');
    }
    /**
     * @Description
     *    Calculate the discount based on the corresponding author institution country code
     * @param invoice
     */
    getDiscount(correspondingAuthorInstitutionCountryCode) {
        return new _WaivedCountryRule__WEBPACK_IMPORTED_MODULE_0__["WaivedCountryRule"](correspondingAuthorInstitutionCountryCode);
    }
    getType() {
        return this.WAIVED_COUNTRY;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/domain/reductions/policies/WaivedCountryRule.ts":
/*!*****************************************************************************!*\
  !*** ./libs/shared/src/lib/domain/reductions/policies/WaivedCountryRule.ts ***!
  \*****************************************************************************/
/*! exports provided: WaivedCountryRule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WaivedCountryRule", function() { return WaivedCountryRule; });
/* harmony import */ var _ReductionFactory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ReductionFactory */ "./libs/shared/src/lib/domain/reductions/ReductionFactory.ts");

const WAIVER_POLICY_COUNTRIES = {
    AF: { country: 'Afghanistan' },
    AO: { country: 'Angola' },
    BJ: { country: 'Benin' },
    BT: { country: 'Bhutan' },
    BO: { country: 'Bolivia' },
    BF: { country: 'Burkina Faso' },
    BI: { country: 'Burundi' },
    KH: { country: 'Cambodia' },
    CM: { country: 'Cameroon' },
    CV: { country: 'Cape Verde' },
    CF: { country: 'Central African Republic' },
    TD: { country: 'Chad' },
    KM: { country: 'Comoros' },
    CD: { country: 'Democratic Republic of Congo' },
    CG: { country: 'Congo' },
    CI: { country: 'Cote D’Ivoire' },
    KP: { country: 'Democratic People’s Republic of Korea' },
    DJ: { country: 'Djibouti' },
    TL: { country: 'East Timor' },
    SV: { country: 'El Salvador' },
    ER: { country: 'Eritrea' },
    ET: { country: 'Ethiopia' },
    GM: { country: 'Gambia' },
    GH: { country: 'Ghana' },
    GN: { country: 'Guinea' },
    GW: { country: 'Guinea-Bissau' },
    HT: { country: 'Haiti' },
    HN: { country: 'Honduras' },
    KE: { country: 'Kenya' },
    KI: { country: 'Kiribati' },
    KG: { country: 'Kyrgyzstan' },
    LA: { country: 'Laos' },
    LS: { country: 'Lesotho' },
    LR: { country: 'Liberia' },
    MG: { country: 'Madagascar' },
    MW: { country: 'Malawi' },
    ML: { country: 'Mali' },
    MR: { country: 'Mauritania' },
    MD: { country: 'Moldova' },
    MN: { country: 'Mongolia' },
    MA: { country: 'Morocco' },
    MZ: { country: 'Mozambique' },
    MM: { country: 'Myanmar' },
    NP: { country: 'Nepal' },
    NI: { country: 'Nicaragua' },
    NE: { country: 'Niger' },
    PS: { country: 'Palestinian Authority' },
    PG: { country: 'Papua New Guinea' },
    RW: { country: 'Rwanda' },
    ST: { country: 'Sao Tome and Principe' },
    SN: { country: 'Senegal' },
    SL: { country: 'Sierra Leone' },
    SB: { country: 'Solomon Islands' },
    SO: { country: 'Somalia' },
    SS: { country: 'South Sudan' },
    SD: { country: 'Sudan' },
    SZ: { country: 'Swaziland' },
    SY: { country: 'Syria' },
    TJ: { country: 'Tajikistan' },
    TZ: { country: 'Tanzania' },
    TG: { country: 'Togo' },
    TN: { country: 'Tunisia' },
    UG: { country: 'Uganda' },
    UA: { country: 'Ukraine' },
    UZ: { country: 'Uzbekistan' },
    VU: { country: 'Vanuatu' },
    VN: { country: 'Vietnam' },
    YE: { country: 'Yemen' },
    ZM: { country: 'Zambia' },
    ZW: { country: 'Zimbabwe' }
};
class WaivedCountryRule {
    constructor(correspondingAuthorInstitutionCountryCode) {
        this.correspondingAuthorInstitutionCountryCode = correspondingAuthorInstitutionCountryCode;
    }
    getReduction() {
        if (this.correspondingAuthorInstitutionCountryCode in WAIVER_POLICY_COUNTRIES) {
            return _ReductionFactory__WEBPACK_IMPORTED_MODULE_0__["ReductionFactory"].createReduction('WAIVER', {
                reduction: 0.5
            });
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts ***!
  \******************************************************************/
/*! exports provided: AbstractBaseDBRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AbstractBaseDBRepo", function() { return AbstractBaseDBRepo; });
class AbstractBaseDBRepo {
    constructor(db) {
        this.db = db;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/infrastructure/Mapper.ts":
/*!******************************************************!*\
  !*** ./libs/shared/src/lib/infrastructure/Mapper.ts ***!
  \******************************************************/
/*! exports provided: Mapper */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Mapper", function() { return Mapper; });
class Mapper {
}


/***/ }),

/***/ "./libs/shared/src/lib/infrastructure/Repo.ts":
/*!****************************************************!*\
  !*** ./libs/shared/src/lib/infrastructure/Repo.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/infrastructure/RepoError.ts":
/*!*********************************************************!*\
  !*** ./libs/shared/src/lib/infrastructure/RepoError.ts ***!
  \*********************************************************/
/*! exports provided: RepoErrorCode, RepoError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RepoErrorCode", function() { return RepoErrorCode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RepoError", function() { return RepoError; });
var RepoErrorCode;
(function (RepoErrorCode) {
    RepoErrorCode[RepoErrorCode["ENTITY_NOT_FOUND"] = 0] = "ENTITY_NOT_FOUND";
    RepoErrorCode[RepoErrorCode["DB_ERROR"] = 1] = "DB_ERROR";
})(RepoErrorCode || (RepoErrorCode = {}));
class RepoError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, RepoError.prototype);
        }
    }
    static createEntityNotFoundError(name, id) {
        return new RepoError(RepoErrorCode.ENTITY_NOT_FOUND, `Entity(${name}) with id[${id}] not found`);
    }
    static fromDBError(error) {
        return new RepoError(RepoErrorCode.DB_ERROR, error.message);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/infrastructure/database/knex/index.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/infrastructure/database/knex/index.ts ***!
  \*******************************************************************/
/*! exports provided: Knex, makeDb, destroyDb, clearTable, KnexDB */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeDb", function() { return makeDb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destroyDb", function() { return destroyDb; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearTable", function() { return clearTable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KnexDB", function() { return KnexDB; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var knex__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! knex */ "knex");
/* harmony import */ var knex__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(knex__WEBPACK_IMPORTED_MODULE_2__);
/* harmony reexport (default from non-harmony) */ __webpack_require__.d(__webpack_exports__, "Knex", function() { return knex__WEBPACK_IMPORTED_MODULE_2___default.a; });
/* harmony import */ var _knexfile__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./knexfile */ "./libs/shared/src/lib/infrastructure/database/knex/knexfile.ts");





const defaultDbOptions = {
    filename: ':memory:'
};
function makeDb(options = defaultDbOptions) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
        const db = knex__WEBPACK_IMPORTED_MODULE_2___default()({
            client: 'sqlite3',
            connection: {
                filename: options.filename
            },
            migrations: {
                directory: path__WEBPACK_IMPORTED_MODULE_1__["join"](__dirname, 'migrations')
            },
            seeds: {
                directory: path__WEBPACK_IMPORTED_MODULE_1__["join"](__dirname, 'seeds')
            },
            // pool: {min: 0, max: 10, idleTimeoutMillis: 500},
            useNullAsDefault: true
        });
        yield db.migrate.latest();
        return db;
    });
}
function destroyDb(db) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
        db.destroy();
    });
}
function clearTable(db, ...tables) {
    return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
        yield Promise.all(tables.map((table) => Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () { return yield db(table).truncate(); })));
        return db;
    });
}
const KnexDB = () => knex__WEBPACK_IMPORTED_MODULE_2___default()(_knexfile__WEBPACK_IMPORTED_MODULE_3__["config"]);


/***/ }),

/***/ "./libs/shared/src/lib/infrastructure/database/knex/knexfile.ts":
/*!**********************************************************************!*\
  !*** ./libs/shared/src/lib/infrastructure/database/knex/knexfile.ts ***!
  \**********************************************************************/
/*! exports provided: config */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "config", function() { return config; });
__webpack_require__(/*! dotenv */ "dotenv").config();
const { FINANCE_IS_PRODUCTION, FINANCE_DB_USER, FINANCE_DB_PASS, FINANCE_DB_DEVELOPMENT_FILENAME, FINANCE_DB_STAGING_DB_NAME } = process.env;
const NODE_ENV = FINANCE_IS_PRODUCTION === 'false' ? 'development' : 'staging';
const knexConfiguration = {
    development: {
        client: 'sqlite3',
        connection: {
            filename: FINANCE_DB_DEVELOPMENT_FILENAME || './dev.sqlite3'
        },
        useNullAsDefault: true
    },
    staging: {
        client: 'postgresql',
        connection: {
            database: FINANCE_DB_STAGING_DB_NAME || 'my_db',
            user: FINANCE_DB_USER || 'username',
            password: FINANCE_DB_PASS || 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'postgresql',
        connection: {
            database: FINANCE_DB_STAGING_DB_NAME || 'my_db',
            user: FINANCE_DB_USER || 'username',
            password: FINANCE_DB_PASS || 'password'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
const config = knexConfiguration[NODE_ENV];

// module.exports = config;


/***/ }),

/***/ "./libs/shared/src/lib/modules/addresses/domain/AddressId.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/addresses/domain/AddressId.ts ***!
  \*******************************************************************/
/*! exports provided: AddressId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddressId", function() { return AddressId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class AddressId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new AddressId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/domain/Article.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/domain/Article.ts ***!
  \****************************************************************/
/*! exports provided: Article */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Article", function() { return Article; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../../invoices/domain/ManuscriptId */ "./libs/shared/src/lib/modules/invoices/domain/ManuscriptId.ts");
// * Core domain



class Article extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get id() {
        return this._id;
    }
    get manuscriptId() {
        return _invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_2__["ManuscriptId"].create(this._id).getValue();
    }
    get authorEmail() {
        return this.props.authorEmail;
    }
    get authorCountry() {
        return this.props.authorCountry;
    }
    get title() {
        return this.props.title;
    }
    get articleTypeId() {
        return this.props.articleTypeId;
    }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const article = new Article(Object.assign(Object.assign({}, props), { created: props.created ? props.created : new Date() }), id);
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(article);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/domain/ArticleId.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/domain/ArticleId.ts ***!
  \******************************************************************/
/*! exports provided: ArticleId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArticleId", function() { return ArticleId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class ArticleId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new ArticleId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/domain/Price.ts":
/*!**************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/domain/Price.ts ***!
  \**************************************************************/
/*! exports provided: Price */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Price", function() { return Price; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");
/* harmony import */ var _PriceId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PriceId */ "./libs/shared/src/lib/modules/articles/domain/PriceId.ts");




class Price extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    constructor(props, id) {
        super(props, id);
    }
    get id() {
        return this._id;
    }
    get priceId() {
        return _PriceId__WEBPACK_IMPORTED_MODULE_3__["PriceId"].create(this.id);
    }
    get value() {
        return this.props.value;
    }
    static create(props, id) {
        const guardResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__["Guard"].againstNullOrUndefinedBulk([
            { argument: props.value, argumentName: 'value' }
        ]);
        if (!guardResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(guardResult.message);
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new Price(Object.assign({}, props), id));
        }
    }
}
Price.foo = 'bar';


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/domain/PriceId.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/domain/PriceId.ts ***!
  \****************************************************************/
/*! exports provided: PriceId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PriceId", function() { return PriceId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class PriceId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new PriceId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/domain/PriceValue.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/domain/PriceValue.ts ***!
  \*******************************************************************/
/*! exports provided: PriceValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PriceValue", function() { return PriceValue; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class PriceValue extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(value) {
        if (!!value === false || isNaN(value)) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('Must provide a valid price value.');
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new PriceValue({ value }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/dtos/ArticleDTO.ts":
/*!*****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/dtos/ArticleDTO.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/mappers/ArticleMap.ts":
/*!********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/mappers/ArticleMap.ts ***!
  \********************************************************************/
/*! exports provided: ArticleMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ArticleMap", function() { return ArticleMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_Article__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/Article */ "./libs/shared/src/lib/modules/articles/domain/Article.ts");



// import {PriceId} from '../domain/PriceId';
class ArticleMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const articleOrError = _domain_Article__WEBPACK_IMPORTED_MODULE_2__["Article"].create({
            // journalId: JournalId.create(new UniqueEntityID(raw.journalId)).getValue(),
            title: raw.title,
            articleTypeId: raw.articleTypeId,
            authorEmail: raw.authorEmail,
            authorCountry: raw.authorCountry,
            authorSurname: raw.authorSurname
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        articleOrError.isFailure ? console.log(articleOrError) : '';
        return articleOrError.isSuccess ? articleOrError.getValue() : null;
    }
    static toPersistence(article) {
        return {
            id: article.id.toString(),
            journalId: article.props.journalId.toString(),
            title: article.props.title,
            articleTypeId: article.props.articleTypeId,
            authorEmail: article.props.authorEmail,
            authorCountry: article.props.authorCountry,
            authorSurname: article.props.authorSurname
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/mappers/PriceMap.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/mappers/PriceMap.ts ***!
  \******************************************************************/
/*! exports provided: PriceMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PriceMap", function() { return PriceMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_Price__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/Price */ "./libs/shared/src/lib/modules/articles/domain/Price.ts");
/* harmony import */ var _domain_PriceValue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../domain/PriceValue */ "./libs/shared/src/lib/modules/articles/domain/PriceValue.ts");




// import {ArtistMap} from './ArtistMap';
// import {AlbumMap} from './AlbumMap';
// import {TraderId} from '../../trading/domain/traderId';
class PriceMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const priceOrError = _domain_Price__WEBPACK_IMPORTED_MODULE_2__["Price"].create({
            value: _domain_PriceValue__WEBPACK_IMPORTED_MODULE_3__["PriceValue"].create(raw.value).getValue()
            // traderId: TraderId.create(raw.trader_id),
            // artist: ArtistMap.toDomain(raw.Artist),
            // album: AlbumMap.toDomain(raw.Album)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        priceOrError.isFailure ? console.log(priceOrError) : '';
        return priceOrError.isSuccess ? priceOrError.getValue() : null;
    }
    static toPersistence(price) {
        return {
            id: price.id.toString(),
            value: price.props.value
            // artist_id: vinyl.artist.artistId.id.toString(),
            // album_id: vinyl.album.id.toString(),
            // notes: vinyl.vinylNotes.value
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/repos/articleRepo.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/repos/articleRepo.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/repos/implementations/knexArticleRepo.ts":
/*!***************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/repos/implementations/knexArticleRepo.ts ***!
  \***************************************************************************************/
/*! exports provided: KnexArticleRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KnexArticleRepo", function() { return KnexArticleRepo; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../.. */ "./libs/shared/src/index.ts");
/* harmony import */ var _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../infrastructure/AbstractBaseDBRepo */ "./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts");
/* harmony import */ var _invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../invoices/domain/ManuscriptId */ "./libs/shared/src/lib/modules/invoices/domain/ManuscriptId.ts");
/* harmony import */ var libs_shared_src_lib_core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! libs/shared/src/lib/core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");





class KnexArticleRepo extends _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__["AbstractBaseDBRepo"] {
    findById(manuscriptId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            if (typeof manuscriptId === 'string') {
                manuscriptId = _invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_3__["ManuscriptId"].create(new libs_shared_src_lib_core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_4__["UniqueEntityID"](manuscriptId)).getValue();
            }
            const articleData = yield this.db('articles')
                .select()
                .where('id', manuscriptId.id.toString())
                .first();
            return articleData ? ___WEBPACK_IMPORTED_MODULE_1__["ArticleMap"].toDomain(articleData) : null;
        });
    }
    getAuthorOfArticle(articleId) {
        return Promise.resolve(articleId);
    }
    exists(article) {
        return Promise.resolve(true);
    }
    save(article) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            yield db('articles').insert(___WEBPACK_IMPORTED_MODULE_1__["ArticleMap"].toPersistence(article));
            return article;
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/repos/index.ts":
/*!*************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/repos/index.ts ***!
  \*************************************************************/
/*! exports provided: ArticleRepoContract, KnexArticleRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _articleRepo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./articleRepo */ "./libs/shared/src/lib/modules/articles/repos/articleRepo.ts");
/* harmony import */ var _articleRepo__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_articleRepo__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArticleRepoContract", function() { return _articleRepo__WEBPACK_IMPORTED_MODULE_0__["ArticleRepoContract"]; });

/* harmony import */ var _implementations_knexArticleRepo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./implementations/knexArticleRepo */ "./libs/shared/src/lib/modules/articles/repos/implementations/knexArticleRepo.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexArticleRepo", function() { return _implementations_knexArticleRepo__WEBPACK_IMPORTED_MODULE_1__["KnexArticleRepo"]; });






/***/ }),

/***/ "./libs/shared/src/lib/modules/articles/repos/priceRepo.ts":
/*!*****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/articles/repos/priceRepo.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/authors/domain/Author.ts":
/*!**************************************************************!*\
  !*** ./libs/shared/src/lib/modules/authors/domain/Author.ts ***!
  \**************************************************************/
/*! exports provided: Author */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Author", function() { return Author; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
// * Core Domain


class Author extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get id() {
        return this._id;
    }
    get name() {
        return this.props.name;
    }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const author = new Author(Object.assign({}, props), id);
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(author);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/domain/CatalogItem.ts":
/*!********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/domain/CatalogItem.ts ***!
  \********************************************************************/
/*! exports provided: CatalogItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CatalogItem", function() { return CatalogItem; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
// * Core Domain


class CatalogItem extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const catalogItem = new CatalogItem(Object.assign({}, props), id);
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(catalogItem);
    }
    get id() {
        return this._id;
    }
    get type() {
        return this.props.type;
    }
    get price() {
        return this.props.price;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/mappers/CatalogMap.ts":
/*!********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/mappers/CatalogMap.ts ***!
  \********************************************************************/
/*! exports provided: CatalogMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CatalogMap", function() { return CatalogMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_CatalogItem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/CatalogItem */ "./libs/shared/src/lib/modules/catalogs/domain/CatalogItem.ts");
// import {Money, Currencies} from 'ts-money';



// import {CatalogId} from '../domain/CatalogId';
// import {STATUS as TransactionStatus} from '../domain/Transaction';
class CatalogMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const catalogOrError = _domain_CatalogItem__WEBPACK_IMPORTED_MODULE_2__["CatalogItem"].create({
            // articleId: ArticleId.create(new UniqueEntityID(raw.articleId)),
            // price: Money.fromInteger({amount: raw.amount, currency: Currencies.USD})
            type: raw.type,
            price: raw.price
            // dateUpdated: new Date(raw.dateUpdated)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        return catalogOrError.isSuccess ? catalogOrError.getValue() : null;
    }
    static toPersistence(catalogItem) {
        return {
            id: catalogItem.id.toString(),
            type: catalogItem.type,
            price: catalogItem.price
            // articleId: catalog.articleId.toString(),
            // status: catalog.status,
            // amount: catalog.amount.value,
            // dateAdded: catalog.dateAdded,
            // dateUpdated: catalog.dateUpdated
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/repos/catalogRepo.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/repos/catalogRepo.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/repos/implementations/knexCatalogRepo.ts":
/*!***************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/repos/implementations/knexCatalogRepo.ts ***!
  \***************************************************************************************/
/*! exports provided: KnexCatalogRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KnexCatalogRepo", function() { return KnexCatalogRepo; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hindawi_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hindawi/shared */ "./libs/shared/src/index.ts");
/* harmony import */ var _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../infrastructure/AbstractBaseDBRepo */ "./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts");



class KnexCatalogRepo extends _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__["AbstractBaseDBRepo"] {
    exists(catalogItem) {
        return Promise.resolve(true);
    }
    save(catalogItem) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            yield db('catalog').insert(_hindawi_shared__WEBPACK_IMPORTED_MODULE_1__["CatalogMap"].toPersistence(catalogItem));
            return catalogItem;
        });
    }
    getCatalogCollection() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const catalogsRows = yield db('catalog');
            return catalogsRows.reduce((aggregator, t) => {
                aggregator.push(_hindawi_shared__WEBPACK_IMPORTED_MODULE_1__["CatalogMap"].toDomain(t));
                return aggregator;
            }, []);
        });
    }
    getCatalogItemByType(type = 'APC') {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            return yield db('catalog')
                .where({ type })
                .first();
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/repos/index.ts":
/*!*************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/repos/index.ts ***!
  \*************************************************************/
/*! exports provided: CatalogRepoContract, KnexCatalogRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _catalogRepo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./catalogRepo */ "./libs/shared/src/lib/modules/catalogs/repos/catalogRepo.ts");
/* harmony import */ var _catalogRepo__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_catalogRepo__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CatalogRepoContract", function() { return _catalogRepo__WEBPACK_IMPORTED_MODULE_0__["CatalogRepoContract"]; });

/* harmony import */ var _implementations_knexCatalogRepo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./implementations/knexCatalogRepo */ "./libs/shared/src/lib/modules/catalogs/repos/implementations/knexCatalogRepo.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexCatalogRepo", function() { return _implementations_knexCatalogRepo__WEBPACK_IMPORTED_MODULE_1__["KnexCatalogRepo"]; });






/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogUseCase.ts":
/*!******************************************************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogUseCase.ts ***!
  \******************************************************************************************************************************/
/*! exports provided: AddCatalogItemToCatalogUseCase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddCatalogItemToCatalogUseCase", function() { return AddCatalogItemToCatalogUseCase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _domain_CatalogItem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../domain/CatalogItem */ "./libs/shared/src/lib/modules/catalogs/domain/CatalogItem.ts");


// import {UniqueEntityID} from '../../../../../core/domain/UniqueEntityID';

class AddCatalogItemToCatalogUseCase {
    constructor(catalogRepo) {
        this.catalogRepo = catalogRepo;
    }
    // private async getGenresFromDTO(artistGenres: string) {
    //   return (await this.genresRepo.findByIds(
    //     (ParseUtils.parseObject(artistGenres) as Result<GenresRequestDTO>)
    //       .getValue()
    //       .ids.map(genreId => GenreId.create(new UniqueEntityID(genreId)))
    //   )).concat(
    //     (ParseUtils.parseObject(artistGenres) as Result<GenresRequestDTO>)
    //       .getValue()
    //       .new.map(name => Genre.create(name).getValue())
    //   );
    // }
    // private async getArtist(
    //   request: AddVinylToCatalogUseCaseRequestDTO
    // ): Promise<Result<Artist>> {
    //   const {artistNameOrId, artistGenres} = request;
    //   const isArtistIdProvided = TextUtil.isUUID(artistNameOrId);
    //   if (isArtistIdProvided) {
    //     const artist = await this.artistRepo.findByArtistId(artistNameOrId);
    //     const found = !!artist;
    //     if (found) {
    //       return Result.ok<Artist>(artist);
    //     } else {
    //       return Result.fail<Artist>(
    //         `Couldn't find artist by id=${artistNameOrId}`
    //       );
    //     }
    //   } else {
    //     return Artist.create({
    //       name: ArtistName.create(artistNameOrId).getValue(),
    //       genres: await this.getGenresFromDTO(artistGenres as string)
    //     });
    //   }
    // }
    // private async getAlbum(
    //   request: AddVinylToCatalogUseCaseRequestDTO,
    //   artist: Artist
    // ): Promise<Result<Album>> {
    //   const {albumNameOrId, albumGenres, albumYearReleased} = request;
    //   const isAlbumIdProvided = TextUtil.isUUID(albumNameOrId);
    //   if (isAlbumIdProvided) {
    //     const album = await this.albumRepo.findAlbumByAlbumId(albumNameOrId);
    //     const found = !!album;
    //     if (found) {
    //       return Result.ok<Album>(album);
    //     } else {
    //       return Result.fail<Album>(`Couldn't find album by id=${album}`);
    //     }
    //   } else {
    //     return Album.create({
    //       name: albumNameOrId,
    //       artistId: artist.artistId,
    //       genres: await this.getGenresFromDTO(albumGenres as string),
    //       yearReleased: albumYearReleased
    //     });
    //   }
    // }
    execute(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { type, price } = request;
            // let artist: Artist;
            // let album: Album;
            try {
                // const artistOrError = await this.getArtist(request);
                // if (artistOrError.isFailure) {
                //   return Result.fail<Vinyl>(artistOrError.error);
                // } else {
                //   artist = artistOrError.getValue();
                // }
                // const albumOrError = await this.getAlbum(request, artist);
                // if (albumOrError.isFailure) {
                //   return Result.fail<Vinyl>(albumOrError.error);
                // } else {
                //   album = albumOrError.getValue();
                // }
                const catalogItemOrError = _domain_CatalogItem__WEBPACK_IMPORTED_MODULE_2__["CatalogItem"].create({
                    type,
                    price
                    // artist: artist,
                    // traderId: TraderId.create(new UniqueEntityID(traderId))
                });
                if (catalogItemOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(catalogItemOrError.error);
                }
                const catalogItem = catalogItemOrError.getValue();
                // This is where all the magic happens
                yield this.catalogRepo.save(catalogItem);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(catalogItem);
            }
            catch (err) {
                console.log(err);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/catalogs/usecases/catalogItems/getAllCatalogItems/getAllCatalogItemsUseCase.ts":
/*!********************************************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/catalogs/usecases/catalogItems/getAllCatalogItems/getAllCatalogItemsUseCase.ts ***!
  \********************************************************************************************************************/
/*! exports provided: GetAllCatalogItemsUseCase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GetAllCatalogItemsUseCase", function() { return GetAllCatalogItemsUseCase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class GetAllCatalogItemsUseCase {
    constructor(catalogRepo) {
        this.catalogRepo = catalogRepo;
    }
    getCatalogItems() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const catalogItems = yield this.catalogRepo.getCatalogCollection();
            if (!catalogItems) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't list CatalogItem(s).`);
            }
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(catalogItems);
        });
    }
    execute(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            try {
                const catalogItemsOrError = yield this.getCatalogItems();
                if (catalogItemsOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(catalogItemsOrError.error);
                }
                const catalogItems = catalogItemsOrError.getValue();
                // magic happens here
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(catalogItems);
            }
            catch (err) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/coupons/mappers/CouponMap.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/coupons/mappers/CouponMap.ts ***!
  \******************************************************************/
/*! exports provided: CouponPersistenceDTO, CouponMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CouponPersistenceDTO", function() { return CouponPersistenceDTO; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CouponMap", function() { return CouponMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_reductions_Coupon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../domain/reductions/Coupon */ "./libs/shared/src/lib/domain/reductions/Coupon.ts");



class CouponPersistenceDTO {
}
class CouponMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const couponOrError = _domain_reductions_Coupon__WEBPACK_IMPORTED_MODULE_2__["Coupon"].create({
            // couponId: CouponId.create(new UniqueEntityID(raw.articleId)),
            // amount: Amount.create(raw.amount).getValue(),
            name: raw.name,
            isValid: raw.valid,
            reduction: raw.reduction,
            created: new Date(raw.created)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        return couponOrError.isSuccess ? couponOrError.getValue() : null;
    }
    static toPersistence(coupon) {
        return {
            id: coupon.id.toString(),
            // articleId: transaction.articleId.toString(),
            name: coupon.name,
            valid: coupon.isValid,
            reduction: coupon.reduction,
            created: coupon.created
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/coupons/repos/couponRepo.ts":
/*!*****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/coupons/repos/couponRepo.ts ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/coupons/repos/implementations/knexCouponRepo.ts":
/*!*************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/coupons/repos/implementations/knexCouponRepo.ts ***!
  \*************************************************************************************/
/*! exports provided: KnexCouponRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KnexCouponRepo", function() { return KnexCouponRepo; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _mappers_CouponMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../mappers/CouponMap */ "./libs/shared/src/lib/modules/coupons/mappers/CouponMap.ts");
/* harmony import */ var _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../infrastructure/AbstractBaseDBRepo */ "./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts");



class KnexCouponRepo extends _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__["AbstractBaseDBRepo"] {
    getCouponById(couponId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const couponRow = yield db('coupons')
                .select()
                .where('id', couponId.id.toString())
                .first();
            return couponRow ? _mappers_CouponMap__WEBPACK_IMPORTED_MODULE_1__["CouponMap"].toDomain(couponRow) : null;
        });
    }
    // getTransactionByManuscriptId(articleId: string): Promise<Transaction> {
    //   // TODO: Please read `docs/typescript/COMMANDMENTS.ts` to understand why `{} as Transaction` is a lie.
    //   return Promise.resolve({} as Transaction);
    // }
    getCouponCollection() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const couponsRows = yield db('coupons');
            return couponsRows.reduce((aggregator, t) => {
                aggregator.push(_mappers_CouponMap__WEBPACK_IMPORTED_MODULE_1__["CouponMap"].toDomain(t));
                return aggregator;
            }, []);
        });
    }
    // async delete(transaction: Transaction): Promise<unknown> {
    //   const {db} = this;
    //   const deletedRows = await db('transactions')
    //     .where('id', transaction.id.toString())
    //     .delete();
    //   return deletedRows
    //     ? deletedRows
    //     : Promise.reject(
    //         RepoError.createEntityNotFoundError(
    //           'transaction',
    //           transaction.id.toString()
    //         )
    //       );
    // }
    // async update(transaction: Transaction): Promise<Transaction> {
    //   const {db} = this;
    //   const updated = await db('transactions')
    //     .where({id: transaction.id.toString()})
    //     .update(TransactionMap.toPersistence(transaction));
    //   if (!updated) {
    //     throw RepoError.createEntityNotFoundError(
    //       'transaction',
    //       transaction.id.toString()
    //     );
    //   }
    //   return transaction;
    // }
    exists(coupon) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const result = yield this.getCouponById(coupon.reductionId);
            return !!result;
        });
    }
    save(coupon) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const data = _mappers_CouponMap__WEBPACK_IMPORTED_MODULE_1__["CouponMap"].toPersistence(coupon);
            yield db('coupons').insert(data);
            return this.getCouponById(coupon.reductionId);
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/coupons/repos/index.ts":
/*!************************************************************!*\
  !*** ./libs/shared/src/lib/modules/coupons/repos/index.ts ***!
  \************************************************************/
/*! exports provided: CouponRepoContract, KnexCouponRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _couponRepo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./couponRepo */ "./libs/shared/src/lib/modules/coupons/repos/couponRepo.ts");
/* harmony import */ var _couponRepo__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_couponRepo__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CouponRepoContract", function() { return _couponRepo__WEBPACK_IMPORTED_MODULE_0__["CouponRepoContract"]; });

/* harmony import */ var _implementations_knexCouponRepo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./implementations/knexCouponRepo */ "./libs/shared/src/lib/modules/coupons/repos/implementations/knexCouponRepo.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexCouponRepo", function() { return _implementations_knexCouponRepo__WEBPACK_IMPORTED_MODULE_1__["KnexCouponRepo"]; });






/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/Invoice.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/Invoice.ts ***!
  \****************************************************************/
/*! exports provided: InvoiceStatus, Invoice */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceStatus", function() { return InvoiceStatus; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Invoice", function() { return Invoice; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _InvoiceId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./InvoiceId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts");
/* harmony import */ var _InvoiceItems__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./InvoiceItems */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItems.ts");
/* harmony import */ var _events_invoiceSentEvent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./events/invoiceSentEvent */ "./libs/shared/src/lib/modules/invoices/domain/events/invoiceSentEvent.ts");
/* harmony import */ var _events_invoicePaidEvent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./events/invoicePaidEvent */ "./libs/shared/src/lib/modules/invoices/domain/events/invoicePaidEvent.ts");
// * Core Domain


// * Subdomains




// import {PayerType} from '../../payers/domain/PayerType';
// import {Coupon} from '../../coupons/domain/Coupon';
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus[InvoiceStatus["DRAFT"] = 0] = "DRAFT";
    InvoiceStatus[InvoiceStatus["ACTIVE"] = 1] = "ACTIVE";
    InvoiceStatus[InvoiceStatus["FINAL"] = 2] = "FINAL"; // after a resolution has been set: either it was paid, it was waived, or it has been considered bad debt
})(InvoiceStatus || (InvoiceStatus = {}));
class Invoice extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get invoiceId() {
        return _InvoiceId__WEBPACK_IMPORTED_MODULE_2__["InvoiceId"].create(this._id).getValue();
    }
    get transactionId() {
        return this.props.transactionId;
    }
    get payerId() {
        return this.props.payerId;
    }
    get status() {
        return this.props.status;
    }
    get dateCreated() {
        return this.props.dateCreated;
    }
    get invoiceItems() {
        return this.props.invoiceItems;
    }
    set payerId(payerId) {
        this.props.payerId = payerId;
    }
    get invoiceNumber() {
        return this.props.invoiceNumber;
    }
    set transactionId(transactionId) {
        this.props.transactionId = transactionId;
    }
    removeInvoiceItemIfExists(invoiceItem) {
        if (this.props.invoiceItems.exists(invoiceItem)) {
            this.props.invoiceItems.remove(invoiceItem);
        }
    }
    addInvoiceItem(invoiceItem) {
        this.removeInvoiceItemIfExists(invoiceItem);
        this.props.invoiceItems.add(invoiceItem);
        this.props.totalNumInvoiceItems++;
        // this.addDomainEvent(new InvoiceItemIssued(this, invoiceItem));
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok();
    }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const defaultValues = Object.assign(Object.assign({}, props), { invoiceItems: props.invoiceItems
                ? props.invoiceItems
                : _InvoiceItems__WEBPACK_IMPORTED_MODULE_3__["InvoiceItems"].create([]), dateCreated: props.dateCreated ? props.dateCreated : new Date() });
        const isNewInvoice = !!id === false;
        const invoice = new Invoice(defaultValues, id);
        if (isNewInvoice) {
            // invoice.addDomainEvent(new InvoiceCreated(invoice));
            // Create with initial invoice item from whomever created the invoice
            // invoice.addInvoiceItem(
            //   InvoiceItem.create(props.invoiceId, invoice.manuscriptId).getValue()
            // );
        }
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(invoice);
    }
    send() {
        this.addDomainEvent(new _events_invoiceSentEvent__WEBPACK_IMPORTED_MODULE_4__["InvoiceSentEvent"](this.invoiceId, new Date()));
    }
    markAsActive() {
        const now = new Date();
        this.props.dateUpdated = now;
        this.props.status = InvoiceStatus.ACTIVE;
        // this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
    }
    markAsPaid() {
        const now = new Date();
        this.props.dateUpdated = now;
        this.props.status = InvoiceStatus.FINAL;
        this.addDomainEvent(new _events_invoicePaidEvent__WEBPACK_IMPORTED_MODULE_5__["InvoicePaidEvent"](this.invoiceId, now));
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts ***!
  \******************************************************************/
/*! exports provided: InvoiceId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceId", function() { return InvoiceId; });
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");


class InvoiceId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_1__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__["Result"].ok(new InvoiceId(id));
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItem.ts":
/*!********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/InvoiceItem.ts ***!
  \********************************************************************/
/*! exports provided: InvoiceItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceItem", function() { return InvoiceItem; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./../../../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _InvoiceItemId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./InvoiceItemId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItemId.ts");
// * Core Domain




class InvoiceItem extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get id() {
        return this._id;
    }
    get invoiceItemId() {
        return _InvoiceItemId__WEBPACK_IMPORTED_MODULE_3__["InvoiceItemId"].create(this.id);
    }
    get invoiceId() {
        return this.props.invoiceId;
    }
    get manuscriptId() {
        return this.props.manuscriptId;
    }
    get type() {
        return this.props.type;
    }
    get name() {
        return this.props.name;
    }
    get price() {
        return this.props.price;
    }
    get dateCreated() {
        return this.props.dateCreated;
    }
    constructor(props, id) {
        super(props, id);
    }
    set price(priceValue) {
        this.props.price = priceValue;
    }
    static create(props, id) {
        const guardArgs = [
            { argument: props.invoiceId, argumentName: 'invoiceId' },
            { argument: props.manuscriptId, argumentName: 'manuscriptId' }
        ];
        const guardResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_1__["Guard"].againstNullOrUndefinedBulk(guardArgs);
        if (!guardResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_2__["Result"].fail(guardResult.message);
        }
        const defaultValues = Object.assign(Object.assign({}, props), { name: props.name ? props.name : 'APC', type: props.type ? props.type : 'APC', dateCreated: props.dateCreated ? props.dateCreated : new Date() });
        const invoiceItem = new InvoiceItem(defaultValues, id);
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_2__["Result"].ok(invoiceItem);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItemId.ts":
/*!**********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/InvoiceItemId.ts ***!
  \**********************************************************************/
/*! exports provided: InvoiceItemId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceItemId", function() { return InvoiceItemId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class InvoiceItemId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new InvoiceItemId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItems.ts":
/*!*********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/InvoiceItems.ts ***!
  \*********************************************************************/
/*! exports provided: InvoiceItems */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceItems", function() { return InvoiceItems; });
/* harmony import */ var _core_domain_WatchedList__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/WatchedList */ "./libs/shared/src/lib/core/domain/WatchedList.ts");

class InvoiceItems extends _core_domain_WatchedList__WEBPACK_IMPORTED_MODULE_0__["WatchedList"] {
    constructor(initialVotes) {
        super(initialVotes);
    }
    compareItems(a, b) {
        return a.equals(b);
    }
    static create(invoiceItems) {
        return new InvoiceItems(invoiceItems ? invoiceItems : []);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/ManuscriptId.ts":
/*!*********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/ManuscriptId.ts ***!
  \*********************************************************************/
/*! exports provided: ManuscriptId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ManuscriptId", function() { return ManuscriptId; });
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");


class ManuscriptId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_1__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_0__["Result"].ok(new ManuscriptId(id));
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/events/invoicePaidEvent.ts":
/*!********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/events/invoicePaidEvent.ts ***!
  \********************************************************************************/
/*! exports provided: InvoicePaidEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoicePaidEvent", function() { return InvoicePaidEvent; });
class InvoicePaidEvent {
    constructor(invoiceId, dateTimeOccurred) {
        this.invoiceId = invoiceId;
        this.dateTimeOccurred = dateTimeOccurred;
    }
    getAggregateId() {
        return this.invoiceId.id;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/events/invoiceSentEvent.ts":
/*!********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/events/invoiceSentEvent.ts ***!
  \********************************************************************************/
/*! exports provided: InvoiceSentEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceSentEvent", function() { return InvoiceSentEvent; });
class InvoiceSentEvent {
    constructor(invoiceId, dateTimeOccurred) {
        this.invoiceId = invoiceId;
        this.dateTimeOccurred = dateTimeOccurred;
    }
    getAggregateId() {
        return this.invoiceId.id;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/policies/PoliciesRegister.ts":
/*!**********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/policies/PoliciesRegister.ts ***!
  \**********************************************************************************/
/*! exports provided: PoliciesRegister */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PoliciesRegister", function() { return PoliciesRegister; });
class PoliciesRegister {
    constructor() {
        this.policies = new Map();
    }
    registerPolicy(policy) {
        this.policies.set(policy.getType(), policy);
    }
    get(name) {
        return this.policies.get(name);
    }
    applyPolicy(policy, conditions) {
        return this.get(policy).getVAT(...conditions);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATHardCopyPolicy.ts":
/*!*************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/policies/UKVATHardCopyPolicy.ts ***!
  \*************************************************************************************/
/*! exports provided: UKVATTreatmentOfHardCopyPublicationsPolicy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UKVATTreatmentOfHardCopyPublicationsPolicy", function() { return UKVATTreatmentOfHardCopyPublicationsPolicy; });
/* harmony import */ var _UKVATHardCopyRule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UKVATHardCopyRule */ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATHardCopyRule.ts");

/**
 * * All sales of hard copy journals will be made from the UK (Place Of Supply is UK)
 * * All such supplies of publications by Hindawi will be subject to the 0% VAT rate
 * * In the case of supplies of hard copy journals to VAT registered customers in other EU member states,
 * * Hindawi should obtain the EU customers VAT registration number
 * * Hindawi should be aware of the distance selling rules for non-business customers
 * * What is the distance selling threshold?
 *
 * * Determine is customer is from UK|NON-UE
 * * Determine if customer is VAT|Non-VAT registered
 */
class UKVATTreatmentOfHardCopyPublicationsPolicy {
    constructor() {
        this.UK_VAT_TREATMENT_HARD_COPY_PUBLICATIONS = Symbol.for('@UKVATreatmentOfHardCopyPublicationsPolicy');
    }
    /**
     * @Description
     *    Calculate the VAT based on the net value, country code
     *    and indication if the customer is a company or not.
     * @param invoice
     */
    getVAT(countryCode, asBusiness = false) {
        return new _UKVATHardCopyRule__WEBPACK_IMPORTED_MODULE_0__["UKVATTreatmentOfHardCopyPublicationsRule"](countryCode, asBusiness);
    }
    getType() {
        return this.UK_VAT_TREATMENT_HARD_COPY_PUBLICATIONS;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATHardCopyRule.ts":
/*!***********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/policies/UKVATHardCopyRule.ts ***!
  \***********************************************************************************/
/*! exports provided: UKVATTreatmentOfHardCopyPublicationsRule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UKVATTreatmentOfHardCopyPublicationsRule", function() { return UKVATTreatmentOfHardCopyPublicationsRule; });
class UKVATTreatmentOfHardCopyPublicationsRule {
    constructor(countryCode, asBusiness = false) {
        this.IsBusiness = asBusiness;
        this.CountryCode = countryCode;
    }
    getVAT() {
        return 0;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy.ts":
/*!**************************************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy.ts ***!
  \**************************************************************************************************************/
/*! exports provided: UKVATTreatmentArticleProcessingChargesPolicy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UKVATTreatmentArticleProcessingChargesPolicy", function() { return UKVATTreatmentArticleProcessingChargesPolicy; });
/* harmony import */ var _UKVATTreatmentArticleProcessingChargesRule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UKVATTreatmentArticleProcessingChargesRule */ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesRule.ts");

class UKVATTreatmentArticleProcessingChargesPolicy {
    constructor() {
        this.UK_VAT_TREATMENT_ARTICLE_PROCESSING_CHARGES = Symbol.for('@UKVATTreatmentOfArticleProcessingChargesPolicy');
    }
    /**
     * @Description
     *    Calculate the VAT based on the net value, country code
     *    and indication if the customer is a company or not.
     * @param invoice
     */
    getVAT(countryCode, asBusiness = false, VATRegistered = true) {
        return new _UKVATTreatmentArticleProcessingChargesRule__WEBPACK_IMPORTED_MODULE_0__["UKVATTreatmentArticleProcessingChargesRule"](countryCode, asBusiness, VATRegistered);
    }
    getType() {
        return this.UK_VAT_TREATMENT_ARTICLE_PROCESSING_CHARGES;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesRule.ts":
/*!************************************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesRule.ts ***!
  \************************************************************************************************************/
/*! exports provided: UKVATTreatmentArticleProcessingChargesRule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UKVATTreatmentArticleProcessingChargesRule", function() { return UKVATTreatmentArticleProcessingChargesRule; });
/**
 * * Customer Categories:
 * * - Private individual (not VAT registered)
 * * - VAT-registered educational institution
 * * - VAT-registered charitable organisation (grant funding)
 * * - VAT-registered organisation with both charitable and business functions (many schools, some governments)
 * * - VAT-registered commercial organisation (i.e. pharmaceutical companies)
 *
 * * The place of supply is where the customer is established.
 * * - For UK business/non-business customers – UK VAT should be charged at the current standard rate of 20%.
 * * - For EU business customers – The supply will be outside the scope of UK VAT.
 * * - For EU non-business customers – UK VAT should be charged at the current standard rate of 20%.
 * * - For non-EU business customers – The supply will be outside the scope of UK VAT.
 * * - For non-EU non-business customers – The supply will be outside the scope of UK VAT.
 *
 * * Determining the location/place of establishment of the customer:
 * * - Billing address of the customer
 * *    - If VAT registered: VAT registration number
 * *    - If not VAT registered: Company number
 * * - Location of the bank
 *
 * * Determining the business status of the customer
 *
 */
class UKVATTreatmentArticleProcessingChargesRule {
    constructor(countryCode, asBusiness = false, VATRegistered = true) {
        /**
         * * All available tax rules and their exceptions.
         * Taken from: http://ec.europa.eu/taxation_customs/resources/documents/taxation/vat/how_vat_works/rates/vat_rates_en.pdf
         */
        this.VATRules = {
            // Belgium
            BE: { rate: 21 },
            // Bulgaria
            BG: { rate: 20 },
            // Czech Republic
            CZ: { rate: 21 },
            // Denmark
            DK: { rate: 25 },
            // Germany
            DE: { rate: 19 },
            // Estonia
            EE: { rate: 20 },
            // Ireland
            IE: { rate: 23 },
            // Greece
            EL: { rate: 24 },
            // Spain
            ES: { rate: 21 },
            // France
            FR: { rate: 20 },
            // Croatia
            HR: { rate: 25 },
            // Italy
            IT: { rate: 22 },
            // Cyprus
            CY: { rate: 19 },
            // Latvia
            LV: { rate: 21 },
            // Lithuania
            LT: { rate: 21 },
            // Luxembourg
            LU: { rate: 14 },
            // Hungary
            HU: { rate: 27 },
            // Malta
            MT: { rate: 18 },
            // Netherlands
            NL: { rate: 21 },
            // Austria
            AT: { rate: 20 },
            // Poland
            PL: { rate: 23 },
            // Portugal
            PT: { rate: 23 },
            // Romania
            RO: { rate: 19 },
            // Slovenia
            SI: { rate: 22 },
            // Slovakia
            SK: { rate: 20 },
            // Finland
            FI: { rate: 24 },
            // Sweden
            SE: { rate: 25 },
            // United Kingdom
            UK: { rate: 20 }
        };
        this.CountryCode = countryCode;
        this.AsBusiness = asBusiness;
        this.VATRegistered = VATRegistered;
    }
    getVAT() {
        const europeanCountriesCodes = Object.keys(this.VATRules);
        let VATRate = 0;
        if (europeanCountriesCodes.includes(this.CountryCode)) {
            VATRate = this.VATRules[this.CountryCode].rate;
            if (!this.AsBusiness && !this.VATRegistered) {
                VATRate = this.VATRules.UK.rate;
            }
        }
        return VATRate;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/domain/policies/VATTreatmentPublicationNotOwnedPolicy.ts":
/*!*******************************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/domain/policies/VATTreatmentPublicationNotOwnedPolicy.ts ***!
  \*******************************************************************************************************/
/*! exports provided: VATTreatmentPublicationNotOwnedPolicy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VATTreatmentPublicationNotOwnedPolicy", function() { return VATTreatmentPublicationNotOwnedPolicy; });
/* harmony import */ var _UKVATTreatmentArticleProcessingChargesRule__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./UKVATTreatmentArticleProcessingChargesRule */ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesRule.ts");

/**
 * * 1. Determine if customer is institution
 * * 2. Determine if institution is from UK|EU|Non-EU
 * * 3. Determine if institution IS/IS NOT in business
 */
class VATTreatmentPublicationNotOwnedPolicy {
    constructor() {
        this.VAT_TREATMENT_PUBLICATION_NOT_OWNED = Symbol.for('@VATTreatmentPublicationNotOwnedPolicy');
    }
    /**
     * @Description
     *    Calculate the VAT based on the net value, country code
     *    and indication if the customer is a company or not.
     * @param invoice
     */
    getVAT(countryCode, asBusiness = false, VATRegistered = true) {
        return new _UKVATTreatmentArticleProcessingChargesRule__WEBPACK_IMPORTED_MODULE_0__["UKVATTreatmentArticleProcessingChargesRule"](countryCode, asBusiness, VATRegistered);
    }
    getType() {
        return this.VAT_TREATMENT_PUBLICATION_NOT_OWNED;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/mappers/InvoiceItemMap.ts":
/*!************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/mappers/InvoiceItemMap.ts ***!
  \************************************************************************/
/*! exports provided: InvoiceItemMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceItemMap", function() { return InvoiceItemMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_InvoiceItem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/InvoiceItem */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItem.ts");
/* harmony import */ var _domain_InvoiceId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../domain/InvoiceId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts");
/* harmony import */ var libs_shared_src_lib_modules_invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! libs/shared/src/lib/modules/invoices/domain/ManuscriptId */ "./libs/shared/src/lib/modules/invoices/domain/ManuscriptId.ts");





class InvoiceItemMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const invoiceItemOrError = _domain_InvoiceItem__WEBPACK_IMPORTED_MODULE_2__["InvoiceItem"].create({
            invoiceId: _domain_InvoiceId__WEBPACK_IMPORTED_MODULE_3__["InvoiceId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.invoiceId)).getValue(),
            manuscriptId: libs_shared_src_lib_modules_invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_4__["ManuscriptId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.manuscriptId)).getValue(),
            type: raw.type,
            name: raw.name,
            price: raw.price,
            dateCreated: new Date(raw.dateCreated)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        if (invoiceItemOrError.isFailure) {
            return null;
        }
        return invoiceItemOrError.getValue();
    }
    static toPersistence(invoiceItem) {
        return {
            id: invoiceItem.id.toString(),
            invoiceId: invoiceItem.invoiceId.id.toString(),
            manuscriptId: invoiceItem.manuscriptId.id.toString(),
            type: invoiceItem.type,
            name: invoiceItem.name,
            price: invoiceItem.price,
            dateCreated: invoiceItem.dateCreated
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/mappers/InvoiceMap.ts":
/*!********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/mappers/InvoiceMap.ts ***!
  \********************************************************************/
/*! exports provided: InvoiceMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InvoiceMap", function() { return InvoiceMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_Invoice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/Invoice */ "./libs/shared/src/lib/modules/invoices/domain/Invoice.ts");
/* harmony import */ var _transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../transactions/domain/TransactionId */ "./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts");




class InvoiceMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const invoiceOrError = _domain_Invoice__WEBPACK_IMPORTED_MODULE_2__["Invoice"].create({
            transactionId: _transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_3__["TransactionId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.transactionId)),
            status: raw.status,
            dateCreated: new Date(raw.dateCreated)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        invoiceOrError.isFailure ? console.log(invoiceOrError) : '';
        return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
    }
    static toPersistence(invoice) {
        return {
            id: invoice.id.toString(),
            transactionId: invoice.transactionId.id.toString(),
            status: invoice.status,
            dateCreated: invoice.dateCreated
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/repos/implementations/knexInvoiceRepo.ts":
/*!***************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/repos/implementations/knexInvoiceRepo.ts ***!
  \***************************************************************************************/
/*! exports provided: KnexInvoiceRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KnexInvoiceRepo", function() { return KnexInvoiceRepo; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../mappers/InvoiceMap */ "./libs/shared/src/lib/modules/invoices/mappers/InvoiceMap.ts");
/* harmony import */ var _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../infrastructure/AbstractBaseDBRepo */ "./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts");
/* harmony import */ var _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../infrastructure/RepoError */ "./libs/shared/src/lib/infrastructure/RepoError.ts");




class KnexInvoiceRepo extends _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__["AbstractBaseDBRepo"] {
    getInvoiceById(invoiceId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const invoice = yield db('invoices')
                .select()
                .where('id', invoiceId.id.toString())
                .first();
            if (!invoice) {
                throw _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].createEntityNotFoundError('invoice', invoiceId.id.toString());
            }
            return _mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_1__["InvoiceMap"].toDomain(invoice);
        });
    }
    getInvoiceByInvoiceItemId(invoiceItemId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const invoice = yield db('invoice_items')
                .select()
                .where('id', invoiceItemId.id.toString())
                .first();
            if (!invoice) {
                throw _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].createEntityNotFoundError('invoiceItem', invoiceItemId.id.toString());
            }
            return _mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_1__["InvoiceMap"].toDomain(invoice);
        });
    }
    getInvoicesByTransactionId(transactionId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const invoices = yield db('invoices')
                .select()
                .where('transactionId', transactionId.id.toString());
            return invoices.map(i => _mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_1__["InvoiceMap"].toDomain(i));
        });
    }
    delete(invoice) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const deletedRows = yield db('invoices')
                .where('id', invoice.id.toString())
                .update(Object.assign(Object.assign({}, _mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_1__["InvoiceMap"].toPersistence(invoice)), { deleted: 1 }));
            if (!deletedRows) {
                throw _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].createEntityNotFoundError('invoice', invoice.id.toString());
            }
            return deletedRows;
        });
    }
    update(invoice) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const updated = yield db('invoices')
                .where({ id: invoice.invoiceId.id.toString() })
                .update({
                status: invoice.status,
                dateCreated: invoice.dateCreated,
                transactionId: invoice.transactionId.id.toString()
            });
            if (!updated) {
                throw _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].createEntityNotFoundError('invoice', invoice.id.toString());
            }
            return invoice;
        });
    }
    exists(invoice) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            try {
                yield this.getInvoiceById(invoice.invoiceId);
            }
            catch (e) {
                if (e.code === _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoErrorCode"].ENTITY_NOT_FOUND) {
                    return false;
                }
                throw e;
            }
            return true;
        });
    }
    save(invoice) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const rawInvoice = _mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_1__["InvoiceMap"].toPersistence(invoice);
            try {
                yield db('invoices').insert(rawInvoice);
            }
            catch (e) {
                throw _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].fromDBError(e);
            }
            return this.getInvoiceById(invoice.invoiceId);
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/repos/index.ts":
/*!*************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/repos/index.ts ***!
  \*************************************************************/
/*! exports provided: InvoiceRepoContract, KnexInvoiceRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _implementations_knexInvoiceRepo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./implementations/knexInvoiceRepo */ "./libs/shared/src/lib/modules/invoices/repos/implementations/knexInvoiceRepo.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexInvoiceRepo", function() { return _implementations_knexInvoiceRepo__WEBPACK_IMPORTED_MODULE_0__["KnexInvoiceRepo"]; });

/* harmony import */ var _invoiceRepo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./invoiceRepo */ "./libs/shared/src/lib/modules/invoices/repos/invoiceRepo.ts");
/* harmony import */ var _invoiceRepo__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_invoiceRepo__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceRepoContract", function() { return _invoiceRepo__WEBPACK_IMPORTED_MODULE_1__["InvoiceRepoContract"]; });






/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/repos/invoiceRepo.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/repos/invoiceRepo.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/usecases/createInvoice/createInvoice.ts":
/*!**************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/usecases/createInvoice/createInvoice.ts ***!
  \**************************************************************************************/
/*! exports provided: CreateInvoiceUsecase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreateInvoiceUsecase", function() { return CreateInvoiceUsecase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _domain_Invoice__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../domain/Invoice */ "./libs/shared/src/lib/modules/invoices/domain/Invoice.ts");
/* harmony import */ var _transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../transactions/domain/TransactionId */ "./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts");
/* harmony import */ var _domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../domain/authorization/decorators/Authorize */ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts");
var _a, _b;






class CreateInvoiceUsecase {
    constructor(invoiceRepo, transactionRepo) {
        this.invoiceRepo = invoiceRepo;
        this.transactionRepo = transactionRepo;
        this.invoiceRepo = invoiceRepo;
        this.transactionRepo = transactionRepo;
    }
    getTransaction(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { transactionId } = request;
            if (!transactionId) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Invalid transaction id=${transactionId}`);
            }
            const transaction = yield this.transactionRepo.getTransactionById(_transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_4__["TransactionId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](transactionId)));
            const found = !!transaction;
            if (found) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transaction);
            }
            else {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't find transaction by id=${transactionId}`);
            }
        });
    }
    getAccessControlContext(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return {};
        });
    }
    execute(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { transactionId: rawTransactionId } = request;
            let transactionId;
            if ('transactionId' in request) {
                const transactionOrError = yield this.getTransaction(request);
                if (transactionOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(transactionOrError.error);
                }
                transactionId = _transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_4__["TransactionId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](rawTransactionId));
            }
            try {
                const invoiceProps = {
                    status: _domain_Invoice__WEBPACK_IMPORTED_MODULE_3__["InvoiceStatus"].DRAFT
                };
                if (transactionId) {
                    invoiceProps.transactionId = transactionId;
                }
                // * System creates DRAFT invoice
                const invoiceOrError = _domain_Invoice__WEBPACK_IMPORTED_MODULE_3__["Invoice"].create(invoiceProps);
                if (invoiceOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(invoiceOrError.error);
                }
                // This is where all the magic happens
                const invoice = invoiceOrError.getValue();
                yield this.invoiceRepo.save(invoice);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(invoice);
            }
            catch (err) {
                console.log(err);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}
Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_5__["Authorize"])('create:invoice'),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:type", Function),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:paramtypes", [Object, typeof (_a = typeof CreateInvoiceContext !== "undefined" && CreateInvoiceContext) === "function" ? _a : Object]),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], CreateInvoiceUsecase.prototype, "execute", null);


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/usecases/deleteInvoice/deleteInvoice.ts":
/*!**************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/usecases/deleteInvoice/deleteInvoice.ts ***!
  \**************************************************************************************/
/*! exports provided: DeleteInvoiceUsecase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DeleteInvoiceUsecase", function() { return DeleteInvoiceUsecase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _domain_InvoiceId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../domain/InvoiceId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts");
/* harmony import */ var _domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../domain/authorization/decorators/Authorize */ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts");
var _a, _b;





class DeleteInvoiceUsecase {
    constructor(invoiceRepo) {
        this.invoiceRepo = invoiceRepo;
    }
    getInvoice(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { invoiceId } = request;
            if (!invoiceId) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Invalid invoice id=${invoiceId}`);
            }
            const invoice = yield this.invoiceRepo.getInvoiceById(_domain_InvoiceId__WEBPACK_IMPORTED_MODULE_3__["InvoiceId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](invoiceId)).getValue());
            const found = !!invoice;
            if (found) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(invoice);
            }
            else {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't find invoice by id=${invoiceId}`);
            }
        });
    }
    getAccessControlContext(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return {};
        });
    }
    execute(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            try {
                // * System looks-up the invoice
                const invoiceOrError = yield this.getInvoice(request);
                if (invoiceOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(invoiceOrError.error);
                }
                const invoice = invoiceOrError.getValue();
                // * This is where all the magic happens
                yield this.invoiceRepo.delete(invoice);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(null);
            }
            catch (err) {
                console.log(err);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}
Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_4__["Authorize"])('invoice:delete'),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:type", Function),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:paramtypes", [Object, typeof (_a = typeof DeleteInvoiceContext !== "undefined" && DeleteInvoiceContext) === "function" ? _a : Object]),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], DeleteInvoiceUsecase.prototype, "execute", null);


/***/ }),

/***/ "./libs/shared/src/lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails.ts":
/*!**********************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails.ts ***!
  \**********************************************************************************************/
/*! exports provided: GetInvoiceDetailsUsecase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GetInvoiceDetailsUsecase", function() { return GetInvoiceDetailsUsecase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _domain_InvoiceId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../domain/InvoiceId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts");
/* harmony import */ var _domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../domain/authorization/decorators/Authorize */ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts");
var _a, _b;





class GetInvoiceDetailsUsecase {
    constructor(invoiceRepo) {
        this.invoiceRepo = invoiceRepo;
        this.invoiceRepo = invoiceRepo;
    }
    getInvoice(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { invoiceId } = request;
            if (!invoiceId) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Invalid invoice id=${invoiceId}`);
            }
            const invoice = yield this.invoiceRepo.getInvoiceById(_domain_InvoiceId__WEBPACK_IMPORTED_MODULE_3__["InvoiceId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](invoiceId)).getValue());
            const found = !!invoice;
            if (found) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(invoice);
            }
            else {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't find invoice by id=${invoiceId}`);
            }
        });
    }
    getAccessControlContext(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return {};
        });
    }
    execute(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            // if ('transactionId' in request) {
            //   const transactionOrError = await this.getTransaction(request);
            //   if (transactionOrError.isFailure) {
            //     return Result.fail<Invoice>(transactionOrError.error);
            //   }
            //   transactionId = TransactionId.create(
            //     new UniqueEntityID(rawTransactionId)
            //   );
            // }
            try {
                // * System looks-up the invoice
                const invoiceOrError = yield this.getInvoice(request);
                if (invoiceOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(invoiceOrError.error);
                }
                const invoice = invoiceOrError.getValue();
                // * This is where all the magic happens
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(invoice);
            }
            catch (err) {
                console.log(err);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}
Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_4__["Authorize"])('invoice:read'),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:type", Function),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:paramtypes", [Object, typeof (_a = typeof GetInvoiceDetailsContext !== "undefined" && GetInvoiceDetailsContext) === "function" ? _a : Object]),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], GetInvoiceDetailsUsecase.prototype, "execute", null);


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/domain/Payer.ts":
/*!************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/domain/Payer.ts ***!
  \************************************************************/
/*! exports provided: Payer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Payer", function() { return Payer; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../core/logic/Guard */ "./libs/shared/src/lib/core/logic/Guard.ts");
/* harmony import */ var _PayerId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PayerId */ "./libs/shared/src/lib/modules/payers/domain/PayerId.ts");
// * Core Domain




class Payer extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get id() {
        return this._id;
    }
    get payerId() {
        return _PayerId__WEBPACK_IMPORTED_MODULE_3__["PayerId"].create(this.id);
    }
    get type() {
        return this.props.type;
    }
    get title() {
        return this.props.title;
    }
    get surname() {
        return this.props.surname;
    }
    get name() {
        return this.props.name;
    }
    get email() {
        return this.props.email;
    }
    get phone() {
        return this.props.phone;
    }
    get organization() {
        return this.props.organization;
    }
    get shippingAddressId() {
        return this.props.shippingAddressId;
    }
    get billingAddressId() {
        return this.props.billingAddressId;
    }
    get dateAdded() {
        return this.props.dateAdded;
    }
    get uniqueIdentificationNumber() {
        return this.props.uniqueIdentificationNumber;
    }
    get VATId() {
        return this.props.VATId;
    }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const propsResult = _core_logic_Guard__WEBPACK_IMPORTED_MODULE_2__["Guard"].againstNullOrUndefinedBulk([
            { argument: props.name, argumentName: 'name' },
            { argument: props.surname, argumentName: 'surname' },
            { argument: props.type, argumentName: 'type' }
        ]);
        if (!propsResult.succeeded) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(propsResult.message);
        }
        const payer = new Payer(Object.assign(Object.assign({}, props), { dateAdded: props.dateAdded ? props.dateAdded : new Date() }), id);
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(payer);
    }
    set(key, value) {
        this.props[key] = value;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/domain/PayerId.ts":
/*!**************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/domain/PayerId.ts ***!
  \**************************************************************/
/*! exports provided: PayerId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayerId", function() { return PayerId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class PayerId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new PayerId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/domain/PayerName.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/domain/PayerName.ts ***!
  \****************************************************************/
/*! exports provided: PayerName */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayerName", function() { return PayerName; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class PayerName extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(name) {
        if (!!name === false || name.length === 0) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('Must provide a payer name');
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new PayerName({ value: name }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/domain/PayerTitle.ts":
/*!*****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/domain/PayerTitle.ts ***!
  \*****************************************************************/
/*! exports provided: PayerTitle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayerTitle", function() { return PayerTitle; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class PayerTitle extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(type) {
        if (!!type === false || type.length === 0) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('Must provide a payer title');
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new PayerTitle({ value: type }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/domain/PayerType.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/domain/PayerType.ts ***!
  \****************************************************************/
/*! exports provided: PayerType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayerType", function() { return PayerType; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class PayerType extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(type) {
        if (!!type === false || type.length === 0) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('Must provide a payer type');
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new PayerType({ value: type }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/mapper/Payer.ts":
/*!************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/mapper/Payer.ts ***!
  \************************************************************/
/*! exports provided: PayerMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayerMap", function() { return PayerMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _domain_Name__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../domain/Name */ "./libs/shared/src/lib/domain/Name.ts");
/* harmony import */ var _domain_PhoneNumber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../domain/PhoneNumber */ "./libs/shared/src/lib/domain/PhoneNumber.ts");
/* harmony import */ var _domain_Email__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../domain/Email */ "./libs/shared/src/lib/domain/Email.ts");
/* harmony import */ var _addresses_domain_AddressId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../addresses/domain/AddressId */ "./libs/shared/src/lib/modules/addresses/domain/AddressId.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_Payer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../domain/Payer */ "./libs/shared/src/lib/modules/payers/domain/Payer.ts");
/* harmony import */ var _domain_PayerTitle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../domain/PayerTitle */ "./libs/shared/src/lib/modules/payers/domain/PayerTitle.ts");
/* harmony import */ var _domain_PayerName__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../domain/PayerName */ "./libs/shared/src/lib/modules/payers/domain/PayerName.ts");
/* harmony import */ var _domain_PayerType__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../domain/PayerType */ "./libs/shared/src/lib/modules/payers/domain/PayerType.ts");










class PayerMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_5__["Mapper"] {
    static toDomain(raw) {
        const result = _domain_Payer__WEBPACK_IMPORTED_MODULE_6__["Payer"].create({
            title: _domain_PayerTitle__WEBPACK_IMPORTED_MODULE_7__["PayerTitle"].create(raw.title).getValue(),
            type: _domain_PayerType__WEBPACK_IMPORTED_MODULE_9__["PayerType"].create(raw.type).getValue(),
            surname: _domain_PayerName__WEBPACK_IMPORTED_MODULE_8__["PayerName"].create(raw.surname).getValue(),
            name: _domain_PayerName__WEBPACK_IMPORTED_MODULE_8__["PayerName"].create(raw.name).getValue(),
            organization: _domain_Name__WEBPACK_IMPORTED_MODULE_1__["Name"].create(raw.organization).getValue(),
            email: _domain_Email__WEBPACK_IMPORTED_MODULE_3__["Email"].create(raw.email).getValue(),
            phone: _domain_PhoneNumber__WEBPACK_IMPORTED_MODULE_2__["PhoneNumber"].create(raw.phone).getValue(),
            shippingAddressId: _addresses_domain_AddressId__WEBPACK_IMPORTED_MODULE_4__["AddressId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.shippingAddressId)),
            billingAddressId: _addresses_domain_AddressId__WEBPACK_IMPORTED_MODULE_4__["AddressId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.billingAddressId)),
            VATId: raw.VATId,
            dateAdded: new Date(raw.dateAdded)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        if (result.isFailure) {
            console.log(result);
        }
        return result.isSuccess ? result.getValue() : null;
    }
    static toPersistence(payer) {
        return {
            id: payer.id.toString(),
            type: payer.type.value,
            title: payer.title.value,
            surname: payer.surname.value,
            name: payer.name.value,
            organization: payer.organization.value,
            email: payer.email.value,
            phone: payer.phone.value,
            uniqueIdentificationNumber: payer.uniqueIdentificationNumber,
            shippingAddressId: payer.shippingAddressId.id.toString(),
            billingAddressId: payer.billingAddressId.id.toString(),
            dateAdded: payer.dateAdded,
            VATId: payer.VATId
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payers/repos/payerRepo.ts":
/*!***************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payers/repos/payerRepo.ts ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/Payment.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/Payment.ts ***!
  \****************************************************************/
/*! exports provided: Payment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Payment", function() { return Payment; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _PaymentId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PaymentId */ "./libs/shared/src/lib/modules/payments/domain/PaymentId.ts");
// * Core Domain



class Payment extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get id() {
        return this._id;
    }
    get paymentId() {
        return _PaymentId__WEBPACK_IMPORTED_MODULE_2__["PaymentId"].create(this.id);
    }
    get invoiceId() {
        return this.props.invoiceId;
    }
    get payerId() {
        return this.props.payerId;
    }
    get paymentMethodId() {
        return this.props.paymentMethodId;
    }
    get paymentProof() {
        return this.props.paymentProof;
    }
    get amount() {
        return this.props.amount;
    }
    get datePaid() {
        return this.props.datePaid;
    }
    get foreignPaymentId() {
        return this.props.foreignPaymentId;
    }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const payment = new Payment(Object.assign({}, props), id);
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(payment);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/PaymentId.ts":
/*!******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/PaymentId.ts ***!
  \******************************************************************/
/*! exports provided: PaymentId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentId", function() { return PaymentId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class PaymentId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new PaymentId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/PaymentMethod.ts":
/*!**********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/PaymentMethod.ts ***!
  \**********************************************************************/
/*! exports provided: PaymentMethod */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentMethod", function() { return PaymentMethod; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _PaymentMethodId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PaymentMethodId */ "./libs/shared/src/lib/modules/payments/domain/PaymentMethodId.ts");
// * Core Domain


// import {Guard} from '../../core/Guard';
// * Subdomain

class PaymentMethod extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    get id() {
        return this._id;
    }
    get paymentMethodId() {
        return _PaymentMethodId__WEBPACK_IMPORTED_MODULE_2__["PaymentMethodId"].create(this.id);
    }
    get name() {
        return this.props.name;
    }
    get isActive() {
        return this.props.isActive;
    }
    set isActive(toggle) {
        this.props.isActive = toggle;
    }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        // const guardResult = Guard.againstNullOrUndefinedBulk([
        //   {argument: props.email, argumentName: 'email'},
        //   {argument: props.password, argumentName: 'password'}
        // ]);
        // if (!guardResult.succeeded) {
        //   return Result.fail<User>(guardResult.message);
        // } else {
        const paymentMethod = new PaymentMethod(Object.assign({}, props), id);
        // const idWasProvided = !!id;
        // if (!idWasProvided) {
        //   user.addDomainEvent(new UserCreatedEvent(user));
        // }
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(paymentMethod);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/PaymentMethodId.ts":
/*!************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/PaymentMethodId.ts ***!
  \************************************************************************/
/*! exports provided: PaymentMethodId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentMethodId", function() { return PaymentMethodId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class PaymentMethodId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new PaymentMethodId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/contracts/PaymentModel.ts":
/*!*******************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/contracts/PaymentModel.ts ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/contracts/PaymentService.ts":
/*!*********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/contracts/PaymentService.ts ***!
  \*********************************************************************************/
/*! exports provided: PaymentService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentService", function() { return PaymentService; });
class PaymentService {
    appliesTo(provider) {
        return `@${this.constructor.name}` === Symbol.keyFor(provider);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/strategies/CreditCard.ts":
/*!******************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/strategies/CreditCard.ts ***!
  \******************************************************************************/
/*! exports provided: CreditCard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreditCard", function() { return CreditCard; });
class CreditCard {
    constructor() {
        this.CREDIT_CARD_PAYMENT = Symbol.for('@CreditCardPayment');
    }
    get cardHolder() {
        return this.CardHolderName;
    }
    set cardHolder(value) {
        this.CardHolderName = value;
    }
    get cardNumber() {
        return this.CardNumber;
    }
    set cardNumber(value) {
        this.CardNumber = value;
    }
    get expirationMonth() {
        return this.ExpirationMonth;
    }
    set expirationMonth(value) {
        this.ExpirationMonth = value;
    }
    get expirationYear() {
        return this.ExpirationYear;
    }
    set expirationYear(value) {
        this.ExpirationYear = value;
    }
    getType() {
        return this.CREDIT_CARD_PAYMENT;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/strategies/CreditCardPayment.ts":
/*!*************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/strategies/CreditCardPayment.ts ***!
  \*************************************************************************************/
/*! exports provided: CreditCardPayment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreditCardPayment", function() { return CreditCardPayment; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _contracts_PaymentService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contracts/PaymentService */ "./libs/shared/src/lib/modules/payments/domain/contracts/PaymentService.ts");


class CreditCardPayment extends _contracts_PaymentService__WEBPACK_IMPORTED_MODULE_1__["PaymentService"] {
    // private ccNum: string = '';
    // private ccType: string = '';
    // private cvvNum: string = '';
    // private ccExpMonth: string = '';
    // private ccExpYear: string = '';
    constructor(paymentGateway) {
        super();
        this.paymentGateway = paymentGateway;
        this.paymentGateway = paymentGateway;
    }
    makePayment(pm, amount) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            console.log(`Paying ${amount} using Credit Card method with "${this.paymentGateway.config.environment.server}"`);
            // const clientToken: string = await this.generateClientToken();
            // await this.findPaymentMethodNonce(paymentMethodNonce);
            // const paymentMethod = await this.createPaymentMethod();
            const paymentMethodNonce = yield this.createPaymentMethodNonce();
            return this.createTransaction(paymentMethodNonce, amount);
        });
    }
    createTransaction(paymentMethodNonce, amount) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.paymentGateway.transaction.sale({
                    amount,
                    paymentMethodNonce,
                    options: {
                        // threeDSecure: true,
                        submitForSettlement: true
                    }
                }, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result);
                });
            });
        });
    }
    // private async generateClientToken(): Promise<any> {
    //   return new Promise((resolve, reject) => {
    //     this.paymentGateway.clientToken.generate(
    //       {},
    //       (err: any, response: any) => {
    //         const {clientToken} = response;
    //         return resolve(clientToken);
    //       }
    //     );
    //   });
    // }
    // private async createPaymentMethod(): Promise<any> {
    //   return new Promise((resolve, reject) => {
    //     this.paymentGateway.paymentMethod.create(
    //       {},
    //       (err: any, response: any) => {
    //         const {clientToken} = response;
    //         return resolve(clientToken);
    //       }
    //     );
    //   });
    // }
    createPaymentMethodNonce() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.paymentGateway.paymentMethodNonce.create('PersonalCard', (err, response) => {
                    if (err) {
                        console.info(err);
                        return reject(err);
                    }
                    const { nonce } = response.paymentMethodNonce;
                    return resolve(nonce);
                });
            });
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/strategies/PaymentFactory.ts":
/*!**********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/strategies/PaymentFactory.ts ***!
  \**********************************************************************************/
/*! exports provided: PaymentFactory */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentFactory", function() { return PaymentFactory; });
class PaymentFactory {
    constructor() {
        this.payments = new Map();
    }
    /**
     * All available gateways
     *
     * @return array An array of gateway names
     */
    all() {
        return this.payments;
    }
    registerPayment(pm) {
        this.payments.set(pm.getType(), pm);
    }
    /**
     * Create a new payment instance
     *
     */
    create(paymentType) {
        return this.payments.get(this.createSymbolOf(paymentType));
    }
    createSymbolOf(value) {
        return Symbol.for(`@${value}`);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/domain/strategies/PaymentStrategy.ts":
/*!***********************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/domain/strategies/PaymentStrategy.ts ***!
  \***********************************************************************************/
/*! exports provided: PaymentStrategy */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentStrategy", function() { return PaymentStrategy; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);

class PaymentStrategy {
    constructor(paymentServices) {
        if (paymentServices === null) {
            throw new Error(typeof paymentServices);
        }
        this.paymentServices = new Map(paymentServices);
    }
    makePayment(model, amount = 0) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return this.getPaymentService(model).makePayment(model, amount);
        });
    }
    getPaymentService(model) {
        const [result] = Array.from(this.paymentServices.values()).filter(p => {
            return p.appliesTo(model.getType());
        });
        if (result === null) {
            throw new Error(`Payment service for ${model.getType().toString()} not registered.`);
        }
        return result;
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/infrastructure/gateways/braintree/gateway.ts":
/*!*******************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/infrastructure/gateways/braintree/gateway.ts ***!
  \*******************************************************************************************/
/*! exports provided: BraintreeGateway */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BraintreeGateway", function() { return BraintreeGateway; });
/* harmony import */ var braintree__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! braintree */ "braintree");
/* harmony import */ var braintree__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(braintree__WEBPACK_IMPORTED_MODULE_0__);

let environment = '';
let BraintreeGateway = null;
__webpack_require__(/*! dotenv */ "dotenv").config();
if (!process.env.BT_ENVIRONMENT ||
    !process.env.BT_MERCHANT_ID ||
    !process.env.BT_PUBLIC_KEY ||
    !process.env.BT_PRIVATE_KEY) {
    throw new Error('Cannot find necessary environmental variables. See https://github.com/braintree/braintree_express_example#setup-instructions for instructions');
}
environment =
    process.env.BT_ENVIRONMENT.charAt(0).toUpperCase() +
        process.env.BT_ENVIRONMENT.slice(1);
BraintreeGateway = new braintree__WEBPACK_IMPORTED_MODULE_0__["BraintreeGateway"]({
    environment: braintree__WEBPACK_IMPORTED_MODULE_0__["Environment"][environment],
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY
});



/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/mapper/Payment.ts":
/*!****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/mapper/Payment.ts ***!
  \****************************************************************/
/*! exports provided: PaymentMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentMap", function() { return PaymentMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_Payment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/Payment */ "./libs/shared/src/lib/modules/payments/domain/Payment.ts");
/* harmony import */ var _domain_PaymentMethodId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../domain/PaymentMethodId */ "./libs/shared/src/lib/modules/payments/domain/PaymentMethodId.ts");
/* harmony import */ var _invoices_domain_InvoiceId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../invoices/domain/InvoiceId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts");
/* harmony import */ var _payers_domain_PayerId__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../payers/domain/PayerId */ "./libs/shared/src/lib/modules/payers/domain/PayerId.ts");
/* harmony import */ var _domain_Amount__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../domain/Amount */ "./libs/shared/src/lib/domain/Amount.ts");







class PaymentMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const invoiceOrError = _domain_Payment__WEBPACK_IMPORTED_MODULE_2__["Payment"].create({
            payerId: _payers_domain_PayerId__WEBPACK_IMPORTED_MODULE_5__["PayerId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.payerId)),
            invoiceId: _invoices_domain_InvoiceId__WEBPACK_IMPORTED_MODULE_4__["InvoiceId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.invoiceId)).getValue(),
            amount: _domain_Amount__WEBPACK_IMPORTED_MODULE_6__["Amount"].create(raw.amount).getValue(),
            paymentMethodId: _domain_PaymentMethodId__WEBPACK_IMPORTED_MODULE_3__["PaymentMethodId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.paymentMethodId)),
            foreignPaymentId: raw.foreignPaymentId,
            datePaid: new Date(raw.datePaid)
            //  paymentProof: FileMap.toDomain(raw.paymentProof)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        invoiceOrError.isFailure ? console.log(invoiceOrError) : '';
        return invoiceOrError.isSuccess ? invoiceOrError.getValue() : null;
    }
    static toPersistence(payment) {
        return {
            id: payment.id.toString(),
            invoiceId: payment.invoiceId.id.toString(),
            payerId: payment.payerId.id.toString(),
            paymentMethodId: payment.paymentMethodId.id.toString(),
            amount: payment.amount.value,
            datePaid: payment.datePaid,
            foreignPaymentId: payment.foreignPaymentId
            // paymentProof: FileMap.toPersistence(payment.paymentProof)
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/mapper/PaymentMethod.ts":
/*!**********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/mapper/PaymentMethod.ts ***!
  \**********************************************************************/
/*! exports provided: PaymentMethodMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PaymentMethodMap", function() { return PaymentMethodMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_PaymentMethod__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/PaymentMethod */ "./libs/shared/src/lib/modules/payments/domain/PaymentMethod.ts");



class PaymentMethodMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const paymentMethodOrError = _domain_PaymentMethod__WEBPACK_IMPORTED_MODULE_2__["PaymentMethod"].create({
            name: raw.name,
            isActive: !!raw.isActive
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        paymentMethodOrError.isFailure ? console.log(paymentMethodOrError) : '';
        return paymentMethodOrError.isSuccess
            ? paymentMethodOrError.getValue()
            : null;
    }
    static toPersistence(paymentMethod) {
        return {
            id: paymentMethod.id.toString(),
            name: paymentMethod.name,
            isActive: paymentMethod.isActive
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/repos/paymentMethodRepo.ts":
/*!*************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/repos/paymentMethodRepo.ts ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/payments/repos/paymentRepo.ts":
/*!*******************************************************************!*\
  !*** ./libs/shared/src/lib/modules/payments/repos/paymentRepo.ts ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/domain/Invoices.ts":
/*!*********************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/domain/Invoices.ts ***!
  \*********************************************************************/
/*! exports provided: Invoices */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Invoices", function() { return Invoices; });
/* harmony import */ var _core_domain_WatchedList__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/WatchedList */ "./libs/shared/src/lib/core/domain/WatchedList.ts");

class Invoices extends _core_domain_WatchedList__WEBPACK_IMPORTED_MODULE_0__["WatchedList"] {
    constructor(initialInvoices) {
        super(initialInvoices);
    }
    compareItems(a, b) {
        return a.equals(b);
    }
    static create(invoices) {
        return new Invoices(invoices ? invoices : []);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/domain/Transaction.ts":
/*!************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/domain/Transaction.ts ***!
  \************************************************************************/
/*! exports provided: STATUS, Transaction */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS", function() { return STATUS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Transaction", function() { return Transaction; });
/* harmony import */ var _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/AggregateRoot */ "./libs/shared/src/lib/core/domain/AggregateRoot.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _TransactionId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TransactionId */ "./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts");
/* harmony import */ var _Invoices__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Invoices */ "./libs/shared/src/lib/modules/transactions/domain/Invoices.ts");
// * Core Domain




var STATUS;
(function (STATUS) {
    STATUS[STATUS["DRAFT"] = 0] = "DRAFT";
    STATUS[STATUS["ACTIVE"] = 1] = "ACTIVE";
    STATUS[STATUS["FINAL"] = 2] = "FINAL"; // after all its associated invoices are being set to final. An event shall be publicized on the Event Bus.
})(STATUS || (STATUS = {}));
class Transaction extends _core_domain_AggregateRoot__WEBPACK_IMPORTED_MODULE_0__["AggregateRoot"] {
    /**
     * * Getters
     */
    get id() {
        return this._id;
    }
    get transactionId() {
        return _TransactionId__WEBPACK_IMPORTED_MODULE_2__["TransactionId"].create(this.id);
    }
    get status() {
        return this.props.status;
    }
    get dateCreated() {
        return this.props.dateCreated;
    }
    get dateUpdated() {
        return this.props.dateUpdated;
    }
    get deleted() {
        return this.props.deleted;
    }
    get invoices() {
        return this.props.invoices;
    }
    get totalNumInvoices() {
        return this.props.totalNumInvoices;
    }
    // get netAmount(): number {
    //   return this.props.invoices.reduce((amount: number, invoice: Invoice) => {
    //     // invoice.netAmount = Math.round(
    //     //   this.amount.value / this.props.invoices.length
    //     // );
    //     amount += invoice.invoiceItems.reduce(
    //       (price: number, invoiceItem: InvoiceItem) => {
    //         price += invoiceItem.price;
    //         return price;
    //       },
    //       0
    //     );
    //     return amount;
    //   }, 0);
    // }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        const defaultValues = Object.assign(Object.assign({}, props), { invoices: props.invoices ? props.invoices : _Invoices__WEBPACK_IMPORTED_MODULE_3__["Invoices"].create([]), totalNumInvoices: props.totalNumInvoices ? props.totalNumInvoices : 0, dateCreated: props.dateCreated ? props.dateCreated : new Date() });
        const transaction = new Transaction(defaultValues, id);
        // TODO: Waiting confirmation from the PO.
        // const idWasProvided = !!id;
        // if (!idWasProvided) {
        //   transaction.addDomainEvent(
        //     new TransactionCreatedEvent(transaction, new Date())
        //   );
        // }
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transaction);
    }
    removeInvoiceIfExists(invoice) {
        if (this.props.invoices.exists(invoice)) {
            this.props.invoices.remove(invoice);
        }
    }
    addInvoice(invoice) {
        this.removeInvoiceIfExists(invoice);
        this.props.invoices.add(invoice);
        this.props.totalNumInvoices++;
        // this.addDomainEvent(new CommentPosted(this, comment));
        return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok();
    }
    // public removeInvoice(invoice: Invoice): void {
    //   this.props.invoices = this.props.invoices.filter(
    //     i => !i.id.equals(invoice.id)
    //   );
    //   // adjust invoices net amounts
    //   this.adjustInvoices();
    // }
    // public clearInvoices(): void {
    //   this.props.invoices = [];
    // }
    // private adjustInvoices(): void {
    //   this.props.invoices.forEach(invoice => {
    //     // invoice.netAmount = Math.round(
    //     //   this.amount.value / this.props.invoices.length
    //     // );
    //   });
    // }
    markAsFinal() {
        const now = new Date();
        this.props.dateUpdated = now;
        this.props.status = STATUS.FINAL;
        // this.addDomainEvent(new InvoicePaidEvent(this.invoiceId, now));
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/domain/TransactionAmount.ts":
/*!******************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/domain/TransactionAmount.ts ***!
  \******************************************************************************/
/*! exports provided: TransactionAmount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransactionAmount", function() { return TransactionAmount; });
/* harmony import */ var _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/ValueObject */ "./libs/shared/src/lib/core/domain/ValueObject.ts");
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class TransactionAmount extends _core_domain_ValueObject__WEBPACK_IMPORTED_MODULE_0__["ValueObject"] {
    get value() {
        return this.props.value;
    }
    constructor(props) {
        super(props);
    }
    static create(value) {
        if (isNaN(value) || value === 0 || value < 0) {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail('Must provide a valid amount');
        }
        else {
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(new TransactionAmount({ value }));
        }
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts":
/*!**************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts ***!
  \**************************************************************************/
/*! exports provided: TransactionId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransactionId", function() { return TransactionId; });
/* harmony import */ var _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/Entity */ "./libs/shared/src/lib/core/domain/Entity.ts");

class TransactionId extends _core_domain_Entity__WEBPACK_IMPORTED_MODULE_0__["Entity"] {
    get id() {
        return this._id;
    }
    constructor(id) {
        super(null, id);
    }
    static create(id) {
        return new TransactionId(id);
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/mappers/TransactionMap.ts":
/*!****************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/mappers/TransactionMap.ts ***!
  \****************************************************************************/
/*! exports provided: TransactionMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransactionMap", function() { return TransactionMap; });
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../infrastructure/Mapper */ "./libs/shared/src/lib/infrastructure/Mapper.ts");
/* harmony import */ var _domain_Transaction__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../domain/Transaction */ "./libs/shared/src/lib/modules/transactions/domain/Transaction.ts");



class TransactionMap extends _infrastructure_Mapper__WEBPACK_IMPORTED_MODULE_1__["Mapper"] {
    static toDomain(raw) {
        const transactionOrError = _domain_Transaction__WEBPACK_IMPORTED_MODULE_2__["Transaction"].create({
            deleted: raw.deleted,
            status: raw.status,
            dateCreated: new Date(raw.dateCreated),
            dateUpdated: new Date(raw.dateUpdated)
        }, new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"](raw.id));
        transactionOrError.isFailure ? console.log(transactionOrError) : '';
        return transactionOrError.isSuccess ? transactionOrError.getValue() : null;
    }
    static toPersistence(transaction) {
        return {
            id: transaction.id.toString(),
            status: transaction.status,
            dateCreated: transaction.dateCreated,
            dateUpdated: transaction.dateUpdated
        };
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/repos/implementations/knexTransactionRepo.ts":
/*!***********************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/repos/implementations/knexTransactionRepo.ts ***!
  \***********************************************************************************************/
/*! exports provided: KnexTransactionRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KnexTransactionRepo", function() { return KnexTransactionRepo; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../mappers/TransactionMap */ "./libs/shared/src/lib/modules/transactions/mappers/TransactionMap.ts");
/* harmony import */ var _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../infrastructure/AbstractBaseDBRepo */ "./libs/shared/src/lib/infrastructure/AbstractBaseDBRepo.ts");
/* harmony import */ var _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../infrastructure/RepoError */ "./libs/shared/src/lib/infrastructure/RepoError.ts");




class KnexTransactionRepo extends _infrastructure_AbstractBaseDBRepo__WEBPACK_IMPORTED_MODULE_2__["AbstractBaseDBRepo"] {
    getTransactionById(transactionId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const transactionRow = yield db('transactions')
                .select()
                .where('id', transactionId.id.toString())
                .first();
            return transactionRow ? _mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__["TransactionMap"].toDomain(transactionRow) : null;
        });
    }
    getTransactionByInvoiceId(invoiceId) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const transactionRow = yield db('transactions')
                .select()
                .where('invoice_id', invoiceId.id.toString())
                .first();
            return transactionRow ? _mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__["TransactionMap"].toDomain(transactionRow) : null;
        });
    }
    getTransactionCollection() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const transactionsRows = yield db('transactions');
            return transactionsRows.reduce((aggregator, t) => {
                aggregator.push(_mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__["TransactionMap"].toDomain(t));
                return aggregator;
            }, []);
        });
    }
    delete(transaction) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const deletedRows = yield db('transactions')
                .where('id', transaction.id.toString())
                .update(Object.assign(Object.assign({}, _mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__["TransactionMap"].toPersistence(transaction)), { deleted: 1 }));
            return deletedRows
                ? deletedRows
                : Promise.reject(_infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].createEntityNotFoundError('transaction', transaction.id.toString()));
        });
    }
    update(transaction) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const updated = yield db('transactions')
                .where({ id: transaction.id.toString() })
                .update(_mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__["TransactionMap"].toPersistence(transaction));
            if (!updated) {
                throw _infrastructure_RepoError__WEBPACK_IMPORTED_MODULE_3__["RepoError"].createEntityNotFoundError('transaction', transaction.id.toString());
            }
            return transaction;
        });
    }
    exists(transaction) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const result = yield this.getTransactionById(transaction.transactionId);
            return !!result;
        });
    }
    save(transaction) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { db } = this;
            const data = _mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_1__["TransactionMap"].toPersistence(transaction);
            yield db('transactions').insert(data);
            return this.getTransactionById(transaction.transactionId);
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/repos/index.ts":
/*!*****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/repos/index.ts ***!
  \*****************************************************************/
/*! exports provided: TransactionRepoContract, KnexTransactionRepo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _transactionRepo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./transactionRepo */ "./libs/shared/src/lib/modules/transactions/repos/transactionRepo.ts");
/* harmony import */ var _transactionRepo__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_transactionRepo__WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TransactionRepoContract", function() { return _transactionRepo__WEBPACK_IMPORTED_MODULE_0__["TransactionRepoContract"]; });

/* harmony import */ var _implementations_knexTransactionRepo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./implementations/knexTransactionRepo */ "./libs/shared/src/lib/modules/transactions/repos/implementations/knexTransactionRepo.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexTransactionRepo", function() { return _implementations_knexTransactionRepo__WEBPACK_IMPORTED_MODULE_1__["KnexTransactionRepo"]; });






/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/repos/transactionRepo.ts":
/*!***************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/repos/transactionRepo.ts ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction.ts":
/*!**************************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction.ts ***!
  \**************************************************************************************************/
/*! exports provided: CreateTransactionUsecase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CreateTransactionUsecase", function() { return CreateTransactionUsecase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _utils_TextUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../utils/TextUtil */ "./libs/shared/src/lib/utils/TextUtil.ts");
/* harmony import */ var _domain_Transaction__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../domain/Transaction */ "./libs/shared/src/lib/modules/transactions/domain/Transaction.ts");
/* harmony import */ var _articles_domain_Article__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../articles/domain/Article */ "./libs/shared/src/lib/modules/articles/domain/Article.ts");
/* harmony import */ var _articles_domain_ArticleId__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../articles/domain/ArticleId */ "./libs/shared/src/lib/modules/articles/domain/ArticleId.ts");
/* harmony import */ var _invoices_domain_Invoice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./../../../invoices/domain/Invoice */ "./libs/shared/src/lib/modules/invoices/domain/Invoice.ts");
/* harmony import */ var _invoices_domain_InvoiceItem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./../../../invoices/domain/InvoiceItem */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItem.ts");
/* harmony import */ var _invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../../invoices/domain/ManuscriptId */ "./libs/shared/src/lib/modules/invoices/domain/ManuscriptId.ts");
/* harmony import */ var _domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../../domain/authorization/decorators/Authorize */ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts");
var _a, _b;











class CreateTransactionUsecase {
    constructor(transactionRepo, articleRepo, invoiceRepo, invoiceItemRepo) {
        this.transactionRepo = transactionRepo;
        this.articleRepo = articleRepo;
        this.invoiceRepo = invoiceRepo;
        this.invoiceItemRepo = invoiceItemRepo;
        this.transactionRepo = transactionRepo;
        this.articleRepo = articleRepo;
        this.invoiceRepo = invoiceRepo;
        this.invoiceItemRepo = invoiceItemRepo;
    }
    getArticle(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { manuscriptId, journalId, title, articleTypeId, authorEmail, authorCountry, authorSurname } = request;
            const isArticleIdProvided = _utils_TextUtil__WEBPACK_IMPORTED_MODULE_3__["TextUtil"].isUUID(manuscriptId);
            if (isArticleIdProvided) {
                if (!manuscriptId) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Invalid manuscript id=${manuscriptId}`);
                }
                const article = yield this.articleRepo.findById(_invoices_domain_ManuscriptId__WEBPACK_IMPORTED_MODULE_9__["ManuscriptId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](manuscriptId)).getValue());
                const found = !!article;
                if (found) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(article);
                }
                else {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't find manuscript by id=${manuscriptId}`);
                }
            }
            else {
                const newArticleResult = _articles_domain_Article__WEBPACK_IMPORTED_MODULE_5__["Article"].create({
                    journalId,
                    title,
                    articleTypeId,
                    authorEmail,
                    authorCountry,
                    authorSurname
                });
                yield this.articleRepo.save(newArticleResult.getValue());
                return newArticleResult;
            }
        });
    }
    getAccessControlContext(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return {};
        });
    }
    execute(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { manuscriptId: rawManuscriptId } = request;
            let manuscriptId;
            if ('manuscriptId' in request) {
                const articleOrError = yield this.getArticle(request);
                if (articleOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(articleOrError.error);
                }
                manuscriptId = _articles_domain_ArticleId__WEBPACK_IMPORTED_MODULE_6__["ArticleId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](rawManuscriptId));
            }
            try {
                const transactionProps = {
                    status: _domain_Transaction__WEBPACK_IMPORTED_MODULE_4__["STATUS"].DRAFT
                };
                // * System creates DRAFT transaction
                const transactionOrError = _domain_Transaction__WEBPACK_IMPORTED_MODULE_4__["Transaction"].create(transactionProps);
                if (transactionOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(transactionOrError.error);
                }
                // This is where all the magic happens
                const transaction = transactionOrError.getValue();
                yield this.transactionRepo.save(transaction);
                // * System creates DRAFT invoice
                const invoiceProps = {
                    status: _invoices_domain_Invoice__WEBPACK_IMPORTED_MODULE_7__["InvoiceStatus"].DRAFT,
                    transactionId: transaction.transactionId
                };
                const invoiceOrError = _invoices_domain_Invoice__WEBPACK_IMPORTED_MODULE_7__["Invoice"].create(invoiceProps);
                if (invoiceOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(invoiceOrError.error);
                }
                const invoice = invoiceOrError.getValue();
                yield this.invoiceRepo.save(invoice);
                //* System creates invoice item(s)
                const invoiceItemProps = {
                    manuscriptId,
                    invoiceId: invoice.invoiceId,
                    dateCreated: new Date()
                };
                const invoiceItemOrError = _invoices_domain_InvoiceItem__WEBPACK_IMPORTED_MODULE_8__["InvoiceItem"].create(invoiceItemProps);
                if (invoiceItemOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(invoiceItemOrError.error);
                }
                const invoiceItem = invoiceItemOrError.getValue();
                yield this.invoiceItemRepo.save(invoiceItem);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transaction);
            }
            catch (err) {
                console.log(err);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}
Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_10__["Authorize"])('transaction:create'),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:type", Function),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:paramtypes", [Object, typeof (_a = typeof CreateTransactionContext !== "undefined" && CreateTransactionContext) === "function" ? _a : Object]),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], CreateTransactionUsecase.prototype, "execute", null);


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/usecases/getTransaction/getTransaction.ts":
/*!********************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/usecases/getTransaction/getTransaction.ts ***!
  \********************************************************************************************/
/*! exports provided: GetTransactionUsecase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GetTransactionUsecase", function() { return GetTransactionUsecase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony import */ var _domain_TransactionId__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../domain/TransactionId */ "./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts");
/* harmony import */ var _domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../../domain/authorization/decorators/Authorize */ "./libs/shared/src/lib/domain/authorization/decorators/Authorize.ts");
var _a, _b;





class GetTransactionUsecase {
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
        this.transactionRepo = transactionRepo;
    }
    getTransaction(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const { transactionId } = request;
            if (!transactionId) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Invalid Transaction id=${transactionId}`);
            }
            const transaction = yield this.transactionRepo.getTransactionById(_domain_TransactionId__WEBPACK_IMPORTED_MODULE_3__["TransactionId"].create(new _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_2__["UniqueEntityID"](transactionId)));
            const found = !!transaction;
            if (found) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transaction);
            }
            else {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't find transaction by id=${transactionId}`);
            }
        });
    }
    getAccessControlContext(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            return {};
        });
    }
    execute(request, context) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            // if ('transactionId' in request) {
            //   const transactionOrError = await this.getTransaction(request);
            //   if (transactionOrError.isFailure) {
            //     return Result.fail<Invoice>(transactionOrError.error);
            //   }
            //   transactionId = TransactionId.create(
            //     new UniqueEntityID(rawTransactionId)
            //   );
            // }
            try {
                // * System looks-up the transaction
                const transactionOrError = yield this.getTransaction(request);
                if (transactionOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(transactionOrError.error);
                }
                const transaction = transactionOrError.getValue();
                // * This is where all the magic happens
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transaction);
            }
            catch (err) {
                console.log(err);
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}
Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_domain_authorization_decorators_Authorize__WEBPACK_IMPORTED_MODULE_4__["Authorize"])('transaction:read'),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:type", Function),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:paramtypes", [Object, typeof (_a = typeof GetTransactionContext !== "undefined" && GetTransactionContext) === "function" ? _a : Object]),
    Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"])("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], GetTransactionUsecase.prototype, "execute", null);


/***/ }),

/***/ "./libs/shared/src/lib/modules/transactions/usecases/getTransactions/getTransactions.ts":
/*!**********************************************************************************************!*\
  !*** ./libs/shared/src/lib/modules/transactions/usecases/getTransactions/getTransactions.ts ***!
  \**********************************************************************************************/
/*! exports provided: GetTransactionsUsecase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GetTransactionsUsecase", function() { return GetTransactionsUsecase; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../core/logic/Result */ "./libs/shared/src/lib/core/logic/Result.ts");


class GetTransactionsUsecase {
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    getTransactions() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const transactions = yield this.transactionRepo.getTransactionCollection();
            if (!transactions) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(`Couldn't list transactions.`);
            }
            return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transactions);
        });
    }
    execute(request) {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            try {
                // * System searches for transactions matching query params
                const transactionsOrError = yield this.getTransactions();
                if (transactionsOrError.isFailure) {
                    return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(transactionsOrError.error);
                }
                const transactions = transactionsOrError.getValue();
                // magic happens here
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].ok(transactions);
            }
            catch (err) {
                return _core_logic_Result__WEBPACK_IMPORTED_MODULE_1__["Result"].fail(err);
            }
        });
    }
}


/***/ }),

/***/ "./libs/shared/src/lib/modules/users/domain/enums/Roles.ts":
/*!*****************************************************************!*\
  !*** ./libs/shared/src/lib/modules/users/domain/enums/Roles.ts ***!
  \*****************************************************************/
/*! exports provided: Roles */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Roles", function() { return Roles; });
/**
 * * Enumerates the possible user roles.
 */
var Roles;
(function (Roles) {
    Roles["CUSTOMER"] = "CUSTOMER";
    Roles["AUTHOR"] = "AUTHOR";
    Roles["PAYER"] = "PAYER";
    Roles["ADMIN"] = "ADMIN";
    Roles["SUPER_ADMIN"] = "SUPER_ADMIN";
})(Roles || (Roles = {}));


/***/ }),

/***/ "./libs/shared/src/lib/shared.ts":
/*!***************************************!*\
  !*** ./libs/shared/src/lib/shared.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core/domain/UniqueEntityID */ "./libs/shared/src/lib/core/domain/UniqueEntityID.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UniqueEntityID", function() { return _core_domain_UniqueEntityID__WEBPACK_IMPORTED_MODULE_0__["UniqueEntityID"]; });

/* harmony import */ var _infrastructure_Repo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./infrastructure/Repo */ "./libs/shared/src/lib/infrastructure/Repo.ts");
/* harmony import */ var _infrastructure_Repo__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_infrastructure_Repo__WEBPACK_IMPORTED_MODULE_1__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _infrastructure_Repo__WEBPACK_IMPORTED_MODULE_1__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _infrastructure_Repo__WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _domain_Amount__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./domain/Amount */ "./libs/shared/src/lib/domain/Amount.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Amount", function() { return _domain_Amount__WEBPACK_IMPORTED_MODULE_2__["Amount"]; });

/* harmony import */ var _domain_File__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./domain/File */ "./libs/shared/src/lib/domain/File.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "File", function() { return _domain_File__WEBPACK_IMPORTED_MODULE_3__["File"]; });

/* harmony import */ var _domain_Name__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./domain/Name */ "./libs/shared/src/lib/domain/Name.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Name", function() { return _domain_Name__WEBPACK_IMPORTED_MODULE_4__["Name"]; });

/* harmony import */ var _domain_Email__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./domain/Email */ "./libs/shared/src/lib/domain/Email.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Email", function() { return _domain_Email__WEBPACK_IMPORTED_MODULE_5__["Email"]; });

/* harmony import */ var _domain_PhoneNumber__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./domain/PhoneNumber */ "./libs/shared/src/lib/domain/PhoneNumber.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PhoneNumber", function() { return _domain_PhoneNumber__WEBPACK_IMPORTED_MODULE_6__["PhoneNumber"]; });

/* harmony import */ var _domain_authorization__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./domain/authorization */ "./libs/shared/src/lib/domain/authorization/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AccessControlledUsecase", function() { return _domain_authorization__WEBPACK_IMPORTED_MODULE_7__["AccessControlledUsecase"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Authorize", function() { return _domain_authorization__WEBPACK_IMPORTED_MODULE_7__["Authorize"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "accessControl", function() { return _domain_authorization__WEBPACK_IMPORTED_MODULE_7__["accessControl"]; });

/* harmony import */ var _modules_articles_domain_Article__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./modules/articles/domain/Article */ "./libs/shared/src/lib/modules/articles/domain/Article.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Article", function() { return _modules_articles_domain_Article__WEBPACK_IMPORTED_MODULE_8__["Article"]; });

/* harmony import */ var _modules_articles_dtos_ArticleDTO__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./modules/articles/dtos/ArticleDTO */ "./libs/shared/src/lib/modules/articles/dtos/ArticleDTO.ts");
/* harmony import */ var _modules_articles_dtos_ArticleDTO__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_modules_articles_dtos_ArticleDTO__WEBPACK_IMPORTED_MODULE_9__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _modules_articles_dtos_ArticleDTO__WEBPACK_IMPORTED_MODULE_9__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","Amount","File","Name","Email","PhoneNumber","AccessControlledUsecase","Authorize","accessControl","Article","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _modules_articles_dtos_ArticleDTO__WEBPACK_IMPORTED_MODULE_9__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _modules_articles_mappers_ArticleMap__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./modules/articles/mappers/ArticleMap */ "./libs/shared/src/lib/modules/articles/mappers/ArticleMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArticleMap", function() { return _modules_articles_mappers_ArticleMap__WEBPACK_IMPORTED_MODULE_10__["ArticleMap"]; });

/* harmony import */ var _modules_articles_domain_ArticleId__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./modules/articles/domain/ArticleId */ "./libs/shared/src/lib/modules/articles/domain/ArticleId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArticleId", function() { return _modules_articles_domain_ArticleId__WEBPACK_IMPORTED_MODULE_11__["ArticleId"]; });

/* harmony import */ var _modules_articles_domain_Price__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./modules/articles/domain/Price */ "./libs/shared/src/lib/modules/articles/domain/Price.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Price", function() { return _modules_articles_domain_Price__WEBPACK_IMPORTED_MODULE_12__["Price"]; });

/* harmony import */ var _modules_articles_domain_PriceId__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./modules/articles/domain/PriceId */ "./libs/shared/src/lib/modules/articles/domain/PriceId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PriceId", function() { return _modules_articles_domain_PriceId__WEBPACK_IMPORTED_MODULE_13__["PriceId"]; });

/* harmony import */ var _modules_articles_domain_PriceValue__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./modules/articles/domain/PriceValue */ "./libs/shared/src/lib/modules/articles/domain/PriceValue.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PriceValue", function() { return _modules_articles_domain_PriceValue__WEBPACK_IMPORTED_MODULE_14__["PriceValue"]; });

/* harmony import */ var _modules_articles_repos__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./modules/articles/repos */ "./libs/shared/src/lib/modules/articles/repos/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArticleRepoContract", function() { return _modules_articles_repos__WEBPACK_IMPORTED_MODULE_15__["ArticleRepoContract"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexArticleRepo", function() { return _modules_articles_repos__WEBPACK_IMPORTED_MODULE_15__["KnexArticleRepo"]; });

/* empty/unused harmony star reexport *//* harmony import */ var _modules_articles_repos_priceRepo__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./modules/articles/repos/priceRepo */ "./libs/shared/src/lib/modules/articles/repos/priceRepo.ts");
/* harmony import */ var _modules_articles_repos_priceRepo__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(_modules_articles_repos_priceRepo__WEBPACK_IMPORTED_MODULE_16__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _modules_articles_repos_priceRepo__WEBPACK_IMPORTED_MODULE_16__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","Amount","File","Name","Email","PhoneNumber","AccessControlledUsecase","Authorize","accessControl","Article","ArticleMap","ArticleId","Price","PriceId","PriceValue","ArticleRepoContract","KnexArticleRepo","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _modules_articles_repos_priceRepo__WEBPACK_IMPORTED_MODULE_16__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _modules_articles_mappers_PriceMap__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./modules/articles/mappers/PriceMap */ "./libs/shared/src/lib/modules/articles/mappers/PriceMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PriceMap", function() { return _modules_articles_mappers_PriceMap__WEBPACK_IMPORTED_MODULE_17__["PriceMap"]; });

/* harmony import */ var _modules_transactions_domain_Transaction__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./modules/transactions/domain/Transaction */ "./libs/shared/src/lib/modules/transactions/domain/Transaction.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "STATUS", function() { return _modules_transactions_domain_Transaction__WEBPACK_IMPORTED_MODULE_18__["STATUS"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Transaction", function() { return _modules_transactions_domain_Transaction__WEBPACK_IMPORTED_MODULE_18__["Transaction"]; });

/* harmony import */ var _modules_transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./modules/transactions/domain/TransactionId */ "./libs/shared/src/lib/modules/transactions/domain/TransactionId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TransactionId", function() { return _modules_transactions_domain_TransactionId__WEBPACK_IMPORTED_MODULE_19__["TransactionId"]; });

/* harmony import */ var _modules_transactions_domain_TransactionAmount__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./modules/transactions/domain/TransactionAmount */ "./libs/shared/src/lib/modules/transactions/domain/TransactionAmount.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TransactionAmount", function() { return _modules_transactions_domain_TransactionAmount__WEBPACK_IMPORTED_MODULE_20__["TransactionAmount"]; });

/* harmony import */ var _modules_transactions_repos__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./modules/transactions/repos */ "./libs/shared/src/lib/modules/transactions/repos/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TransactionRepoContract", function() { return _modules_transactions_repos__WEBPACK_IMPORTED_MODULE_21__["TransactionRepoContract"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexTransactionRepo", function() { return _modules_transactions_repos__WEBPACK_IMPORTED_MODULE_21__["KnexTransactionRepo"]; });

/* harmony import */ var _modules_transactions_usecases_getTransactions_getTransactions__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./modules/transactions/usecases/getTransactions/getTransactions */ "./libs/shared/src/lib/modules/transactions/usecases/getTransactions/getTransactions.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GetTransactionsUsecase", function() { return _modules_transactions_usecases_getTransactions_getTransactions__WEBPACK_IMPORTED_MODULE_22__["GetTransactionsUsecase"]; });

/* harmony import */ var _modules_transactions_usecases_getTransaction_getTransaction__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./modules/transactions/usecases/getTransaction/getTransaction */ "./libs/shared/src/lib/modules/transactions/usecases/getTransaction/getTransaction.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GetTransactionUsecase", function() { return _modules_transactions_usecases_getTransaction_getTransaction__WEBPACK_IMPORTED_MODULE_23__["GetTransactionUsecase"]; });

/* harmony import */ var _modules_transactions_usecases_createTransaction_createTransaction__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./modules/transactions/usecases/createTransaction/createTransaction */ "./libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CreateTransactionUsecase", function() { return _modules_transactions_usecases_createTransaction_createTransaction__WEBPACK_IMPORTED_MODULE_24__["CreateTransactionUsecase"]; });

/* harmony import */ var _modules_transactions_mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./modules/transactions/mappers/TransactionMap */ "./libs/shared/src/lib/modules/transactions/mappers/TransactionMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TransactionMap", function() { return _modules_transactions_mappers_TransactionMap__WEBPACK_IMPORTED_MODULE_25__["TransactionMap"]; });

/* harmony import */ var _modules_invoices_domain_Invoice__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./modules/invoices/domain/Invoice */ "./libs/shared/src/lib/modules/invoices/domain/Invoice.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceStatus", function() { return _modules_invoices_domain_Invoice__WEBPACK_IMPORTED_MODULE_26__["InvoiceStatus"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Invoice", function() { return _modules_invoices_domain_Invoice__WEBPACK_IMPORTED_MODULE_26__["Invoice"]; });

/* harmony import */ var _modules_invoices_domain_InvoiceId__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./modules/invoices/domain/InvoiceId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceId", function() { return _modules_invoices_domain_InvoiceId__WEBPACK_IMPORTED_MODULE_27__["InvoiceId"]; });

/* harmony import */ var _modules_invoices_domain_InvoiceItem__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./modules/invoices/domain/InvoiceItem */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItem.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceItem", function() { return _modules_invoices_domain_InvoiceItem__WEBPACK_IMPORTED_MODULE_28__["InvoiceItem"]; });

/* harmony import */ var _modules_invoices_domain_InvoiceItemId__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./modules/invoices/domain/InvoiceItemId */ "./libs/shared/src/lib/modules/invoices/domain/InvoiceItemId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceItemId", function() { return _modules_invoices_domain_InvoiceItemId__WEBPACK_IMPORTED_MODULE_29__["InvoiceItemId"]; });

/* harmony import */ var _modules_invoices_usecases_getInvoiceDetails_getInvoiceDetails__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails */ "./libs/shared/src/lib/modules/invoices/usecases/getInvoiceDetails/getInvoiceDetails.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GetInvoiceDetailsUsecase", function() { return _modules_invoices_usecases_getInvoiceDetails_getInvoiceDetails__WEBPACK_IMPORTED_MODULE_30__["GetInvoiceDetailsUsecase"]; });

/* harmony import */ var _modules_invoices_usecases_deleteInvoice_deleteInvoice__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./modules/invoices/usecases/deleteInvoice/deleteInvoice */ "./libs/shared/src/lib/modules/invoices/usecases/deleteInvoice/deleteInvoice.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "DeleteInvoiceUsecase", function() { return _modules_invoices_usecases_deleteInvoice_deleteInvoice__WEBPACK_IMPORTED_MODULE_31__["DeleteInvoiceUsecase"]; });

/* harmony import */ var _modules_invoices_repos__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./modules/invoices/repos */ "./libs/shared/src/lib/modules/invoices/repos/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceRepoContract", function() { return _modules_invoices_repos__WEBPACK_IMPORTED_MODULE_32__["InvoiceRepoContract"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexInvoiceRepo", function() { return _modules_invoices_repos__WEBPACK_IMPORTED_MODULE_32__["KnexInvoiceRepo"]; });

/* harmony import */ var _modules_invoices_usecases_createInvoice_createInvoice__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./modules/invoices/usecases/createInvoice/createInvoice */ "./libs/shared/src/lib/modules/invoices/usecases/createInvoice/createInvoice.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CreateInvoiceUsecase", function() { return _modules_invoices_usecases_createInvoice_createInvoice__WEBPACK_IMPORTED_MODULE_33__["CreateInvoiceUsecase"]; });

/* harmony import */ var _modules_invoices_mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./modules/invoices/mappers/InvoiceMap */ "./libs/shared/src/lib/modules/invoices/mappers/InvoiceMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceMap", function() { return _modules_invoices_mappers_InvoiceMap__WEBPACK_IMPORTED_MODULE_34__["InvoiceMap"]; });

/* harmony import */ var _modules_invoices_mappers_InvoiceItemMap__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./modules/invoices/mappers/InvoiceItemMap */ "./libs/shared/src/lib/modules/invoices/mappers/InvoiceItemMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoiceItemMap", function() { return _modules_invoices_mappers_InvoiceItemMap__WEBPACK_IMPORTED_MODULE_35__["InvoiceItemMap"]; });

/* harmony import */ var _modules_invoices_domain_policies_PoliciesRegister__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./modules/invoices/domain/policies/PoliciesRegister */ "./libs/shared/src/lib/modules/invoices/domain/policies/PoliciesRegister.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InvoicePoliciesRegister", function() { return _modules_invoices_domain_policies_PoliciesRegister__WEBPACK_IMPORTED_MODULE_36__["PoliciesRegister"]; });

/* harmony import */ var _modules_invoices_domain_policies_UKVATHardCopyPolicy__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./modules/invoices/domain/policies/UKVATHardCopyPolicy */ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATHardCopyPolicy.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UKVATTreatmentOfHardCopyPublicationsPolicy", function() { return _modules_invoices_domain_policies_UKVATHardCopyPolicy__WEBPACK_IMPORTED_MODULE_37__["UKVATTreatmentOfHardCopyPublicationsPolicy"]; });

/* harmony import */ var _modules_invoices_domain_policies_UKVATTreatmentArticleProcessingChargesPolicy__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy */ "./libs/shared/src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UKVATTreatmentArticleProcessingChargesPolicy", function() { return _modules_invoices_domain_policies_UKVATTreatmentArticleProcessingChargesPolicy__WEBPACK_IMPORTED_MODULE_38__["UKVATTreatmentArticleProcessingChargesPolicy"]; });

/* harmony import */ var _modules_invoices_domain_policies_VATTreatmentPublicationNotOwnedPolicy__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./modules/invoices/domain/policies/VATTreatmentPublicationNotOwnedPolicy */ "./libs/shared/src/lib/modules/invoices/domain/policies/VATTreatmentPublicationNotOwnedPolicy.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "VATTreatmentPublicationNotOwnedPolicy", function() { return _modules_invoices_domain_policies_VATTreatmentPublicationNotOwnedPolicy__WEBPACK_IMPORTED_MODULE_39__["VATTreatmentPublicationNotOwnedPolicy"]; });

/* harmony import */ var _modules_payments_domain_Payment__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./modules/payments/domain/Payment */ "./libs/shared/src/lib/modules/payments/domain/Payment.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Payment", function() { return _modules_payments_domain_Payment__WEBPACK_IMPORTED_MODULE_40__["Payment"]; });

/* harmony import */ var _modules_payments_domain_PaymentMethod__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./modules/payments/domain/PaymentMethod */ "./libs/shared/src/lib/modules/payments/domain/PaymentMethod.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentMethod", function() { return _modules_payments_domain_PaymentMethod__WEBPACK_IMPORTED_MODULE_41__["PaymentMethod"]; });

/* harmony import */ var _modules_payments_domain_PaymentId__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./modules/payments/domain/PaymentId */ "./libs/shared/src/lib/modules/payments/domain/PaymentId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentId", function() { return _modules_payments_domain_PaymentId__WEBPACK_IMPORTED_MODULE_42__["PaymentId"]; });

/* harmony import */ var _modules_payments_domain_PaymentMethodId__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./modules/payments/domain/PaymentMethodId */ "./libs/shared/src/lib/modules/payments/domain/PaymentMethodId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentMethodId", function() { return _modules_payments_domain_PaymentMethodId__WEBPACK_IMPORTED_MODULE_43__["PaymentMethodId"]; });

/* harmony import */ var _modules_payments_mapper_Payment__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./modules/payments/mapper/Payment */ "./libs/shared/src/lib/modules/payments/mapper/Payment.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentMap", function() { return _modules_payments_mapper_Payment__WEBPACK_IMPORTED_MODULE_44__["PaymentMap"]; });

/* harmony import */ var _modules_payments_mapper_PaymentMethod__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./modules/payments/mapper/PaymentMethod */ "./libs/shared/src/lib/modules/payments/mapper/PaymentMethod.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentMethodMap", function() { return _modules_payments_mapper_PaymentMethod__WEBPACK_IMPORTED_MODULE_45__["PaymentMethodMap"]; });

/* harmony import */ var _modules_payments_repos_paymentRepo__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./modules/payments/repos/paymentRepo */ "./libs/shared/src/lib/modules/payments/repos/paymentRepo.ts");
/* harmony import */ var _modules_payments_repos_paymentRepo__WEBPACK_IMPORTED_MODULE_46___default = /*#__PURE__*/__webpack_require__.n(_modules_payments_repos_paymentRepo__WEBPACK_IMPORTED_MODULE_46__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _modules_payments_repos_paymentRepo__WEBPACK_IMPORTED_MODULE_46__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","Amount","File","Name","Email","PhoneNumber","AccessControlledUsecase","Authorize","accessControl","Article","ArticleMap","ArticleId","Price","PriceId","PriceValue","ArticleRepoContract","KnexArticleRepo","PriceMap","STATUS","Transaction","TransactionId","TransactionAmount","TransactionRepoContract","KnexTransactionRepo","GetTransactionsUsecase","GetTransactionUsecase","CreateTransactionUsecase","TransactionMap","InvoiceStatus","Invoice","InvoiceId","InvoiceItem","InvoiceItemId","GetInvoiceDetailsUsecase","DeleteInvoiceUsecase","InvoiceRepoContract","KnexInvoiceRepo","CreateInvoiceUsecase","InvoiceMap","InvoiceItemMap","UKVATTreatmentOfHardCopyPublicationsPolicy","UKVATTreatmentArticleProcessingChargesPolicy","VATTreatmentPublicationNotOwnedPolicy","PaymentId","PaymentMethodId","PaymentMap","PaymentMethodMap","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _modules_payments_repos_paymentRepo__WEBPACK_IMPORTED_MODULE_46__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _modules_payments_repos_paymentMethodRepo__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./modules/payments/repos/paymentMethodRepo */ "./libs/shared/src/lib/modules/payments/repos/paymentMethodRepo.ts");
/* harmony import */ var _modules_payments_repos_paymentMethodRepo__WEBPACK_IMPORTED_MODULE_47___default = /*#__PURE__*/__webpack_require__.n(_modules_payments_repos_paymentMethodRepo__WEBPACK_IMPORTED_MODULE_47__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _modules_payments_repos_paymentMethodRepo__WEBPACK_IMPORTED_MODULE_47__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","Amount","File","Name","Email","PhoneNumber","AccessControlledUsecase","Authorize","accessControl","Article","ArticleMap","ArticleId","Price","PriceId","PriceValue","ArticleRepoContract","KnexArticleRepo","PriceMap","STATUS","Transaction","TransactionId","TransactionAmount","TransactionRepoContract","KnexTransactionRepo","GetTransactionsUsecase","GetTransactionUsecase","CreateTransactionUsecase","TransactionMap","InvoiceStatus","Invoice","InvoiceId","InvoiceItem","InvoiceItemId","GetInvoiceDetailsUsecase","DeleteInvoiceUsecase","InvoiceRepoContract","KnexInvoiceRepo","CreateInvoiceUsecase","InvoiceMap","InvoiceItemMap","UKVATTreatmentOfHardCopyPublicationsPolicy","UKVATTreatmentArticleProcessingChargesPolicy","VATTreatmentPublicationNotOwnedPolicy","PaymentId","PaymentMethodId","PaymentMap","PaymentMethodMap","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _modules_payments_repos_paymentMethodRepo__WEBPACK_IMPORTED_MODULE_47__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _modules_payers_domain_Payer__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./modules/payers/domain/Payer */ "./libs/shared/src/lib/modules/payers/domain/Payer.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Payer", function() { return _modules_payers_domain_Payer__WEBPACK_IMPORTED_MODULE_48__["Payer"]; });

/* harmony import */ var _modules_payers_domain_PayerId__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./modules/payers/domain/PayerId */ "./libs/shared/src/lib/modules/payers/domain/PayerId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PayerId", function() { return _modules_payers_domain_PayerId__WEBPACK_IMPORTED_MODULE_49__["PayerId"]; });

/* harmony import */ var _modules_payers_domain_PayerName__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./modules/payers/domain/PayerName */ "./libs/shared/src/lib/modules/payers/domain/PayerName.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PayerName", function() { return _modules_payers_domain_PayerName__WEBPACK_IMPORTED_MODULE_50__["PayerName"]; });

/* harmony import */ var _modules_payers_domain_PayerType__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./modules/payers/domain/PayerType */ "./libs/shared/src/lib/modules/payers/domain/PayerType.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PayerType", function() { return _modules_payers_domain_PayerType__WEBPACK_IMPORTED_MODULE_51__["PayerType"]; });

/* harmony import */ var _modules_payers_domain_PayerTitle__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./modules/payers/domain/PayerTitle */ "./libs/shared/src/lib/modules/payers/domain/PayerTitle.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PayerTitle", function() { return _modules_payers_domain_PayerTitle__WEBPACK_IMPORTED_MODULE_52__["PayerTitle"]; });

/* harmony import */ var _modules_payers_repos_payerRepo__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ./modules/payers/repos/payerRepo */ "./libs/shared/src/lib/modules/payers/repos/payerRepo.ts");
/* harmony import */ var _modules_payers_repos_payerRepo__WEBPACK_IMPORTED_MODULE_53___default = /*#__PURE__*/__webpack_require__.n(_modules_payers_repos_payerRepo__WEBPACK_IMPORTED_MODULE_53__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _modules_payers_repos_payerRepo__WEBPACK_IMPORTED_MODULE_53__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","Amount","File","Name","Email","PhoneNumber","AccessControlledUsecase","Authorize","accessControl","Article","ArticleMap","ArticleId","Price","PriceId","PriceValue","ArticleRepoContract","KnexArticleRepo","PriceMap","STATUS","Transaction","TransactionId","TransactionAmount","TransactionRepoContract","KnexTransactionRepo","GetTransactionsUsecase","GetTransactionUsecase","CreateTransactionUsecase","TransactionMap","InvoiceStatus","Invoice","InvoiceId","InvoiceItem","InvoiceItemId","GetInvoiceDetailsUsecase","DeleteInvoiceUsecase","InvoiceRepoContract","KnexInvoiceRepo","CreateInvoiceUsecase","InvoiceMap","InvoiceItemMap","UKVATTreatmentOfHardCopyPublicationsPolicy","UKVATTreatmentArticleProcessingChargesPolicy","VATTreatmentPublicationNotOwnedPolicy","PaymentId","PaymentMethodId","PaymentMap","PaymentMethodMap","PayerId","PayerName","PayerType","PayerTitle","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _modules_payers_repos_payerRepo__WEBPACK_IMPORTED_MODULE_53__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _modules_payers_mapper_Payer__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ./modules/payers/mapper/Payer */ "./libs/shared/src/lib/modules/payers/mapper/Payer.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PayerMap", function() { return _modules_payers_mapper_Payer__WEBPACK_IMPORTED_MODULE_54__["PayerMap"]; });

/* harmony import */ var _modules_addresses_domain_AddressId__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! ./modules/addresses/domain/AddressId */ "./libs/shared/src/lib/modules/addresses/domain/AddressId.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AddressId", function() { return _modules_addresses_domain_AddressId__WEBPACK_IMPORTED_MODULE_55__["AddressId"]; });

/* harmony import */ var _modules_catalogs_domain_CatalogItem__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! ./modules/catalogs/domain/CatalogItem */ "./libs/shared/src/lib/modules/catalogs/domain/CatalogItem.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CatalogItem", function() { return _modules_catalogs_domain_CatalogItem__WEBPACK_IMPORTED_MODULE_56__["CatalogItem"]; });

/* harmony import */ var _modules_catalogs_repos__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! ./modules/catalogs/repos */ "./libs/shared/src/lib/modules/catalogs/repos/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CatalogRepoContract", function() { return _modules_catalogs_repos__WEBPACK_IMPORTED_MODULE_57__["CatalogRepoContract"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexCatalogRepo", function() { return _modules_catalogs_repos__WEBPACK_IMPORTED_MODULE_57__["KnexCatalogRepo"]; });

/* harmony import */ var _modules_catalogs_mappers_CatalogMap__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! ./modules/catalogs/mappers/CatalogMap */ "./libs/shared/src/lib/modules/catalogs/mappers/CatalogMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CatalogMap", function() { return _modules_catalogs_mappers_CatalogMap__WEBPACK_IMPORTED_MODULE_58__["CatalogMap"]; });

/* harmony import */ var _modules_catalogs_usecases_catalogItems_addCatalogItemToCatalog_addCatalogItemToCatalogUseCase__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! ./modules/catalogs/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogUseCase */ "./libs/shared/src/lib/modules/catalogs/usecases/catalogItems/addCatalogItemToCatalog/addCatalogItemToCatalogUseCase.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AddCatalogItemToCatalogUseCase", function() { return _modules_catalogs_usecases_catalogItems_addCatalogItemToCatalog_addCatalogItemToCatalogUseCase__WEBPACK_IMPORTED_MODULE_59__["AddCatalogItemToCatalogUseCase"]; });

/* harmony import */ var _modules_catalogs_usecases_catalogItems_getAllCatalogItems_getAllCatalogItemsUseCase__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! ./modules/catalogs/usecases/catalogItems/getAllCatalogItems/getAllCatalogItemsUseCase */ "./libs/shared/src/lib/modules/catalogs/usecases/catalogItems/getAllCatalogItems/getAllCatalogItemsUseCase.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GetAllCatalogItemsUseCase", function() { return _modules_catalogs_usecases_catalogItems_getAllCatalogItems_getAllCatalogItemsUseCase__WEBPACK_IMPORTED_MODULE_60__["GetAllCatalogItemsUseCase"]; });

/* harmony import */ var _modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ./modules/users/domain/enums/Roles */ "./libs/shared/src/lib/modules/users/domain/enums/Roles.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Roles", function() { return _modules_users_domain_enums_Roles__WEBPACK_IMPORTED_MODULE_61__["Roles"]; });

/* harmony import */ var _modules_payments_domain_contracts_PaymentModel__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! ./modules/payments/domain/contracts/PaymentModel */ "./libs/shared/src/lib/modules/payments/domain/contracts/PaymentModel.ts");
/* harmony import */ var _modules_payments_domain_contracts_PaymentModel__WEBPACK_IMPORTED_MODULE_62___default = /*#__PURE__*/__webpack_require__.n(_modules_payments_domain_contracts_PaymentModel__WEBPACK_IMPORTED_MODULE_62__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _modules_payments_domain_contracts_PaymentModel__WEBPACK_IMPORTED_MODULE_62__) if(["InvoicePoliciesRegister","Payment","PaymentMethod","Payer","CatalogItem","Roles","ReductionsPoliciesRegister","BraintreeGateway","UniqueEntityID","Amount","File","Name","Email","PhoneNumber","AccessControlledUsecase","Authorize","accessControl","Article","ArticleMap","ArticleId","Price","PriceId","PriceValue","ArticleRepoContract","KnexArticleRepo","PriceMap","STATUS","Transaction","TransactionId","TransactionAmount","TransactionRepoContract","KnexTransactionRepo","GetTransactionsUsecase","GetTransactionUsecase","CreateTransactionUsecase","TransactionMap","InvoiceStatus","Invoice","InvoiceId","InvoiceItem","InvoiceItemId","GetInvoiceDetailsUsecase","DeleteInvoiceUsecase","InvoiceRepoContract","KnexInvoiceRepo","CreateInvoiceUsecase","InvoiceMap","InvoiceItemMap","UKVATTreatmentOfHardCopyPublicationsPolicy","UKVATTreatmentArticleProcessingChargesPolicy","VATTreatmentPublicationNotOwnedPolicy","PaymentId","PaymentMethodId","PaymentMap","PaymentMethodMap","PayerId","PayerName","PayerType","PayerTitle","PayerMap","AddressId","CatalogRepoContract","KnexCatalogRepo","CatalogMap","AddCatalogItemToCatalogUseCase","GetAllCatalogItemsUseCase","default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _modules_payments_domain_contracts_PaymentModel__WEBPACK_IMPORTED_MODULE_62__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _modules_payments_domain_strategies_PaymentFactory__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! ./modules/payments/domain/strategies/PaymentFactory */ "./libs/shared/src/lib/modules/payments/domain/strategies/PaymentFactory.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentFactory", function() { return _modules_payments_domain_strategies_PaymentFactory__WEBPACK_IMPORTED_MODULE_63__["PaymentFactory"]; });

/* harmony import */ var _modules_payments_domain_strategies_PaymentStrategy__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! ./modules/payments/domain/strategies/PaymentStrategy */ "./libs/shared/src/lib/modules/payments/domain/strategies/PaymentStrategy.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PaymentStrategy", function() { return _modules_payments_domain_strategies_PaymentStrategy__WEBPACK_IMPORTED_MODULE_64__["PaymentStrategy"]; });

/* harmony import */ var _modules_payments_domain_strategies_CreditCardPayment__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! ./modules/payments/domain/strategies/CreditCardPayment */ "./libs/shared/src/lib/modules/payments/domain/strategies/CreditCardPayment.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CreditCardPayment", function() { return _modules_payments_domain_strategies_CreditCardPayment__WEBPACK_IMPORTED_MODULE_65__["CreditCardPayment"]; });

/* harmony import */ var _modules_payments_domain_strategies_CreditCard__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! ./modules/payments/domain/strategies/CreditCard */ "./libs/shared/src/lib/modules/payments/domain/strategies/CreditCard.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CreditCard", function() { return _modules_payments_domain_strategies_CreditCard__WEBPACK_IMPORTED_MODULE_66__["CreditCard"]; });

/* harmony import */ var _domain_reductions_ReductionFactory__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! ./domain/reductions/ReductionFactory */ "./libs/shared/src/lib/domain/reductions/ReductionFactory.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ReductionFactory", function() { return _domain_reductions_ReductionFactory__WEBPACK_IMPORTED_MODULE_67__["ReductionFactory"]; });

/* harmony import */ var _domain_reductions_Coupon__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! ./domain/reductions/Coupon */ "./libs/shared/src/lib/domain/reductions/Coupon.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Coupon", function() { return _domain_reductions_Coupon__WEBPACK_IMPORTED_MODULE_68__["Coupon"]; });

/* harmony import */ var _domain_reductions_policies_PoliciesRegister__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! ./domain/reductions/policies/PoliciesRegister */ "./libs/shared/src/lib/domain/reductions/policies/PoliciesRegister.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ReductionsPoliciesRegister", function() { return _domain_reductions_policies_PoliciesRegister__WEBPACK_IMPORTED_MODULE_69__["PoliciesRegister"]; });

/* harmony import */ var _domain_reductions_policies_WaivedCountryPolicy__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! ./domain/reductions/policies/WaivedCountryPolicy */ "./libs/shared/src/lib/domain/reductions/policies/WaivedCountryPolicy.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WaivedCountryPolicy", function() { return _domain_reductions_policies_WaivedCountryPolicy__WEBPACK_IMPORTED_MODULE_70__["WaivedCountryPolicy"]; });

/* harmony import */ var _domain_reductions_policies_SanctionedCountryPolicy__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! ./domain/reductions/policies/SanctionedCountryPolicy */ "./libs/shared/src/lib/domain/reductions/policies/SanctionedCountryPolicy.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SanctionedCountryPolicy", function() { return _domain_reductions_policies_SanctionedCountryPolicy__WEBPACK_IMPORTED_MODULE_71__["SanctionedCountryPolicy"]; });

/* harmony import */ var _modules_coupons_mappers_CouponMap__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! ./modules/coupons/mappers/CouponMap */ "./libs/shared/src/lib/modules/coupons/mappers/CouponMap.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CouponPersistenceDTO", function() { return _modules_coupons_mappers_CouponMap__WEBPACK_IMPORTED_MODULE_72__["CouponPersistenceDTO"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CouponMap", function() { return _modules_coupons_mappers_CouponMap__WEBPACK_IMPORTED_MODULE_72__["CouponMap"]; });

/* harmony import */ var _modules_coupons_repos__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! ./modules/coupons/repos */ "./libs/shared/src/lib/modules/coupons/repos/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CouponRepoContract", function() { return _modules_coupons_repos__WEBPACK_IMPORTED_MODULE_73__["CouponRepoContract"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexCouponRepo", function() { return _modules_coupons_repos__WEBPACK_IMPORTED_MODULE_73__["KnexCouponRepo"]; });

/* harmony import */ var _modules_authors_domain_Author__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! ./modules/authors/domain/Author */ "./libs/shared/src/lib/modules/authors/domain/Author.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Author", function() { return _modules_authors_domain_Author__WEBPACK_IMPORTED_MODULE_74__["Author"]; });

/* harmony import */ var _modules_payments_infrastructure_gateways_braintree_gateway__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! ./modules/payments/infrastructure/gateways/braintree/gateway */ "./libs/shared/src/lib/modules/payments/infrastructure/gateways/braintree/gateway.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "BraintreeGateway", function() { return _modules_payments_infrastructure_gateways_braintree_gateway__WEBPACK_IMPORTED_MODULE_75__["BraintreeGateway"]; });

/* harmony import */ var _infrastructure_database_knex__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! ./infrastructure/database/knex */ "./libs/shared/src/lib/infrastructure/database/knex/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Knex", function() { return _infrastructure_database_knex__WEBPACK_IMPORTED_MODULE_76__["Knex"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "makeDb", function() { return _infrastructure_database_knex__WEBPACK_IMPORTED_MODULE_76__["makeDb"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "destroyDb", function() { return _infrastructure_database_knex__WEBPACK_IMPORTED_MODULE_76__["destroyDb"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "clearTable", function() { return _infrastructure_database_knex__WEBPACK_IMPORTED_MODULE_76__["clearTable"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "KnexDB", function() { return _infrastructure_database_knex__WEBPACK_IMPORTED_MODULE_76__["KnexDB"]; });

// * Export Core Subdomain


// * Export Shared Subdomain






// * Export Article Subdomain











// * Export Transaction Subdomain



// export * from './transactions/domain/events/transactionCreatedEvent';

// export * from './transactions/repos/transactionJsonRepo';



// export * from './transactions/subscribers/AfterTransactionCreatedEvents';

// * Export Invoice Subdomain




// export * from './invoices/domain/events/invoiceSentEvent';




// export * from './invoices/usecases/sendInvoice/sendInvoice';
// export * from './invoices/subscribers/AfterInvoiceSentEvents';






// * Export Payment Subdomain








// * Export Payer Subdomain







// * Export Address Subdomain

// * Export Catalog Subdomain

// export * from './modules/catalogs/domain/CatalogId';




// * Export User Subdomain

// * Export Payments Subdomain





// * Export Coupon Subdomain







// * Export  Author Subdomain

// Infra
// export * from './infra/http/app';




/***/ }),

/***/ "./libs/shared/src/lib/utils/TextUtil.ts":
/*!***********************************************!*\
  !*** ./libs/shared/src/lib/utils/TextUtil.ts ***!
  \***********************************************/
/*! exports provided: TextUtil */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextUtil", function() { return TextUtil; });
class TextUtil {
    static isUUID(text) {
        return new RegExp('\x20[0-9a-f]{8}\x20-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\x20[0-9a-f]{12}\x20').test(text);
    }
}


/***/ }),

/***/ 0:
/*!**************************************************!*\
  !*** multi ./apps/invoicing-graphql/src/main.ts ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/cezar/code/hindawi/phenom/apps/invoicing-graphql/src/main.ts */"./apps/invoicing-graphql/src/main.ts");


/***/ }),

/***/ "accesscontrol-plus":
/*!*************************************!*\
  !*** external "accesscontrol-plus" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("accesscontrol-plus");

/***/ }),

/***/ "apollo-server":
/*!********************************!*\
  !*** external "apollo-server" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("apollo-server");

/***/ }),

/***/ "braintree":
/*!****************************!*\
  !*** external "braintree" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("braintree");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "knex":
/*!***********************!*\
  !*** external "knex" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("knex");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "shallow-equal-object":
/*!***************************************!*\
  !*** external "shallow-equal-object" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("shallow-equal-object");

/***/ }),

/***/ "tslib":
/*!************************!*\
  !*** external "tslib" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tslib");

/***/ }),

/***/ "uuid/v4":
/*!**************************!*\
  !*** external "uuid/v4" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid/v4");

/***/ })

/******/ })));
//# sourceMappingURL=main.js.map