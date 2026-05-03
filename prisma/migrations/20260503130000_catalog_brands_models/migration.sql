-- CreateTable
CREATE TABLE "catalog_brands" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "catalog_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_models" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "catalog_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "catalog_brands_category_id_idx" ON "catalog_brands"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_brands_category_id_name_key" ON "catalog_brands"("category_id", "name");

-- CreateIndex
CREATE INDEX "catalog_models_brand_id_idx" ON "catalog_models"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_models_brand_id_name_key" ON "catalog_models"("brand_id", "name");

-- AddForeignKey
ALTER TABLE "catalog_brands" ADD CONSTRAINT "catalog_brands_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_models" ADD CONSTRAINT "catalog_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "catalog_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
