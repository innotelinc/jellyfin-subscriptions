-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Signup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'started',
    "desiredUsername" TEXT,
    "notes" TEXT,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "approverEmail" TEXT,
    "stripeCustomerId" TEXT,
    "stripeCheckoutId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "currentPeriodEnd" DATETIME,
    "jfaInviteCode" TEXT,
    "jfaInviteUrl" TEXT,
    "jellyfinUserId" TEXT,
    "jellyfinUsername" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Signup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SignupEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signupId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SignupEvent_signupId_fkey" FOREIGN KEY ("signupId") REFERENCES "Signup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_stripeCustomerId_key" ON "Signup"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_stripeCheckoutId_key" ON "Signup"("stripeCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_stripeSubscriptionId_key" ON "Signup"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Signup_jellyfinUserId_key" ON "Signup"("jellyfinUserId");
