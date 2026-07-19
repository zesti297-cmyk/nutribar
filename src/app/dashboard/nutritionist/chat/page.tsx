import { NutritionistChat } from "@/components/nutritionist-chat";
import { getConversationsForNutritionist } from "@/lib/chat";
import { requireProfile } from "@/lib/profile";

export default async function NutritionistChatPage() {
  const profile = await requireProfile("nutritionist");
  const conversations = await getConversationsForNutritionist(profile.id);

  return <NutritionistChat conversations={conversations} />;
}
