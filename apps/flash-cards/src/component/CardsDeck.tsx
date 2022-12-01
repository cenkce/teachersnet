import { memo } from "react";
import { Card, CardDataType } from "./Card"
export type CardsDeckDataType = CardDataType[];

export const CardsDeck = memo<{deck: CardsDeckDataType}>((props) => {
  return <>{props.deck.map((cardData) => <Card key={cardData.id} data={cardData}></Card>)}</>
})
