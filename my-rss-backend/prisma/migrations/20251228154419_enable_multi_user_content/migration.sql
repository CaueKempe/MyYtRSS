
-- DropIndex
DROP INDEX "Item_link_key";

-- DropIndex
DROP INDEX "Source_rssUrl_key";

-- CreateIndex
CREATE UNIQUE INDEX "Item_sourceId_link_key" ON "Item"("sourceId", "link");

-- CreateIndex
CREATE UNIQUE INDEX "Source_categoryId_rssUrl_key" ON "Source"("categoryId", "rssUrl");
