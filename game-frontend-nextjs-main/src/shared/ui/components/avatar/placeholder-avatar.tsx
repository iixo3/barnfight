import React from "react";

type PlaceholderAvatarProps = {};

const PlaceholderAvatar: React.FC<PlaceholderAvatarProps> = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-brand-gradient-red-2 to-brand-gradient-green-1 rounded-full"></div>
  );
};
export default PlaceholderAvatar;
