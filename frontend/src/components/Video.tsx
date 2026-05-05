import {Progress} from "@/components/ui/progress.tsx";
import {Item, ItemContent, ItemDescription, ItemMedia, ItemTitle} from "@/components/ui/item.tsx";

type VideoProps = {
    id: string,
    title: string,
    author: string,
    duration: number,
    progress: number,
}

export default function Video({id, title, author, duration, progress}: VideoProps) {
    return (
        <Item variant="outline" role="listitem">
            <ItemMedia variant="image">
                <img
                    src={`https://i.ytimg.com/vi/${id}/sddefault.jpg`}
                    alt={title}
                    width={32}
                    height={32}
                    className="object-cover"
                />
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="line-clamp-1">
                    {title}
                </ItemTitle>
                <ItemDescription>
                    {author}
                </ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
                <ItemDescription>{
                    `${Math.floor(duration/60)}:${duration - (Math.floor(duration/60) * 60)}`

                //TODO:     ADD STATUS CHECKMARK OR CROSS
                }</ItemDescription>
            </ItemContent>
            <Progress value={progress}/>
        </Item>
    );
}