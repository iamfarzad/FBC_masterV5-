/**
 * Compile-time compatibility: allow `.errors` on ZodError (maps to `.issues`).
 * This only fixes typings; see runtime shim below for actual behavior.
 */
import "zod";
declare module "zod" {
  interface ZodError<T = unknown> {
    /** Compat alias for older codebases that used `errors`. */
    readonly errors: this["issues"];
  }
}
