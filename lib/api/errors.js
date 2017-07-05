'use strict';

var util = require('util');

function BaseError(message) {
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, BaseError);
}
util.inherits(BaseError, Error);

function BadRequestError(message) {
    BaseError.call(this, message);
    Error.captureStackTrace(this, BadRequestError);
    this.status = 400;
}
util.inherits(BadRequestError, BaseError);

function InternalServerError(message) {
    BaseError.call(this, message);
    Error.captureStackTrace(this, InternalServerError);
    this.status = 500;
}
util.inherits(InternalServerError, BaseError);

function UnauthorizedError(message) {
    BaseError.call(this, message);
    Error.captureStackTrace(this, UnauthorizedError);
    this.status = 401;
}
util.inherits(UnauthorizedError, BaseError);

function ForbiddenError(message) {
    BaseError.call(this, message);
    Error.captureStackTrace(this, ForbiddenError);
    this.status = 403;
}
util.inherits(ForbiddenError, BaseError);

function NotFoundError(message) {
    BaseError.call(this, message);
    Error.captureStackTrace(this, NotFoundError);
    this.status = 404;
}
util.inherits(NotFoundError, BaseError);

function ConflictError(message) {
    BaseError.call(this, message);
    Error.captureStackTrace(this, ConflictError);
    this.status = 409;
}
util.inherits(ConflictError, BaseError);

module.exports = {
    BaseError: BaseError,
    BadRequestError: BadRequestError,
    InternalServerError: InternalServerError,
    UnauthorizedError: UnauthorizedError,
    ForbiddenError: ForbiddenError,
    NotFoundError: NotFoundError,
    ConflictError: ConflictError
};
