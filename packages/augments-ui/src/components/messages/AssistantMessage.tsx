import React from "react";
import { GroupedMessages, TaskStatus } from "@/types";
import { MessageAvatar } from "./MessageAvatar";
import { MessageContent } from "./content/MessageContent";
import { isToolResultContentBlock, isImageContentBlock } from "@augments/shared";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AssistantMessageProps {
  group: GroupedMessages;
  taskStatus: TaskStatus;
  messageIdToIndex: Record<string, number>;
}

export function AssistantMessage({
  group,
  taskStatus,
  messageIdToIndex,
}: AssistantMessageProps) {
  return (
    <div className={
      cn(
        "bg-augments-gray-light-3 flex items-start justify-start gap-2 px-4 py-3 border-x border-augments-gray-light-7",
        ![TaskStatus.RUNNING, TaskStatus.NEEDS_HELP].includes(taskStatus) && !group.take_over && "border-b border-augments-gray-light-7 rounded-b-lg"
      )}
    >
      <MessageAvatar role={group.role} />

      {group.take_over ? (
        <div className="border-augments-gray-light-a6 bg-augments-gray-light-a1 w-full rounded-2xl border p-2">
          <div className="flex items-center gap-2">
            <Image
              src="/indicators/indicator-pink.png"
              alt="User control status"
              width={15}
              height={15}
            />
            <p className="text-augments-gray-light-12 text-[12px] font-medium">
              You took control
            </p>
          </div>
          <div className="bg-augments-gray-light-2 mt-2 space-y-0.5 rounded-2xl p-1">
            {group.messages.map((message) => (
              <div
                key={message.id}
                data-message-index={messageIdToIndex[message.id]}
              >
                {/* Render hidden divs for each screenshot block */}
                {message.content.map((block, blockIndex) => {
                  if (
                    isToolResultContentBlock(block) &&
                    block.content &&
                    block.content.length > 0
                  ) {
                    // Check ALL content items in the tool result, not just the first one
                    const markers: React.ReactNode[] = [];
                    block.content.forEach((contentItem, contentIndex) => {
                      if (isImageContentBlock(contentItem)) {
                        markers.push(
                          <div
                            key={`${blockIndex}-${contentIndex}`}
                            data-message-index={messageIdToIndex[message.id]}
                            data-block-index={blockIndex}
                            data-content-index={contentIndex}
                            style={{
                              position: "absolute",
                              width: 0,
                              height: 0,
                              overflow: "hidden",
                            }}
                          />
                        );
                      }
                    });
                    return markers;
                  }
                  return null;
                })}
                <MessageContent
                  content={message.content}
                  isTakeOver={message.take_over}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {group.messages.map((message) => (
            <div
              key={message.id}
              data-message-index={messageIdToIndex[message.id]}
            >
              {/* Render hidden divs for each screenshot block */}
              {message.content.map((block, blockIndex) => {
                if (
                  isToolResultContentBlock(block) &&
                  !block.is_error &&
                  block.content &&
                  block.content.length > 0
                ) {
                  // Check ALL content items in the tool result, not just the first one
                  const markers: React.ReactNode[] = [];
                  block.content.forEach((contentItem, contentIndex) => {
                    if (isImageContentBlock(contentItem)) {
                      markers.push(
                        <div
                          key={`${blockIndex}-${contentIndex}`}
                          data-message-index={messageIdToIndex[message.id]}
                          data-block-index={blockIndex}
                          data-content-index={contentIndex}
                          style={{
                            position: "absolute",
                            width: 0,
                            height: 0,
                            overflow: "hidden",
                          }}
                        />
                      );
                    }
                  });
                  return markers;
                }
                return null;
              })}
              <MessageContent
                content={message.content}
                isTakeOver={message.take_over}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
