import { Statement } from "../../entities/Statement";

export type ICreateTransferStatementDTO =
Pick<
  Statement,
  'sender_id'|
  'user_id' |
  'description' |
  'amount' |
  'type'
>
