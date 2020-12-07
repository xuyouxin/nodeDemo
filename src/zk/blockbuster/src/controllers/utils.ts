import { HttpError } from "../error-handler";
import { isNullOrUndefined } from "util";
import { compileExpression } from "filtrex";
import { Ci } from "../entity/ci";

export function sanitizeUri(uri: string) {
  if (!uri || !uri.startsWith('/')) throw new HttpError(400, `Invalid uri: ${uri}`);
  return uri.trim().replace(/\/$/, '');
}

export function getWhereClause(scope: number | string, id: string) {
  if ('string' === typeof scope) scope = Number(scope);
  if (0 === scope) return { id };
  if (1 === scope) return { parentId: id };
  if (isNullOrUndefined(scope)) return isNullOrUndefined(id) ? {} : { id };
  throw new HttpError(400, `Invalid scope: ${scope}.`);
}

export function getFilterFn(filter: string): null | ((ci: Ci) => boolean) {
  try {
    return filter ? compileExpression(filter) : null;
  } catch (err) {
    throw new HttpError(400, `filter expression is invalid: ${filter}!`);
  }
}
