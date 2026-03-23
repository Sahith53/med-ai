import React from "react";
import { MeetingGetOne } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  BookOpenTextIcon,
  FileTextIcon,
  FileVideoIcon,
  SparklesIcon,
  ClockFadingIcon,
} from "lucide-react";
import VideoPlayer from "next-video";
import Markdown from "react-markdown";
import Link from "next/link";
import GeneratedAvatar from "@/components/generated-avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "./columns";
import Transcript from "./transcript";
import { ChatProvider } from "./chat-provider";

interface Props {
  data: MeetingGetOne;
}

const CompletedState = ({ data }: Props) => {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="summary">
        <div className="bg-white rounded-lg border px-3">
          <ScrollArea>
            <TabsList className="p-0 bg-background justify-start rounded-none h-13">
              <TabsTrigger
                value="summary"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <BookOpenTextIcon /> Summary
              </TabsTrigger>
              <TabsTrigger
                value="transcript"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <FileTextIcon /> Transcript
              </TabsTrigger>
              <TabsTrigger
                value="recording"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <FileVideoIcon /> Recording
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <SparklesIcon /> Ask AI
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <TabsContent value="chat">
          <ChatProvider meetingId={data.id} meetingName={data.name} />
        </TabsContent>

        <TabsContent value="recording">
          <div className="bg-white rounded-lg border p-8">
            <VideoPlayer src={data.recordingUrl!} playsInline />
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Transcript meetingId={data.id} />
        </TabsContent>

        <TabsContent value="summary">
          <div className="bg-white rounded-lg border">
            <div className="p-8 gap-y-5 flex flex-col col-span-5">
              <h2 className="text-2xl font-medium capitalize">{data.name}</h2>
              <div className="flex gap-x-2 items-center">
                <Link
                  href={`/agents/${data.agent.id}`}
                  className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                >
                  <GeneratedAvatar
                    variant="botttsNeutral"
                    seed={data.agent.name}
                    className="size-5"
                  />
                  {data.agent.name}
                </Link>{" "}
                <p>{data.startedAt ? format(data.startedAt, "PPP") : ""}</p>
              </div>
              <div className="flex gap-x-2 items-center">
                <SparklesIcon className="size-4" />
                <p>General summary</p>
              </div>
              <Badge
                variant="outline"
                className="flex items-center gap-x-2 [&>svg]:size-4"
              >
                <ClockFadingIcon className="text-blue-700" />
                {data.duration ? formatDuration(data.duration) : "No Duration"}
              </Badge>
              <Markdown
                components={{
                  h1: (props) => (
                    <h1 className="text-2xl font-medium " {...props} />
                  ),
                  h2: (props) => (
                    <h2 className="text-xl font-medium " {...props} />
                  ),
                  h3: (props) => (
                    <h3 className="text-lg font-medium " {...props} />
                  ),
                  h4: (props) => (
                    <h4 className="text-base font-medium " {...props} />
                  ),
                  p: (props) => <p className="leading-relaxed" {...props} />,
                  strong: (props) => (
                    <strong className="font-semibold" {...props} />
                  ),
                  ul: (props) => (
                    <ul className="list-disc list-inside mb-2" {...props} />
                  ),
                  ol: (props) => (
                    <ol className="list-decimal list-inside mb-2" {...props} />
                  ),
                  li: (props) => <li className="mb-1" {...props} />,
                }}
              >
                {data.summary}
              </Markdown>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompletedState;
