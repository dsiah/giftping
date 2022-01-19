import { GiftRequest } from "../types/gift";

export function buildPostGiftQuery({
  author,
  title,
  description,
  recipient,
  date,
  file,
}: GiftRequest) {
  return {
    text: "INSERT INTO gifts_rd.gifts_rd(author, title, description, recipient, date, file) VALUES($1, $2, $3, $4, $5, $6) RETURNING gid;",
    values: [author, title, description, recipient, date ? date : null , file]
  };
}

export function buildGetGiftQuery(giftId: number) {
  return {
    text: "SELECT * FROM gifts_rd.gifts_rd WHERE gid=$1;",
    values: [giftId],
  };
}

export function buildGetGiftQueryByAuthor(authorId: string) {
  return {
    text: "SELECT * from gifts_rd.gifts_rd where author=$1 LIMIT 100;",
    values: [authorId],
  };
}

export function buildDeleteGiftQuery(giftId: number) {
  return {
    text: "DELETE FROM gifts_rd.gifts_rd WHERE gid=$1;",
    values: [giftId],
  };
}
