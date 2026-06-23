/**
 * Type-only declaration for the `@paymap/db/tax-data` subpath export.
 *
 * The @paymap/db package exposes ./tax-data via its package.json "exports" map
 * (-> prisma/tax-data.ts). At runtime ts-node / Node honour that map, but tsc's
 * classic ("node") moduleResolution ignores "exports", so the import otherwise
 * fails to typecheck (TS2307). Pointing tsconfig `paths` at the real .ts instead
 * pulls a file outside `rootDir` into the build (TS6059), so we declare the
 * surface here. Mirror packages/db/prisma/tax-data.ts if its signature changes.
 */
declare module "@paymap/db/tax-data" {
  import type { PrismaClient } from "@prisma/client";
  import type { TaxData } from "@paymap/tax-engine";

  export function dbTaxDataEnabled(): boolean;
  export function loadTaxData(
    countrySlug: string,
    year: number,
    prismaClient?: PrismaClient,
  ): Promise<TaxData>;
}
