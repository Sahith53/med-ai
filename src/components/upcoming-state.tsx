import { BanIcon, VideoIcon } from "lucide-react";
import EmptyState from "./empty-state";
import { Button } from "./ui/button";
import Link from "next/link";

interface Props {
  meetingId: string;
  // onCancelMeeting: () => void;
  // isCancelling: boolean;
}

export const UpcomingState = ({
  // isCancelling,
  meetingId,
}: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/upcoming.svg"
        title="Not started yet"
        description="Once you start this meeting, a summary will appear here"
      />
      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
        {/* <Button
          variant="secondary"
          onClick={onCancelMeeting}
          disabled={isCancelling}
          className="w-full lg:w-auto"
        >
          <BanIcon />
          Cancel meeting
        </Button> */}
        <Button className="w-full lg:w-auto" asChild>
          <Link href={`/call/${meetingId}`}>
            <VideoIcon />
            Start meeting
          </Link>
        </Button>
      </div>
    </div>
  );
};
