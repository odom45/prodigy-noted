type UserData = {
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  username?: string;
};

export const storage = {
  async upsertUser(data: UserData) {
    // Insert or update user in DB
    return { id: "user-id", ...data };
  },

  async getUser(id: string) {
    // Fetch user from DB
    return { id, username: "exampleUser" };
  },
};
