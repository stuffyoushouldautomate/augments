import React from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { User03Icon } from "@hugeicons/core-free-icons";
import { Role } from "@/types";

interface MessageAvatarProps {
  role: Role;
}

export function MessageAvatar({ role }: MessageAvatarProps) {
  const baseClasses = "flex flex-shrink-0 items-center justify-center rounded-md border border-augments-gray-light-7 bg-augments-gray-light-1 h-[28px] w-[28px]";

  if (role === Role.ASSISTANT) {
    return (
      <div className={baseClasses}>
        <Image
          src="/augments_square.svg"
          alt="augments"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <HugeiconsIcon
        icon={User03Icon}
        className="text-augments-gray-dark-9 w-4 h-4"
      />
    </div>
  );
}