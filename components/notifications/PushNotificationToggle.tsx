/**
 * PushNotificationToggle Component
 *
 * A UI component that allows users to enable or disable push notifications.
 * Can be rendered as either a button or a switch.
 */
import { useState } from "react";
import usePushNotifications from "@/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BellIcon, BellOffIcon } from "lucide-react";

interface PushNotificationToggleProps {
  label?: string;
  hideLabel?: boolean;
  variant?: "default" | "switch";
}

export default function PushNotificationToggle({
  label = "Browser Notifications",
  hideLabel = false,
  variant = "default",
}: PushNotificationToggleProps) {
  // Get push notification state and functions from the hook
  const { isPushSupported, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();
  const [processing, setProcessing] = useState(false);

  // Don't render anything if push notifications aren't supported
  if (!isPushSupported) {
    return null;
  }

  // Handle toggling the subscription state
  const handleToggle = async () => {
    try {
      setProcessing(true);
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error("Error toggling push notifications:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Switch variant
  if (variant === "switch") {
    return (
      <div className="flex items-center justify-between space-x-2">
        {!hideLabel && <span className="text-sm font-medium">{label}</span>}
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading || processing}
          aria-label="Toggle push notifications"
        />
      </div>
    );
  }

  // Default button variant
  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading || processing}
      className="gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOffIcon className="h-4 w-4" />
          {!hideLabel && <span>Disable Notifications</span>}
        </>
      ) : (
        <>
          <BellIcon className="h-4 w-4" />
          {!hideLabel && <span>Enable Notifications</span>}
        </>
      )}
    </Button>
  );
}
