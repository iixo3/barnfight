export const useGetUserProfile = () => {
  const user = {
    name: "John",
    email: "user@example.com",
  };

  let avatar_url;

  // get image user
  const getImageUser = null;

  if (getImageUser) {
    avatar_url = getImageUser;
  } else {
    avatar_url = "";
  }

  return {
    ...user,
    avatar_url,
  };
};
