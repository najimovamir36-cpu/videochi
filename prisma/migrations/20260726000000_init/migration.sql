-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "mimeType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "thumbnailColor" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "clipCount" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'English',
    "thumbnailColor" TEXT NOT NULL,
    "transcript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clips" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "aspectRatio" TEXT NOT NULL DEFAULT '9:16',
    "hasCaptions" BOOLEAN NOT NULL DEFAULT false,
    "speakerCount" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exports" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clipId" TEXT,
    "projectTitle" TEXT NOT NULL,
    "clipTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "resolution" TEXT NOT NULL DEFAULT '1080p',
    "aspectRatio" TEXT NOT NULL DEFAULT '9:16',
    "size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage" (
    "ownerId" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "creditsTotal" INTEGER NOT NULL DEFAULT 0,
    "storageUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storageTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minutesProcessed" INTEGER NOT NULL DEFAULT 0,
    "minutesIncluded" INTEGER NOT NULL DEFAULT 0,
    "renderMinutesUsed" INTEGER NOT NULL DEFAULT 0,
    "renderMinutesTotal" INTEGER NOT NULL DEFAULT 0,
    "resetsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("ownerId")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "number" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "periodLabel" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "uploads_ownerId_idx" ON "uploads"("ownerId");

-- CreateIndex
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "projects_uploadId_idx" ON "projects"("uploadId");

-- CreateIndex
CREATE INDEX "clips_projectId_idx" ON "clips"("projectId");

-- CreateIndex
CREATE INDEX "exports_ownerId_idx" ON "exports"("ownerId");

-- CreateIndex
CREATE INDEX "exports_projectId_idx" ON "exports"("projectId");

-- CreateIndex
CREATE INDEX "notifications_ownerId_idx" ON "notifications"("ownerId");

-- CreateIndex
CREATE INDEX "invoices_ownerId_idx" ON "invoices"("ownerId");

-- CreateIndex
CREATE INDEX "payment_methods_ownerId_idx" ON "payment_methods"("ownerId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clips" ADD CONSTRAINT "clips_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "clips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

