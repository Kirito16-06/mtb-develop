export default function calculateProfileCompletion(profileData: any): number {
  const fieldsToCheck = [
    "name",
    "businessInfo",
    "missionStatement",
    "goals",
    "keyOfferings",
    "achievements",
    "email",
    "phone",
    "website",
    "featuredWorkTitle",
    "featuredWorkDesc",
    "featuredWorkImage",
    "priorityContactLink",
  ];
  const totalFields = fieldsToCheck.length + 1; // +1 for socialHandles

  const filledFields = fieldsToCheck.filter(
    (field) => profileData[field] && profileData[field] !== ""
  ).length;

  const socialFilled =
    profileData.socialHandles &&
    Object.values(profileData.socialHandles).some(
      (value) => value && value !== ""
    );

  return Math.round(
    ((filledFields + (socialFilled ? 1 : 0)) / totalFields) * 100
  );
}
