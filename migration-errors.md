# Migration Errors and Fixes

## Issue 1: Wishlists Migration Index Conflict
- **Error**: `relation "wishlists_user_id_product_id" already exists`
- **Cause**: The unique index on `user_id` and `product_id` was already created in a previous migration attempt.
- **Fix**: Modified the migration to use `CREATE UNIQUE INDEX IF NOT EXISTS` instead of `addIndex` to avoid conflicts if the index already exists.

## Issue 2: Database Name Mismatch
- **Error**: Migrations ran successfully but tables not visible in the database.
- **Cause**: The database name in `config.json` was "websitebanhangmini", but the `.env` file had "DB_NAME=E-commerce mini". Sequelize CLI uses `config.json`, so migrations were applied to the wrong database.
- **Fix**: Updated `be/config/config.json` to change the database name to "E-commerce mini" for the development environment.

## Resolution
After fixing the index conflict and updating the database name, run `npx sequelize-cli db:migrate` again to create the `brands` and `wishlists` tables in the correct database.

## Migration Files Created
- `be/src/migrations/20251101120000-create-brands-table.js`
- `be/src/migrations/20251101120001-create-wishlists-table.js`
