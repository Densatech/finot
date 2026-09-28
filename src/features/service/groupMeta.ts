// Group names come from the backend in Amharic; map known ones to translation keys and photos.
const GROUP_KEYS: Record<string, string> = {
  "ትምህርት ክፍል": "group_teaching_name",
  "አባላት እና እንክብካቤ ክፍል": "group_membership_name",
  "ልማት ክፍል": "group_development_name",
  "መዝሙር ክፍል": "group_choir_name",
  "ሙያ እና ተራድኦ": "group_professional_name",
  "ቁዋንቁዋና ልዩ ልዩ ክፍል": "group_language_name",
  "ሂሳብ ክፍል": "group_finance_name",
  "ኦዲት ክፍል": "group_audit_name",
  "ባች እና መርሃግብር": "group_batch_name",
  "መረጃ እና ክትትል ክፍል": "group_media_name",
};

const GROUP_IMAGES: Record<string, string> = {
  group_teaching_name: "/images/service-groups/t1.webp",
  group_membership_name: "/images/service-groups/a1.webp",
  group_development_name: "/images/service-groups/l4.webp",
  group_choir_name: "/images/service-groups/m4.webp",
  group_professional_name: "/images/service-groups/my2.webp",
  group_language_name: "/images/service-groups/group1.webp",
  group_finance_name: "/images/service-groups/group2.webp",
  group_audit_name: "/images/service-groups/group3.webp",
  group_batch_name: "/images/service-groups/group4.webp",
  group_media_name: "/images/service-groups/group5.webp",
};

export function groupLabelKey(name: string): string | undefined {
  return GROUP_KEYS[name];
}

export function groupImage(name: string): string {
  const key = GROUP_KEYS[name];
  return (key && GROUP_IMAGES[key]) || "/images/service-groups/group1.webp";
}
