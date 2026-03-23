"use client";

import React, { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  useCreateChatClient,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import LoadingState from "@/components/loading-state";

import "stream-chat-react/dist/css/v2/index.css";

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string | undefined;
}

const ChatUI = ({
  meetingId,
  meetingName,
  userId,
  userImage,
  userName,
}: Props) => {
  const trpc = useTRPC();
  const { mutateAsync: generateChatToken } = useMutation(
    trpc.meetings.generateChatToken.mutationOptions()
  );

  const [channel, setChannel] = useState<StreamChannel | null>(null);

  const client = useCreateChatClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
    tokenOrProvider: generateChatToken,
    userData: {
      id: userId,
      name: userName,
      image: userImage,
    },
  });

  useEffect(() => {
    if (!client) return;

    let isMounted = true;
    let channelInstance: StreamChannel | null = null;

    const init = async () => {
      const ch = client.channel("messaging", meetingId, {
        members: [userId],
      });

      await ch.watch();

      if (isMounted) {
        channelInstance = ch;
        setChannel(ch);
      }
    };

    init();

    return () => {
      isMounted = false;
      
      // Only stop watching when component unmounts, not on every re-render
      if (channelInstance) {
        channelInstance.stopWatching().catch(() => {
          // Silently handle errors during cleanup
        });
      }
    };
  }, [client, meetingId, userId]); // Removed 'channel' from dependencies

  if (!client || !channel) {
    return (
      <LoadingState
        title="Loading Chat"
        description="This may take a few seconds"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-23rem)] border-b">
              <MessageList />
            </div>
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatUI;