DROP INDEX "transactions_wallet_occurred_idx";--> statement-breakpoint
DROP INDEX "transactions_category_occurred_idx";--> statement-breakpoint
DROP INDEX "transactions_transfer_group_idx";--> statement-breakpoint
CREATE INDEX "idx_tx_wallet_created" ON "transactions" USING btree ("wallet_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_tx_category" ON "transactions" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_tx_transfer_group" ON "transactions" USING btree ("transfer_group_id");--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "is_archived";--> statement-breakpoint
ALTER TABLE "wallets" DROP COLUMN "is_archived";