import { ITaskAuthor } from "../model.typing";

const taskAuthor: ITaskAuthor = {
  id: "",
  databaseId: 0,
  fullName: "",
  itvAvatar: "",
  profileURL: "",
  authorReviewsCount: 0,
  organizationName: "",
  organizationDescription: "",
  organizationLogo: "",
  isPartner: false,
};

export const queriedFields = Object.keys(taskAuthor) as Array<
  keyof ITaskAuthor
>;
