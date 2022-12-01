export type CardDataType = {
  id: string;
  originalLangValue: { media?: string; text: string };
  secondLangValue: string;
}
export const Card = (props: {
  data: CardDataType
}) => {
  return (
    <div onClick={() => {}}>
      <div>{props.data.originalLangValue.text}</div>
      <div>{props.data.secondLangValue}</div>
    </div>
  );
};
