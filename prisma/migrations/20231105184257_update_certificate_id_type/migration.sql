/*
  Warnings:

  - A unique constraint covering the columns `[certificate_id]` on the table `certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "certificate_certificate_id_key" ON "certificate"("certificate_id");
