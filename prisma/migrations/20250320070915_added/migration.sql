-- CreateTable
CREATE TABLE "UserBusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessInfo" TEXT,
    "missionStatement" TEXT,
    "goals" TEXT,
    "keyOfferings" TEXT,
    "achievements" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "socialHandles" JSONB,
    "isSpotlight" BOOLEAN NOT NULL DEFAULT false,
    "spotlightExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBusinessProfile_userId_key" ON "UserBusinessProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBusinessProfile_email_key" ON "UserBusinessProfile"("email");

-- AddForeignKey
ALTER TABLE "UserBusinessProfile" ADD CONSTRAINT "UserBusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
