CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ean" text,
	"gtin" text,
	"manufacturer" text,
	"brand" text,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"category" text,
	"subcategory" text,
	"variant" text,
	"package_size" numeric,
	"package_unit" text,
	"technical_parameters" jsonb,
	"image_url" text,
	"product_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"store" text NOT NULL,
	"price" numeric(10, 2),
	"promo_price" numeric(10, 2),
	"regular_price" numeric(10, 2),
	"unit" text,
	"package_size" numeric,
	"price_per_unit" numeric(12, 4),
	"product_url" text,
	"availability" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"store" text NOT NULL,
	"price" numeric(10, 2),
	"promo_price" numeric(10, 2),
	"unit" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text
);
--> statement-breakpoint
ALTER TABLE "product_offers" ADD CONSTRAINT "product_offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "products_ean_unique" ON "products" USING btree ("ean");--> statement-breakpoint
CREATE UNIQUE INDEX "products_gtin_unique" ON "products" USING btree ("gtin");--> statement-breakpoint
CREATE INDEX "products_normalized_name_idx" ON "products" USING btree ("normalized_name");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "product_offers_product_id_idx" ON "product_offers" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_offers_store_idx" ON "product_offers" USING btree ("store");--> statement-breakpoint
CREATE INDEX "price_history_product_id_idx" ON "price_history" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "price_history_product_fetched_idx" ON "price_history" USING btree ("product_id","fetched_at");