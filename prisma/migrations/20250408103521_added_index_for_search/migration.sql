-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "UserBusinessProfile_name_businessInfo_missionStatement_goal_idx" ON "UserBusinessProfile"("name", "businessInfo", "missionStatement", "goals", "achievements", "keyOfferings");
