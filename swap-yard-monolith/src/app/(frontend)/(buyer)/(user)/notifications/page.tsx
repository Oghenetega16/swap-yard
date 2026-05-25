"use client";

import { useNotification } from "@/app/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
  } = useNotification();

  if (loading)
    return (
      <div className="p-8">
        Loading...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto py-10">

      <h1 className="text-2xl font-bold mb-8">
        Notifications
      </h1>

      <div className="space-y-4">

        {notifications.map((item) => (
          <div
            key={item.id}
            className={`
            border rounded-xl p-5
            ${
              !item.read
                ? "bg-muted/40"
                : ""
            }
            `}
          >
            <div className="flex justify-between">

              <h3 className="font-semibold">
                {item.title}
              </h3>

              {!item.read && (
                <span
                  className="
                  text-xs
                  bg-red-500
                  text-white
                  px-2
                  rounded-full
                "
                >
                  New
                </span>
              )}
            </div>

            <p className="mt-2">
              {item.message}
            </p>

            <p className="text-xs text-muted-foreground mt-3">
              {formatDistanceToNow(
                new Date(item.createdAt),
                {
                  addSuffix: true,
                }
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}