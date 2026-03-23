import Image from "next/image";
import React from "react";

interface Props {
  title: string;
  description: string;
  image?: string;
}

const EmptyState = ({ description, title, image = "/empty.svg" }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src={image}
        alt="empty"
        width={240}
        height={240}
        className="object-cover"
      />
      <div className="flex flex-col gap-y-6 max-w-md mx-auto  text-center">
        <h6 className="text-lg font-medium">{title}</h6>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;
